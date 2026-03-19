/**
 * AI MCP tools: analyze video, generate scenario, generate image, generate video
 * Note: Work-based scenario/scene generation moved to work-tools.ts
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

export function registerAITools(mcp: McpServer, client: AutoVioClient): void {
  mcp.registerTool(
    "autovio_ai_analyze_video",
    {
      description: "Analyze a reference video with vision AI. Extracts scene structure, tone, color palette, tempo, and camera movements. Used before scenario generation to replicate video style.",
      inputSchema: {
        videoBase64: z.string().describe("Video file as base64 string"),
        mode: z.enum(["style_transfer", "content_remix"]).describe("style_transfer: replicate visual style. content_remix: reinterpret content"),
        analyzerPrompt: z.string().optional().describe("Custom analysis instructions"),
      },
    },
    async ({ videoBase64, mode, analyzerPrompt }) => {
      try {
        const buffer = Buffer.from(videoBase64, "base64");
        const data = await client.ai.analyze(buffer, mode, analyzerPrompt);
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_ai_analyze_video", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_ai_generate_scenario",
    {
      description: "Generate a scene-by-scene video scenario using LLM. Returns image_prompt, video_prompt, duration, and transition for each scene. For work-based generation, use works_generate_scenario instead.",
      inputSchema: {
        intent: z.object({
          mode: z.enum(["style_transfer", "content_remix"]).describe("Video generation mode"),
          product_name: z.string().optional().describe("Product/subject name"),
          product_description: z.string().optional().describe("Product/subject description"),
          target_audience: z.string().optional().describe("Target audience"),
          language: z.string().optional().describe("Output language code"),
          video_duration: z.number().optional().describe("Total video duration in seconds"),
          scene_count: z.number().optional().describe("Number of scenes to generate"),
        }).describe("What kind of video to create"),
        analysis: z.unknown().optional().describe("Reference video analysis (from analyze_video)"),
        systemPrompt: z.string().optional().describe("Custom system prompt"),
        knowledge: z.string().optional().describe("Brand context"),
        styleGuide: styleGuideSchema.describe("Brand style settings"),
      },
    },
    async (args) => {
      try {
        const data = await client.ai.generateScenario({
          intent: args.intent,
          analysis: args.analysis,
          systemPrompt: args.systemPrompt,
          knowledge: args.knowledge,
          styleGuide: args.styleGuide,
        });
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_ai_generate_scenario", formatErrorDetail(err), err);
      }
    }
  );

  const resolutionSchema = z.object({ width: z.number(), height: z.number() }).optional();

  mcp.registerTool(
    "autovio_ai_generate_image",
    {
      description: "Generate an image from a text prompt. Returns imageUrl. For work-based generation, use works_generate_scene instead.",
      inputSchema: {
        prompt: z.string().describe("Image generation prompt"),
        negative_prompt: z.string().optional().describe("What to avoid in the image"),
        image_instruction: z.string().optional().describe("Additional style instructions"),
        styleGuide: styleGuideSchema.describe("Brand style settings"),
        resolution: resolutionSchema.describe("Output resolution. Maps to DALL-E 3 size (portrait→1024x1792, landscape→1792x1024, square→1024x1024). Presets: Portrait 9:16 {width:1080,height:1920}, Landscape 16:9 {width:1920,height:1080}, Square 1:1 {width:1080,height:1080}"),
      },
    },
    async (args) => {
      try {
        const data = await client.ai.generateImage({
          prompt: args.prompt,
          negative_prompt: args.negative_prompt,
          image_instruction: args.image_instruction,
          styleGuide: args.styleGuide,
          resolution: args.resolution,
        });
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_ai_generate_image", formatErrorDetail(err), err);
      }
    }
  );

  mcp.registerTool(
    "autovio_ai_generate_video",
    {
      description: "Generate video from an image (image-to-video). Returns videoUrl. For work-based generation, use works_generate_scene instead.",
      inputSchema: {
        image_url: z.string().describe("Source image URL"),
        prompt: z.string().describe("Video motion/action prompt"),
        duration: z.number().optional().describe("Video duration in seconds (default: 5)"),
        video_instruction: z.string().optional().describe("Additional video instructions"),
        styleGuide: styleGuideSchema.describe("Brand style settings"),
        resolution: resolutionSchema.describe("Output resolution. Maps to Runway ratio (portrait→768:1280, landscape→1280:768) or Veo aspectRatio (9:16, 16:9, 1:1). Presets: Portrait 9:16 {width:1080,height:1920}, Landscape 16:9 {width:1920,height:1080}, Square 1:1 {width:1080,height:1080}"),
      },
    },
    async (args) => {
      try {
        const data = await client.ai.generateVideo({
          image_url: args.image_url,
          prompt: args.prompt,
          duration: args.duration,
          video_instruction: args.video_instruction,
          styleGuide: args.styleGuide,
          resolution: args.resolution,
        });
        return { content: jsonContent(JSON.stringify(data, null, 2)) };
      } catch (err: unknown) {
        throw new ToolExecutionError("autovio_ai_generate_video", formatErrorDetail(err), err);
      }
    }
  );

}
