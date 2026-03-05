/**
 * Authentication MCP tools: login, register, me
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AutoVioClient } from "../client/autovio-client.js";
import { ToolExecutionError, formatErrorDetail } from "../utils/errors.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

export function registerAuthTools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_auth_login",
    {
      description: "Login with email and password. Returns JWT access token (automatically used for subsequent requests) and user info.",
      inputSchema: {
        email: z.string().describe("User email address"),
        password: z.string().describe("User password"),
      },
    },
    async ({ email, password }) => {
      try {
        const data = await client.auth.login(email, password);
        if (data?.accessToken && client.setApiToken) client.setApiToken(data.accessToken);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_auth_login", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_auth_register",
    {
      description: "Create a new user account. Returns access token and user info.",
      inputSchema: {
        email: z.string().email().describe("Email address (must be unique)"),
        password: z.string().min(8).describe("Password (minimum 8 characters)"),
        name: z.string().min(1).describe("User display name"),
      },
    },
    async ({ email, password, name }) => {
      try {
        const data = await client.auth.register(email, password, name);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_auth_register", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_auth_me",
    {
      description: "Get current authenticated user info (id, email, name). Requires valid API token.",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.auth.me();
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_auth_me", formatErrorDetail(err), err);
      }
    }
  );
}
