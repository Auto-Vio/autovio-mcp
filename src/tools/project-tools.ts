/**
 * Project MCP tools: list, create, get, update, delete
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AutoVioClient } from "../client/autovio-client.js";
import { ToolExecutionError, formatErrorDetail } from "../utils/errors.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

const styleGuideSchema = z
  .object({
    tone: z.string().optional(),
    color_palette: z.array(z.string()).optional(),
    tempo: z.enum(["fast", "medium", "slow"]).optional(),
    camera_style: z.string().optional(),
    brand_voice: z.string().optional(),
    must_include: z.array(z.string()).optional(),
    must_avoid: z.array(z.string()).optional(),
  })
  .optional();

export function registerProjectTools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_projects_list",
    {
      description: "List all projects for the current user. Returns id, name, and updatedAt for each project.",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.projects.list();
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_projects_list", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_projects_create",
    {
      description: "Create a new project. A project holds brand settings, prompts, and contains multiple works (video pipelines).",
      inputSchema: {
        name: z.string().optional().describe("Project name (default: 'Yeni Proje')"),
        systemPrompt: z.string().optional().describe("Custom system prompt for scenario generation"),
        knowledge: z.string().optional().describe("Brand context or background info for AI"),
        styleGuide: styleGuideSchema.describe("Brand style settings: tone, colors, tempo, camera style, must include/avoid"),
        imageSystemPrompt: z.string().optional().describe("Instructions for image generation"),
        videoSystemPrompt: z.string().optional().describe("Instructions for video generation"),
      },
    },
    async (args) => {
      try {
        const data = await client.projects.create({
          name: args.name,
          systemPrompt: args.systemPrompt,
          knowledge: args.knowledge,
          styleGuide: args.styleGuide,
          imageSystemPrompt: args.imageSystemPrompt,
          videoSystemPrompt: args.videoSystemPrompt,
        });
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_projects_create", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_projects_get",
    {
      description: "Get full project details including styleGuide, prompts, and settings.",
      inputSchema: {
        projectId: z.string().describe("Project ID (e.g., proj_xxx)"),
      },
    },
    async ({ projectId }) => {
      try {
        const data = await client.projects.get(projectId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_projects_get", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_projects_update",
    {
      description: "Update project settings. Requires id and name. Other fields are optional.",
      inputSchema: {
        id: z.string().describe("Project ID (must match the project being updated)"),
        name: z.string().describe("Project name"),
        userId: z.string().optional().describe("User ID (usually not changed)"),
        systemPrompt: z.string().optional().describe("Custom system prompt for scenario generation"),
        knowledge: z.string().optional().describe("Brand context or background info"),
        analyzerPrompt: z.string().optional().describe("Custom prompt for video analysis"),
        styleGuide: styleGuideSchema.describe("Brand style settings"),
        imageSystemPrompt: z.string().optional().describe("Instructions for image generation"),
        videoSystemPrompt: z.string().optional().describe("Instructions for video generation"),
        createdAt: z.number().optional().describe("Creation timestamp (ms)"),
        updatedAt: z.number().optional().describe("Last update timestamp (ms)"),
      },
    },
    async (args) => {
      try {
        const data = await client.projects.update(args.id, args);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_projects_update", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_projects_delete",
    {
      description: "Delete a project and all its works, templates, and assets.",
      inputSchema: {
        projectId: z.string().describe("Project ID to delete"),
      },
    },
    async ({ projectId }) => {
      try {
        await client.projects.delete(projectId);
        return { content: jsonContent(JSON.stringify({ success: true })) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_projects_delete", formatErrorDetail(err), err);
      }
    }
  );
}
