/**
 * Configuration validation with Zod.
 * Config: CLI params (öncelikli) > env > config file > defaults.
 *
 * Sadece 4 AI çifti (model + apiKey):
 *   Video Analysis: --vision-model, --vision-api-key
 *   LLM:           --llm-model, --llm-api-key
 *   Image Generate: --image-model, --image-api-key
 *   Video Generate: --video-model, --video-api-key
 * + --config, --autovio-base-url, --autovio-api-token, --log-level, --enable-resources, --enable-prompts
 */

import { z } from "zod";
import { config as loadEnv } from "dotenv";
import { readFile } from "fs/promises";
import { resolve } from "path";
import type { AutoVioMCPConfig } from "./types.js";
import { defaultConfig } from "./defaults.js";

const ModelKeySchema = z.object({
  model: z.string().min(1),
  apiKey: z.string(),
});

const ConfigSchema = z.object({
  server: z.object({
    name: z.string().default("autovio-mcp-server"),
    version: z.string().default("1.0.0"),
  }),
  autovio: z.object({
    baseUrl: z.string().default("http://localhost:3001"),
    apiToken: z.string().default(""),
  }),
  providers: z.object({
    vision: ModelKeySchema,
    llm: ModelKeySchema,
    image: ModelKeySchema,
    video: ModelKeySchema,
  }),
  features: z.object({
    enableResources: z.boolean().default(true),
    enablePrompts: z.boolean().default(true),
    cacheResponses: z.boolean().default(false),
    logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  }),
});

export type ConfigInput = z.infer<typeof ConfigSchema>;

/** Normalize --kebab-case and --camelCase to single key (kebab) */
function normalizeKey(key: string): string {
  return key
    .replace(/^--/, "")
    .replace(/([A-Z])/g, (_, c) => `-${(c as string).toLowerCase()}`)
    .replace(/^-/, "")
    .toLowerCase();
}

/** Parse CLI: --key value. Returns map of normalized keys (kebab-case) to string values. */
export function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg.startsWith("--") && argv[i + 1] !== undefined) {
      const key = normalizeKey(arg);
      args[key] = argv[++i]!;
    }
  }
  return args;
}

function parseBool(s: string | undefined): boolean | undefined {
  if (s === undefined) return undefined;
  const lower = s.toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes") return true;
  if (lower === "false" || lower === "0" || lower === "no") return false;
  return undefined;
}

/**
 * Load config: CLI params > env > config file > defaults.
 */
export async function loadConfig(): Promise<AutoVioMCPConfig> {
  loadEnv();

  const args = parseArgs();
  const configPath = args["config"] ?? process.env.AUTOVIO_MCP_CONFIG;

  let fileConfig: unknown = {};
  if (configPath) {
    try {
      const raw = await readFile(resolve(configPath), "utf-8");
      fileConfig = JSON.parse(raw) as unknown;
    } catch (err) {
      console.error("Failed to load config file:", err);
    }
  }

  const fc = fileConfig as Record<string, unknown>;
  const fav = (fc?.autovio as Record<string, unknown>) ?? {};
  const fprov = (fc?.providers as Record<string, unknown>) ?? {};
  const ffeat = (fc?.features as Record<string, unknown>) ?? {};
  const fvision = (fprov?.vision as Record<string, unknown>) ?? {};
  const fllm = (fprov?.llm as Record<string, unknown>) ?? {};
  const fimage = (fprov?.image as Record<string, unknown>) ?? {};
  const fvideo = (fprov?.video as Record<string, unknown>) ?? {};
  const fileObj = typeof fileConfig === "object" && fileConfig !== null ? fileConfig : {};
  const fllmModel = (fllm?.model as string) ?? (fllm?.scenario as Record<string, unknown>)?.model as string | undefined;
  const fllmKey = (fllm?.apiKey as string) ?? (fllm?.scenario as Record<string, unknown>)?.apiKey as string | undefined;

  const autovioBaseUrl =
    args["autovio-base-url"] ?? process.env.AUTOVIO_BASE_URL ?? (fav.baseUrl as string) ?? defaultConfig.autovio?.baseUrl ?? "http://localhost:3001";
  const autovioApiToken =
    args["autovio-api-token"] ?? process.env.AUTOVIO_API_TOKEN ?? (fav.apiToken as string) ?? defaultConfig.autovio?.apiToken ?? "";

  const visionModel =
    args["vision-model"] ?? process.env.AUTOVIO_VISION_MODEL ?? (fvision.model as string) ?? defaultConfig.providers?.vision?.model ?? "gemini-2.0-flash-exp";
  const visionApiKey =
    args["vision-api-key"] ?? process.env.AUTOVIO_VISION_API_KEY ?? (fvision.apiKey as string) ?? defaultConfig.providers?.vision?.apiKey ?? "";

  const llmModel =
    args["llm-model"] ?? process.env.AUTOVIO_LLM_MODEL ?? fllmModel ?? defaultConfig.providers?.llm?.model ?? "gemini-2.5-flash";
  const llmApiKey =
    args["llm-api-key"] ?? process.env.AUTOVIO_LLM_API_KEY ?? fllmKey ?? defaultConfig.providers?.llm?.apiKey ?? "";

  const imageModel =
    args["image-model"] ?? process.env.AUTOVIO_IMAGE_MODEL ?? (fimage.model as string) ?? defaultConfig.providers?.image?.model ?? "gemini-2.5-flash-image";
  const imageApiKey =
    args["image-api-key"] ?? process.env.AUTOVIO_IMAGE_API_KEY ?? (fimage.apiKey as string) ?? defaultConfig.providers?.image?.apiKey ?? "";

  const videoModel =
    args["video-model"] ?? process.env.AUTOVIO_VIDEO_MODEL ?? (fvideo.model as string) ?? defaultConfig.providers?.video?.model ?? "veo-3.0-generate-001";
  const videoApiKey =
    args["video-api-key"] ?? process.env.AUTOVIO_VIDEO_API_KEY ?? (fvideo.apiKey as string) ?? defaultConfig.providers?.video?.apiKey ?? "";

  const logLevelArg = args["log-level"] ?? process.env.AUTOVIO_LOG_LEVEL ?? (ffeat.logLevel as string) ?? defaultConfig.features?.logLevel ?? "info";
  const logLevel = ["debug", "info", "warn", "error"].includes(logLevelArg) ? logLevelArg : "info";
  const enableResources =
    parseBool(args["enable-resources"]) ?? (process.env.AUTOVIO_ENABLE_RESOURCES !== undefined ? parseBool(process.env.AUTOVIO_ENABLE_RESOURCES) : undefined) ?? (ffeat.enableResources as boolean) ?? defaultConfig.features?.enableResources ?? true;
  const enablePrompts =
    parseBool(args["enable-prompts"]) ?? (process.env.AUTOVIO_ENABLE_PROMPTS !== undefined ? parseBool(process.env.AUTOVIO_ENABLE_PROMPTS) : undefined) ?? (ffeat.enablePrompts as boolean) ?? defaultConfig.features?.enablePrompts ?? true;

  const base = {
    ...defaultConfig,
    ...fileObj,
    server: {
      name: (fc?.server as Record<string, unknown>)?.name ?? defaultConfig.server?.name ?? "autovio-mcp-server",
      version: (fc?.server as Record<string, unknown>)?.version ?? defaultConfig.server?.version ?? "1.0.0",
    },
    autovio: { baseUrl: autovioBaseUrl, apiToken: autovioApiToken },
    providers: {
      vision: { model: visionModel, apiKey: visionApiKey },
      llm: { model: llmModel, apiKey: llmApiKey },
      image: { model: imageModel, apiKey: imageApiKey },
      video: { model: videoModel, apiKey: videoApiKey },
    },
    features: {
      enableResources,
      enablePrompts,
      cacheResponses: (ffeat.cacheResponses as boolean | undefined) ?? defaultConfig.features?.cacheResponses ?? false,
      logLevel: logLevel as "debug" | "info" | "warn" | "error",
    },
  } as ConfigInput;

  const result = ConfigSchema.safeParse(base);
  if (!result.success) {
    throw new Error(`Invalid config: ${result.error.message}`);
  }
  return result.data as AutoVioMCPConfig;
}
