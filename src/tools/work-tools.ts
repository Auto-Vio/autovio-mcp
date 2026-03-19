/**
 * Work (video pipeline) MCP tools: list, create, get, update, delete, apply-template, generate-scenario, generate-scene
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AutoVioClient } from "../client/autovio-client.js";
import type { UpdateWorkInput } from "../client/types.js";
import { ToolExecutionError, formatErrorDetail } from "../utils/errors.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

export function registerWorkTools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_works_list",
    {
      description: "List all works (video pipelines) in a project. Each work represents one video being created.",
      inputSchema: {
        projectId: z.string().describe("Project ID containing the works"),
      },
    },
    async ({ projectId }) => {
      try {
        const data = await client.works.list(projectId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_list", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_works_create",
    {
      description: "Create a new work (video pipeline) in a project. After creating, use works_generate_scenario to create scenes, then works_generate_scene to produce images and videos. Use selectedAssetIds with assetUsageMode to incorporate project assets.",
      inputSchema: {
        projectId: z.string().describe("Project ID to create the work in"),
        name: z.string().optional().describe("Work name (default: 'Yeni Çalışma')"),
        mode: z.enum(["style_transfer", "content_remix"]).optional().describe("style_transfer: copy visual style from reference. content_remix: reinterpret content with new visuals"),
        productName: z.string().optional().describe("Product or subject name for the video"),
        productDescription: z.string().optional().describe("Description of the product/subject"),
        targetAudience: z.string().optional().describe("Target audience for the video"),
        language: z.string().optional().describe("Language code (e.g., 'en', 'tr')"),
        videoDuration: z.number().optional().describe("Target video duration in seconds"),
        sceneCount: z.number().optional().describe("Number of scenes to generate"),
        selectedAssetIds: z.array(z.string()).optional().describe("Asset IDs from the project to use in video generation"),
        assetUsageMode: z.enum(["reference", "direct"]).optional().describe("How to use assets: 'reference' = AI learns style from assets, 'direct' = use actual asset images instead of generating new ones"),
        resolution: z.object({ width: z.number(), height: z.number() }).optional().describe("Output resolution for image/video generation and export. Presets: Portrait 9:16 {width:1080,height:1920}, Landscape 16:9 {width:1920,height:1080}, Square 1:1 {width:1080,height:1080}. Default: Portrait 9:16"),
      },
    },
    async (args) => {
      try {
        const { projectId, ...rest } = args;
        const data = await client.works.create(projectId, rest);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_create", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_works_get",
    {
      description: "Get full work details including scenes, generated media URLs, and editor state.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        workId: z.string().describe("Work ID (e.g., work_xxx)"),
      },
    },
    async ({ projectId, workId }) => {
      try {
        const data = await client.works.get(projectId, workId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_get", formatErrorDetail(err), err);
      }
    }
  );

  const workSceneItemSchema = z.object({
    scene_index: z.number(),
    duration_seconds: z.number(),
    image_prompt: z.string().optional(),
    negative_prompt: z.string().optional(),
    video_prompt: z.string().optional(),
    text_overlay: z.string().optional(),
    transition: z.string().optional(),
  });
  const timelineActionSnapshot = z.object({
    id: z.string().optional(),
    start: z.number().optional(),
    end: z.number().optional(),
    sceneIndex: z.number().optional(),
    trimStart: z.number().optional(),
    trimEnd: z.number().optional(),
    transitionType: z.string().optional(),
    transitionDuration: z.number().optional(),
  });
  const textOverlaySnapshot = z.object({
    text: z.string().optional(),
    fontSize: z.number().optional(),
    fontColor: z.string().optional(),
    centerX: z.number().optional(),
    centerY: z.number().optional(),
  });
  const imageOverlaySnapshot = z.object({
    assetId: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    centerX: z.number().optional(),
    centerY: z.number().optional(),
    opacity: z.number().optional(),
    rotation: z.number().optional(),
    maintainAspectRatio: z.boolean().optional(),
  });
  const exportSettings = z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    fps: z.number().optional(),
  });
  const editorData = z.object({
    videoTrack: z.array(timelineActionSnapshot).optional(),
    textTrack: z.array(timelineActionSnapshot).optional(),
    imageTrack: z.array(timelineActionSnapshot).optional(),
    audioTrack: z.array(timelineActionSnapshot).optional(),
  });
  const editorStateSchema = z.object({
    editorData: editorData.optional(),
    textOverlays: z.record(textOverlaySnapshot).optional(),
    imageOverlays: z.record(imageOverlaySnapshot).optional(),
    exportSettings: exportSettings.optional(),
  });

  mcp.registerTool(
    "autovio_works_update",
    {
      description: "Update work settings, scenes, or editor state. Only id and projectId are required; other fields are optional.",
      inputSchema: {
        id: z.string().describe("Work ID"),
        projectId: z.string().describe("Project ID"),
        name: z.string().optional().describe("Work name"),
        createdAt: z.number().optional().describe("Creation timestamp (ms)"),
        updatedAt: z.number().optional().describe("Update timestamp (ms)"),
        currentStep: z.number().optional().describe("Current pipeline step (0-4)"),
        hasReferenceVideo: z.boolean().optional().describe("Whether a reference video was uploaded"),
        mode: z.enum(["style_transfer", "content_remix"]).optional().describe("Video generation mode"),
        systemPrompt: z.string().optional().describe("Custom system prompt"),
        analyzerPrompt: z.string().optional().describe("Custom analyzer prompt"),
        imageSystemPrompt: z.string().optional().describe("Image generation instructions"),
        videoSystemPrompt: z.string().optional().describe("Video generation instructions"),
        productName: z.string().optional().describe("Product name"),
        productDescription: z.string().optional().describe("Product description"),
        targetAudience: z.string().optional().describe("Target audience"),
        language: z.string().optional().describe("Language code"),
        videoDuration: z.number().optional().describe("Duration in seconds"),
        sceneCount: z.number().optional().describe("Number of scenes"),
        selectedAssetIds: z.array(z.string()).optional().describe("Asset IDs from the project to use in video generation"),
        assetUsageMode: z.enum(["reference", "direct"]).optional().describe("How to use assets: 'reference' = AI learns style, 'direct' = use actual images"),
        resolution: z.object({ width: z.number(), height: z.number() }).optional().describe("Output resolution for image/video generation and export. Presets: Portrait 9:16 {width:1080,height:1920}, Landscape 16:9 {width:1920,height:1080}, Square 1:1 {width:1080,height:1080}"),
        analysis: z.unknown().optional().describe("Reference video analysis result"),
        scenes: z.array(workSceneItemSchema).optional().describe("Scene list with prompts and settings"),
        generatedScenes: z.array(z.unknown()).optional().describe("Generated media status per scene"),
        editorState: editorStateSchema.optional().describe("Timeline editor state (tracks, overlays, export settings)"),
      },
    },
    async (args) => {
      try {
        const data = await client.works.update(args.projectId, args.id, args as UpdateWorkInput);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_update", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_works_delete",
    {
      description: "Delete a work and all its generated media (images, videos).",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        workId: z.string().describe("Work ID to delete"),
      },
    },
    async ({ projectId, workId }) => {
      try {
        await client.works.delete(projectId, workId);
        return { content: jsonContent(JSON.stringify({ success: true })) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_delete", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_works_apply_template",
    {
      description: "Apply a template to a work. Adds text/image overlays from the template to the work's editor timeline and saves.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        workId: z.string().describe("Work ID to apply template to"),
        templateId: z.string().describe("Template ID to apply"),
        placeholderValues: z.record(z.string()).optional().describe("Replace {{key}} placeholders in template text (e.g., {product_name: 'My Product'})"),
      },
    },
    async ({ projectId, workId, templateId, placeholderValues }) => {
      try {
        const data = await client.works.applyTemplate(projectId, workId, { templateId, placeholderValues });
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_apply_template", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_works_generate_scenario",
    {
      description: "Generate scenario for a work using its settings (productName, targetAudience, sceneCount, etc.). Scenes are automatically saved to the work. Use after creating a work.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        workId: z.string().describe("Work ID to generate scenario for"),
      },
    },
    async ({ projectId, workId }) => {
      try {
        const data = await client.scenario.generate(projectId, workId);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_generate_scenario", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_works_generate_scene",
    {
      description: "Generate image and video for one scene of a work. Uses scene's image_prompt and video_prompt. Media is saved to the work. Call for each scene after generating scenario.",
      inputSchema: {
        projectId: z.string().describe("Project ID"),
        workId: z.string().describe("Work ID"),
        sceneIndex: z.number().describe("Scene index (0-based)"),
      },
    },
    async ({ projectId, workId, sceneIndex }) => {
      try {
        const data = await client.generate.scene(projectId, workId, sceneIndex);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_works_generate_scene", formatErrorDetail(err), err);
      }
    }
  );
}
