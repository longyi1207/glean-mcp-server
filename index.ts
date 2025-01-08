#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from 'node-fetch';
import process from 'node:process';

const GLEAN_API_KEY = process.env.GLEAN_API_KEY!;
const GLEAN_DOMAIN = process.env.GLEAN_DOMAIN!;

type Fragment = {
  text?: string;
};

type Citation = {
  sourceDocument?: { title?: string; url?: string };
  sourcePerson?: { name?: string };
};

type Message = {
  messageType?: string;
  fragments?: Fragment[];
  citations?: Citation[];
};

type ApiResponse = {
  messages?: Message[];
};

// Define the search tool
const SEARCH_TOOL: Tool = {
  name: "search",
  description: "Tool to perform search queries using Glean API",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The query to perform retrieval on" },
    },
    required: ["query"],
  },
};

// Define the ChatGPT tool
const CHATGPT_TOOL: Tool = {
  name: "chat",
  description: "Tool to interact with ChatGPT using Glean API",
  inputSchema: {
    type: "object",
    properties: {
      message: { type: "string", description: "The message to send to ChatGPT" },
    },
    required: ["message"],
  },
};

// Server setup
const server = new Server(
  {
    name: "glean-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {
        search: SEARCH_TOOL,
        chatgpt: CHATGPT_TOOL,
      },
    },
  },
);

// Request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SEARCH_TOOL, CHATGPT_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "search") {
    const { query } = args as Record<string, any>;
    try {
      const response = await fetch(`https://${GLEAN_DOMAIN}-be.glean.com/rest/api/v1/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GLEAN_API_KEY}`,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error occurred: ${error}` }],
      };
    }
  } else if (name === "chat") {
    const { message } = args as Record<string, any>;
    const response = await fetch(`https://${GLEAN_DOMAIN}-be.glean.com/rest/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLEAN_API_KEY}`,
      },
      body: JSON.stringify({
        stream: false, 
        messages: [{
          author: 'USER',
          fragments: [{ text: message }]
        }],
      }),
    });

    if (response.ok) {
      const data: unknown = await response.json();
  
      // Validate and typecast `data`
      if (typeof data === 'object' && data !== null && 'messages' in data) {
        const apiResponse = data as ApiResponse;
        const messages = apiResponse.messages || [];
        let result = '';
  
        for (const message of messages) {
          if (message.messageType === 'CONTENT') {
            message.fragments?.forEach((fragment: Fragment) => {
              result += fragment.text || '';
            });
  
            if (message.citations?.length) {
              result += '\nSources:\n';
              message.citations.forEach((citation: Citation, idx: number) => {
                if (citation.sourceDocument?.title && citation.sourceDocument?.url) {
                  result += `Source ${idx + 1}: ${citation.sourceDocument.title} (${citation.sourceDocument.url})\n`;
                }
                if (citation.sourcePerson?.name) {
                  result += `Source ${idx + 1}: ${citation.sourcePerson.name}\n`;
                }
              });
            }
          }
        }
  
        return {
          content: [{ type: 'text', text: result }],
        };
      } else {
        throw new Error('Unexpected API response structure');
      }
    } else {
      const errorText = await response.text();
      return {
        content: [{ type: 'text', text: `Error: ${response.status} - ${errorText}` }],
        isError: true,
      };
    }
  } 
  else {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }
});

// Server startup
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Glean Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
