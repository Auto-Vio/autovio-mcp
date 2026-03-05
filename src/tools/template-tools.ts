/**
 * Template MCP tools: list, get, create, update, delete
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AutoVioClient } from "../client/autovio-client.js";
import { ToolExecutionError, formatErrorDetail } from "../utils/errors.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

export function registerTemplateTools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_templates_list",
    {
      description: "List all templates in a project. Templates contain reusable text/image overlay compositions for videos.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
      },
    },
    async ({ projectId }) => {
      try {
        const data = await client.templates.list(projectId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_templates_list", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_templates_get",
    {
      description: "Get template details including its text/image overlay content.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        templateId: z.string().describe("Template ID"),
      },
    },
    async ({ projectId, templateId }) => {
      try {
        const data = await client.templates.get(projectId, templateId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_templates_get", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_templates_create",
    {
      description: "Create a new template with text/image overlays. Templates can be applied to works to add branding elements.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        name: z.string().describe("Template name"),
        description: z.string().optional().describe("Template description"),
        tags: z.array(z.string()).optional().describe("Tags for organization"),
        content: z.unknown().describe("Template content: {textOverlays: [], imageOverlays: [], exportSettings: {width, height, fps}}"),
      },
    },
    async ({ projectId, name, description, tags, content }) => {
      try {
        const data = await client.templates.create(projectId, { name, description, tags, content });
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_templates_create", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_templates_update",
    {
      description: "Update template name, description, tags, or content.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        templateId: z.string().describe("Template ID"),
        name: z.string().optional().describe("New template name"),
        description: z.string().optional().describe("New description"),
        tags: z.array(z.string()).optional().describe("New tags"),
        content: z.unknown().optional().describe("New overlay content"),
      },
    },
    async ({ projectId, templateId, name, description, tags, content }) => {
      try {
        const data = await client.templates.update(projectId, templateId, {
          name,
          description,
          tags,
          content,
        });
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_templates_update", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_templates_delete",
    {
      description: "Delete a template from the project.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        templateId: z.string().describe("Template ID to delete"),
      },
    },
    async ({ projectId, templateId }) => {
      try {
        await client.templates.delete(projectId, templateId);
        return { content: jsonContent(JSON.stringify({ success: true })) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_templates_delete", formatErrorDetail(err), err);
      }
    }
  );
}
