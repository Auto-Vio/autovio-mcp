/**
 * Default configuration values for AutoVio MCP Server
 */

import type { AutoVioMCPConfig } from "./types.js";

export const defaultConfig: Partial<AutoVioMCPConfig> = {
  server: {
    name: "autovio-mcp-server",
    version: "1.0.0",
  },
  autovio: {
    baseUrl: "http://localhost:3001",
    apiToken: "",
  },
  providers: {
    vision: { model: "gemini-2.0-flash-exp", apiKey: "" },
    llm: { model: "gemini-2.5-flash", apiKey: "" },
    image: { model: "gemini-2.5-flash-image", apiKey: "" },
    video: { model: "veo-3.0-generate-001", apiKey: "" },
  },
  features: {
    enableResources: true,
    enablePrompts: true,
    cacheResponses: false,
    logLevel: "info",
  },
};
