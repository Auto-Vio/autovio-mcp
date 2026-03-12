/**
 * AutoVio API client - HTTP client for all API endpoints
 * Provider header'ı model adından türetilir (kullanıcı sadece model + key girer).
 */

import axios, { type AxiosInstance } from "axios";
import type { AutoVioConfig, ProvidersConfig } from "../config/types.js";

function deriveProvider(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("gemini") || m.includes("veo")) return "gemini";
  if (m.includes("claude")) return "claude";
  if (m.includes("gpt") || m.includes("openai")) return "openai";
  return "gemini";
}
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateWorkInput,
  UpdateWorkInput,
  ScenarioRequest,
  GenerateImageRequest,
  GenerateVideoRequest,
  ExportRequest,
  ApplyTemplateToWorkRequest,
} from "./types.js";

export class AutoVioClient {
  private axios: AxiosInstance;
  private config: AutoVioConfig;
  private providers: ProvidersConfig;

  constructor(config: AutoVioConfig, providers: ProvidersConfig) {
    this.config = config;
    this.providers = providers;
    this.axios = axios.create({
      baseURL: config.baseUrl.replace(/\/$/, ""),
      headers: {
        Authorization: config.apiToken ? `Bearer ${config.apiToken}` : "",
        "Content-Type": "application/json",
      },
    });
  }

  setApiToken(token: string): void {
    this.config = { ...this.config, apiToken: token };
    this.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  async health(): Promise<{ status: string; timestamp?: string }> {
    const res = await this.axios.get("/api/health");
    return res.data;
  }

  auth = {
    login: async (email: string, password: string) => {
      const res = await this.axios.post("/api/auth/login", { email, password });
      return res.data;
    },
    register: async (email: string, password: string, name: string) => {
      const res = await this.axios.post("/api/auth/register", { email, password, name });
      return res.data;
    },
    me: async () => {
      const res = await this.axios.get("/api/auth/me");
      return res.data;
    },
  };

  projects = {
    list: async () => {
      const res = await this.axios.get("/api/projects");
      return res.data;
    },
    create: async (data: CreateProjectInput) => {
      const res = await this.axios.post("/api/projects", data);
      return res.data;
    },
    get: async (id: string) => {
      const res = await this.axios.get(`/api/projects/${id}`);
      return res.data;
    },
    update: async (id: string, data: UpdateProjectInput) => {
      const res = await this.axios.put(`/api/projects/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      await this.axios.delete(`/api/projects/${id}`);
    },
  };

  works = {
    list: async (projectId: string) => {
      const res = await this.axios.get(`/api/projects/${projectId}/works`);
      return res.data;
    },
    create: async (projectId: string, data: CreateWorkInput) => {
      const res = await this.axios.post(`/api/projects/${projectId}/works`, data);
      return res.data;
    },
    get: async (projectId: string, workId: string) => {
      const res = await this.axios.get(`/api/projects/${projectId}/works/${workId}`);
      return res.data;
    },
    update: async (projectId: string, workId: string, data: UpdateWorkInput) => {
      const res = await this.axios.put(`/api/projects/${projectId}/works/${workId}`, data);
      return res.data;
    },
    delete: async (projectId: string, workId: string) => {
      await this.axios.delete(`/api/projects/${projectId}/works/${workId}`);
    },
    applyTemplate: async (projectId: string, workId: string, data: ApplyTemplateToWorkRequest) => {
      const res = await this.axios.post(
        `/api/projects/${projectId}/works/${workId}/apply-template`,
        data
      );
      return res.data;
    },
    uploadReferenceVideo: async (projectId: string, workId: string, videoFile: Buffer | Blob) => {
      const formData = new FormData();
      formData.append("video", videoFile instanceof Buffer ? new Blob([videoFile]) : videoFile);
      const res = await this.axios.post(
        `/api/projects/${projectId}/works/${workId}/media/reference`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data;
    },
  };

  scenario = {
    generate: async (projectId: string, workId: string) => {
      const { model, apiKey } = this.providers.llm;
      const res = await this.axios.post(
        `/api/projects/${projectId}/works/${workId}/scenario`,
        {},
        {
          headers: {
            "x-llm-provider": deriveProvider(model),
            "x-model-id": model,
            "x-api-key": apiKey,
          },
        }
      );
      return res.data;
    },
  };

  generate = {
    scene: async (projectId: string, workId: string, sceneIndex: number) => {
      const { model: imageModel, apiKey } = this.providers.image;
      const { model: videoModel } = this.providers.video;
      const res = await this.axios.post(
        `/api/projects/${projectId}/works/${workId}/generate/scene/${sceneIndex}`,
        {},
        {
          headers: {
            "x-api-key": apiKey,
            "x-image-provider": deriveProvider(imageModel),
            "x-image-model-id": imageModel,
            "x-video-provider": deriveProvider(videoModel),
            "x-video-model-id": videoModel,
          },
        }
      );
      return res.data;
    },
  };

  ai = {
    analyze: async (videoFile: Buffer | Blob, mode: string, analyzerPrompt?: string) => {
      const formData = new FormData();
      formData.append("video", videoFile instanceof Buffer ? new Blob([videoFile]) : videoFile);
      formData.append("mode", mode);
      if (analyzerPrompt) formData.append("analyzerPrompt", analyzerPrompt);
      const { model, apiKey } = this.providers.vision;
      const res = await this.axios.post("/api/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-vision-provider": deriveProvider(model),
          "x-model-id": model,
          "x-api-key": apiKey,
        },
      });
      return res.data;
    },
    generateScenario: async (request: ScenarioRequest) => {
      const { model, apiKey } = this.providers.llm;
      const res = await this.axios.post("/api/scenario", request, {
        headers: {
          "x-llm-provider": deriveProvider(model),
          "x-model-id": model,
          "x-api-key": apiKey,
        },
      });
      return res.data;
    },
    generateImage: async (request: GenerateImageRequest) => {
      const { model, apiKey } = this.providers.image;
      const res = await this.axios.post("/api/generate/image", request, {
        headers: {
          "x-image-provider": deriveProvider(model),
          "x-model-id": model,
          "x-api-key": apiKey,
        },
      });
      return res.data;
    },
    generateVideo: async (request: GenerateVideoRequest) => {
      const { model, apiKey } = this.providers.video;
      const res = await this.axios.post("/api/generate/video", request, {
        headers: {
          "x-video-provider": deriveProvider(model),
          "x-model-id": model,
          "x-api-key": apiKey,
        },
      });
      return res.data;
    },
  };

  assets = {
    list: async (projectId: string, type?: "image" | "video" | "audio" | "font") => {
      const params = type ? { type } : {};
      const res = await this.axios.get(`/api/projects/${projectId}/assets`, { params });
      return res.data;
    },
    get: async (projectId: string, assetId: string) => {
      const res = await this.axios.get(`/api/projects/${projectId}/assets/${assetId}/meta`);
      return res.data;
    },
    analyze: async (projectId: string, assetId: string) => {
      const { model, apiKey } = this.providers.vision;
      const res = await this.axios.post(
        `/api/projects/${projectId}/assets/${assetId}/analyze`,
        {},
        {
          headers: {
            "x-vision-provider": deriveProvider(model),
            "x-model-id": model,
            "x-api-key": apiKey,
          },
        }
      );
      return res.data;
    },
    analyzeBatch: async (projectId: string, assetIds: string[]) => {
      const { model, apiKey } = this.providers.vision;
      const res = await this.axios.post(
        `/api/projects/${projectId}/assets/analyze-batch`,
        { assetIds },
        {
          headers: {
            "x-vision-provider": deriveProvider(model),
            "x-model-id": model,
            "x-api-key": apiKey,
          },
        }
      );
      return res.data;
    },
    delete: async (projectId: string, assetId: string) => {
      await this.axios.delete(`/api/projects/${projectId}/assets/${assetId}`);
    },
  };

  templates = {
    list: async (projectId: string) => {
      const res = await this.axios.get(`/api/projects/${projectId}/templates`);
      return res.data;
    },
    get: async (projectId: string, templateId: string) => {
      const res = await this.axios.get(`/api/projects/${projectId}/templates/${templateId}`);
      return res.data;
    },
    create: async (projectId: string, data: { name: string; description?: string; tags?: string[]; content: unknown }) => {
      const res = await this.axios.post(`/api/projects/${projectId}/templates`, data);
      return res.data;
    },
    update: async (projectId: string, templateId: string, data: { name?: string; description?: string; tags?: string[]; content?: unknown }) => {
      const res = await this.axios.put(`/api/projects/${projectId}/templates/${templateId}`, data);
      return res.data;
    },
    delete: async (projectId: string, templateId: string) => {
      await this.axios.delete(`/api/projects/${projectId}/templates/${templateId}`);
    },
  };

  providers_list = async (): Promise<unknown[]> => {
    const res = await this.axios.get("/api/providers");
    return res.data;
  };

  exportVideo = async (request: ExportRequest): Promise<Blob | unknown> => {
    const res = await this.axios.post("/api/export", request, { responseType: "blob" });
    return res.data;
  };
}
