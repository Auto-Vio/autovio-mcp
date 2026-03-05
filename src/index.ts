#!/usr/bin/env node
/**
 * AutoVio MCP Server - Entry point
 * Starts the MCP server with stdio transport.
 */

import { loadConfig } from "./config/schema.js";
import { setLogLevel } from "./utils/logger.js";

async function main(): Promise<void> {
  const config = await loadConfig();
  setLogLevel(config.features.logLevel);
  const { startServer } = await import("./server.js");
  await startServer(config);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
