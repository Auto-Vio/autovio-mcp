# AutoVio MCP Server

Server that lets you use the AutoVio API over the **Model Context Protocol (MCP)**. Compatible with Claude Desktop, Cursor IDE, and other MCP clients.

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Configuration

Config is loaded from four sources; **priority: CLI parameters > environment variables > config file > defaults**.

**CLI parameters** — AutoVio connection plus the four AI pairs (model name + API key). Provider is derived from the model name:

| Parameter | Description |
|-----------|--------------|
| `--config` | Path to config JSON file |
| `--autovio-base-url` | AutoVio API base URL |
| `--autovio-api-token` | AutoVio API token |
| **Video Analysis** | |
| `--vision-model` | Model name (e.g. gemini-2.0-flash-exp) |
| `--vision-api-key` | API key |
| **LLM** | |
| `--llm-model` | Model name (e.g. gemini-2.5-flash) |
| `--llm-api-key` | API key |
| **Image Generate** | |
| `--image-model` | Model name (e.g. gemini-2.5-flash-image) |
| `--image-api-key` | API key |
| **Video Generate** | |
| `--video-model` | Model name (e.g. veo-3.0-generate-001) |
| `--video-api-key` | API key |
| `--log-level` | `debug` \| `info` \| `warn` \| `error` |
| `--enable-resources` | `true` \| `false` |
| `--enable-prompts` | `true` \| `false` |

CamelCase (e.g. `--autovioBaseUrl`) is also accepted.

**Environment variables:** `AUTOVIO_BASE_URL`, `AUTOVIO_API_TOKEN`, `AUTOVIO_VISION_MODEL`, `AUTOVIO_VISION_API_KEY`, `AUTOVIO_LLM_MODEL`, `AUTOVIO_LLM_API_KEY`, `AUTOVIO_IMAGE_MODEL`, `AUTOVIO_IMAGE_API_KEY`, `AUTOVIO_VIDEO_MODEL`, `AUTOVIO_VIDEO_API_KEY`, `AUTOVIO_LOG_LEVEL`, `AUTOVIO_MCP_CONFIG`.

Example config file: `examples/config.example.json`

### Running

```bash
# Default (env or default baseUrl/token)
node dist/index.js

# With config file
node dist/index.js --config examples/config.example.json

# Development (watch)
npm run dev
```

### Claude Desktop

You can pass all config values as CLI arguments. Example: `examples/claude-desktop-config.json`

```json
{
  "mcpServers": {
    "autovio": {
      "command": "node",
      "args": [
        "/absolute/path/to/AutoVio-MCP/dist/index.js",
        "--autovio-base-url", "http://localhost:3001",
        "--autovio-api-token", "YOUR_TOKEN",
        "--vision-model", "gemini-2.0-flash-exp",
        "--vision-api-key", "YOUR_VISION_KEY",
        "--llm-model", "gemini-2.5-flash",
        "--llm-api-key", "YOUR_LLM_KEY",
        "--image-model", "gemini-2.5-flash-image",
        "--image-api-key", "YOUR_IMAGE_KEY",
        "--video-model", "veo-3.0-generate-001",
        "--video-api-key", "YOUR_VIDEO_KEY"
      ]
    }
  }
}
```

Using only environment variables also works:

```json
{
  "mcpServers": {
    "autovio": {
      "command": "node",
      "args": ["/path/to/AutoVio-MCP/dist/index.js"],
      "env": {
        "AUTOVIO_BASE_URL": "http://localhost:3001",
        "AUTOVIO_API_TOKEN": "your-token",
        "AUTOVIO_LLM_API_KEY": "your-llm-key"
      }
    }
  }
}
```

## Available Tools

- **autovio_health** — API health check
- **autovio_auth_login** — Login (email, password)
- **autovio_auth_register** — New user registration
- **autovio_auth_me** — Current user info
- **autovio_projects_list** — List projects
- **autovio_projects_create** — Create project
- **autovio_projects_get** — Get project details
- **autovio_projects_update** — Update project
- **autovio_projects_delete** — Delete project
- **autovio_works_list** — List works
- **autovio_works_create** — Create work
- **autovio_works_get** — Get work details
- **autovio_works_update** — Update work
- **autovio_works_delete** — Delete work
- **autovio_works_apply_template** — Apply template to work
- **autovio_ai_analyze_video** — Reference video analysis (base64 video)
- **autovio_ai_generate_scenario** — Scenario generation (intent + analysis)
- **autovio_ai_generate_scenario_for_work** — Generate scenario for work
- **autovio_ai_generate_image** — Image generation
- **autovio_ai_generate_video** — Video generation from image
- **autovio_ai_generate_scene** — Image + video for a single scene
- **autovio_providers_list** — List available AI providers
- **autovio_templates_list** — List templates
- **autovio_templates_get** — Get template details
- **autovio_templates_create** — Create template
- **autovio_templates_update** — Update template
- **autovio_templates_delete** — Delete template

For full API and tool details, see the AutoVio OpenAPI spec in the main AutoVio backend or the **AutoVio-Docs** documentation (MCP section).

## Requirements

- Node.js >= 18
- Access to the AutoVio API (baseUrl + apiToken, or login via auth tools)

## License

MIT
