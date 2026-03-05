/**
 * MCP server setup: create server, register tools/resources/prompts, connect transport
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { AutoVioMCPConfig } from "./config/types.js";
import { AutoVioClient } from "./client/autovio-client.js";
import { registerHealthTools } from "./tools/health-tools.js";
//import { registerAuthTools } from "./tools/auth-tools.js";
import { registerProjectTools } from "./tools/project-tools.js";
import { registerWorkTools } from "./tools/work-tools.js";
import { registerAITools } from "./tools/ai-tools.js";
import { registerProviderTools } from "./tools/provider-tools.js";
import { registerTemplateTools } from "./tools/template-tools.js";
import { logger } from "./utils/logger.js";

export async function startServer(config: AutoVioMCPConfig): Promise<void> {
  const client = new AutoVioClient(config.autovio, config.providers);
  logger.info(`AutoVio client base URL: ${config.autovio.baseUrl}`);

  const capabilities: Record<string, unknown> = {
    tools: {},
  };
  if (config.features.enableResources) capabilities.resources = {};
  if (config.features.enablePrompts) capabilities.prompts = {};

  const mcp = new McpServer(
    {
      name: config.server.name,
      version: config.server.version,
    },
    { capabilities }
  );

  logger.info("Registering MCP tools...");
  registerHealthTools(mcp, client);
  //registerAuthTools(mcp, client);
  registerProjectTools(mcp, client);
  registerWorkTools(mcp, client);
  registerAITools(mcp, client);
  registerProviderTools(mcp, client);
  registerTemplateTools(mcp, client);
  logger.info("Tools registered.");

  const transport = new StdioServerTransport();
  await mcp.connect(transport);
  logger.info("AutoVio MCP Server started (stdio).");
}
