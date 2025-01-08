# Glean

An MCP server implementation that integrates the Glean API, providing the Search and Chat functions.

## Tools
- **Search**: List of search results given a query
- **Chat**: Q&A with Chatbot

### Usage with Claude Desktop
Build the docker image:
```bash
docker build -t glean-server:latest -f src/glean/Dockerfile .
```

Then add this to your `claude_desktop_config.json`:
```
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
        "glean-server"
      ],
      "env": {
        "GLEAN_API_KEY": "YOUR_API_KEY_HERE",
        "GLEAN_DOMAIN": "YOUR_DOMAIN_HERE"
      }
    }
  }
}
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
