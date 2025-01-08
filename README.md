# Glean

An MCP server implementation that integrates the Glean API, providing the Search and Chat functions.

## Features

- **Search**: List of search results given a query
- **Chat**: Q&A with Chatbot

## Tools

- **search**: Search for a query
- **chat**: Q&A with a chatbot


### Usage with Claude Desktop
Add this to your `claude_desktop_config.json`:

### Docker

```json
{
  "mcpServers": {
    "glean-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GLEAN_API_KEY",
        "-e",
        "GLEAN_DOMAIN",
        "mcp/glean-server"
      ],
      "env": {
        "GLEAN_API_KEY": "YOUR_API_KEY_HERE",
        "GLEAN_DOMAIN": "YOUR_DOMAIN_HERE"
      }
    }
  }
}


{
  "mcpServers": {
    "glean-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GLEAN_API_KEY",
        "-e",
        "GLEAN_DOMAIN",
        "mcp/glean-server"
      ],
      "env": {
        "GLEAN_API_KEY": "YOUR_API_KEY_HERE",
        "GLEAN_DOMAIN": "YOUR_DOMAIN_HERE"
      }
    }
  }
}


```


## Build

Docker build:

```bash
docker build -t mcp/glean-server:latest -f src/glean/Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
