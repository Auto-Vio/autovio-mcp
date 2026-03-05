/**
 * Provider MCP tools: list available AI providers and models
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AutoVioClient } from "../client/autovio-client.js";
import { ToolExecutionError, formatErrorDetail } from "../utils/errors.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

export function registerProviderTools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_providers_list",
    {
      description: "List available AI providers and models. Categories: vision (video analysis), llm (scenario), image (image generation), video (video generation).",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.providers_list();
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_providers_list", formatErrorDetail(err), err);
      }
    }
  );
}
