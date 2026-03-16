# @refrase/mcp-server

MCP (Model Context Protocol) server for Refrase prompt optimization.

## Installation

```bash
npm install -g @refrase/mcp-server
```

## Configuration

Add to your MCP config (e.g., Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "refrase": {
      "command": "refrase-mcp-server"
    }
  }
}
```

## Tools

### adapt_prompt

Adapt a prompt for a specific AI model.

**Parameters:**
- `prompt` (required): The system/instruction prompt to adapt
- `model` (required): Target model ID (e.g., "claude-sonnet", "gpt-4o")
- `task`: Task type — extraction, analysis, generation, code, general (default: general)
- `user_prompt`: Optional user prompt to adapt

### list_models

List all supported models grouped by family.

### explain_adaptation

Explain what adaptations are applied for a specific model and why.

**Parameters:**
- `model` (required): Model ID to explain (e.g., "claude-sonnet")
