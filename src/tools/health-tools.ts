/**
 * Health check tool
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AutoVioClient } from "../client/autovio-client.js";
import { ToolExecutionError, formatErrorDetail } from "../utils/errors.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

export function registerHealthTools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_health",
    {
      description: "Check if the AutoVio API server is running. Returns status and server timestamp.",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.health();
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_health", formatErrorDetail(err), err);
      }
    }
  );
}
