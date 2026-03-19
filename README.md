# AutoVio MCP Server

[![npm version](https://img.shields.io/npm/v/autovio-mcp)](https://www.npmjs.com/package/autovio-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <img src="./autovio-mcp-demo.gif" alt="AutoVio MCP Demo" width="800">
</p>

MCP server for the **AutoVio** AI video generation pipeline. Connects Claude Code, Claude Desktop, Cursor, and any MCP-compatible client to the AutoVio API — no clone or build required.

## Installation

No installation needed. Use `npx` to run the server directly:

```bash
npx autovio-mcp --autovio-base-url http://localhost:3001 --autovio-api-token YOUR_TOKEN
```

Or install globally:

```bash
npm install -g autovio-mcp
autovio-mcp --autovio-base-url http://localhost:3001 --autovio-api-token YOUR_TOKEN
```

## Quick Start

### Claude Code

```bash
claude mcp add autovio-mcp -- npx -y autovio-mcp \
  --autovio-base-url http://localhost:3001 \
  --autovio-api-token YOUR_TOKEN \
  --llm-model gemini-2.5-flash \
  --llm-api-key YOUR_KEY \
  --image-model gemini-2.5-flash-image \
  --image-api-key YOUR_KEY \
  --video-model veo-3.0-generate-001 \
  --video-api-key YOUR_KEY
```

### Claude Desktop / Cursor

Add to your `claude_desktop_config.json` (or equivalent MCP config):

```json
{
  "mcpServers": {
    "autovio": {
      "command": "npx",
      "args": [
        "-y", "autovio-mcp",
        "--autovio-base-url", "http://localhost:3001",
        "--autovio-api-token", "YOUR_TOKEN",
        "--llm-model", "gemini-2.5-flash",
        "--llm-api-key", "YOUR_KEY",
        "--image-model", "gemini-2.5-flash-image",
        "--image-api-key", "YOUR_KEY",
        "--video-model", "veo-3.0-generate-001",
        "--video-api-key", "YOUR_KEY"
      ]
    }
  }
}
```

## Configuration

Config is loaded from four sources in priority order: **CLI flags > environment variables > config file > defaults**.

### CLI flags

| Flag | Description |
|------|-------------|
| `--autovio-base-url` | AutoVio API base URL (default: `http://localhost:3001`) |
| `--autovio-api-token` | AutoVio API token |
| `--config` | Path to a JSON config file |
| `--vision-model` | Vision model (e.g. `gemini-2.0-flash-exp`) |
| `--vision-api-key` | Vision API key |
| `--llm-model` | LLM model (e.g. `gemini-2.5-flash`) |
| `--llm-api-key` | LLM API key |
| `--image-model` | Image model (e.g. `gemini-2.5-flash-image`) |
| `--image-api-key` | Image API key |
| `--video-model` | Video model (e.g. `veo-3.0-generate-001`) |
| `--video-api-key` | Video API key |
| `--log-level` | `debug` \| `info` \| `warn` \| `error` |
| `--enable-resources` | `true` \| `false` |
| `--enable-prompts` | `true` \| `false` |

CamelCase variants (e.g. `--autovioBaseUrl`) are also accepted.

### Environment variables

```
AUTOVIO_BASE_URL        AUTOVIO_API_TOKEN
AUTOVIO_VISION_MODEL    AUTOVIO_VISION_API_KEY
AUTOVIO_LLM_MODEL       AUTOVIO_LLM_API_KEY
AUTOVIO_IMAGE_MODEL     AUTOVIO_IMAGE_API_KEY
AUTOVIO_VIDEO_MODEL     AUTOVIO_VIDEO_API_KEY
AUTOVIO_LOG_LEVEL       AUTOVIO_MCP_CONFIG
```

### Config file

Pass a JSON file with `--config path/to/config.json`. See `examples/config.example.json` for the full structure.

## Available Tools

| Tool | Description |
|------|-------------|
| `autovio_health` | API health check |
| `autovio_auth_login` | Login (email + password) |
| `autovio_auth_register` | Register new user |
| `autovio_auth_me` | Current user info |
| `autovio_projects_list` | List projects |
| `autovio_projects_create` | Create project |
| `autovio_projects_get` | Get project details |
| `autovio_projects_update` | Update project |
| `autovio_projects_delete` | Delete project |
| `autovio_works_list` | List works |
| `autovio_works_create` | Create work |
| `autovio_works_get` | Get work details |
| `autovio_works_update` | Update work |
| `autovio_works_delete` | Delete work |
| `autovio_works_apply_template` | Apply template to work |
| `autovio_ai_analyze_video` | Analyze reference video for style/tone |
| `autovio_ai_generate_scenario` | Generate scene-by-scene scenario |
| `autovio_ai_generate_scenario_for_work` | Generate scenario attached to a work |
| `autovio_ai_generate_image` | Generate image from prompt |
| `autovio_ai_generate_video` | Animate image into video clip |
| `autovio_ai_generate_scene` | Generate image + video for one scene |
| `autovio_providers_list` | List available AI providers |
| `autovio_templates_list` | List templates |
| `autovio_templates_get` | Get template details |
| `autovio_templates_create` | Create template |
| `autovio_templates_update` | Update template |
| `autovio_templates_delete` | Delete template |

## Requirements

- Node.js >= 18
- A running [AutoVio](https://github.com/Auto-Vio/autovio) backend
- An AutoVio API token (or use `autovio_auth_login` to get one)
- API keys for the AI providers you want to use

## Links

- [AutoVio](https://github.com/Auto-Vio/autovio) — core platform
- [Documentation](https://auto-vio.github.io/autovio-docs/mcp/overview/) — full MCP setup guide and tool reference
- [npm](https://www.npmjs.com/package/autovio-mcp)

## License

MIT
