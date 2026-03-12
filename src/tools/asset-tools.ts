/**
 * Asset MCP tools: list, get, analyze, delete
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AutoVioClient } from "../client/autovio-client.js";
import { ToolExecutionError, formatErrorDetail } from "../utils/errors.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

export function registerAssetTools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_assets_list",
    {
      description: "List all assets in a project. Assets are images, videos, audio files, or fonts uploaded to the project. Use these assets with selectedAssetIds in works.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        type: z.enum(["image", "video", "audio", "font"]).optional().describe("Filter by asset type"),
      },
    },
    async ({ projectId, type }) => {
      try {
        const data = await client.assets.list(projectId, type);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_assets_list", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_assets_get",
    {
      description: "Get metadata for a specific asset including name, type, size, tags, and AI-generated description.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        assetId: z.string().describe("Asset ID"),
      },
    },
    async ({ projectId, assetId }) => {
      try {
        const data = await client.assets.get(projectId, assetId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_assets_get", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_assets_analyze",
    {
      description: "Analyze an image asset with Vision AI to generate a description. The description is used in 'reference' mode to help AI understand the visual style. Required for effective reference mode usage.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        assetId: z.string().describe("Asset ID (must be an image)"),
      },
    },
    async ({ projectId, assetId }) => {
      try {
        const data = await client.assets.analyze(projectId, assetId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_assets_analyze", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_assets_analyze_batch",
    {
      description: "Analyze multiple image assets with Vision AI in batch. Generates descriptions for all specified assets. Use before setting assetUsageMode to 'reference'.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        assetIds: z.array(z.string()).describe("Array of asset IDs to analyze (must be images)"),
      },
    },
    async ({ projectId, assetIds }) => {
      try {
        const data = await client.assets.analyzeBatch(projectId, assetIds);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_assets_analyze_batch", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_assets_delete",
    {
      description: "Delete an asset from the project.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        assetId: z.string().describe("Asset ID to delete"),
      },
    },
    async ({ projectId, assetId }) => {
      try {
        await client.assets.delete(projectId, assetId);
        return { content: jsonContent(JSON.stringify({ success: true })) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_assets_delete", formatErrorDetail(err), err);
      }
    }
  );
}
