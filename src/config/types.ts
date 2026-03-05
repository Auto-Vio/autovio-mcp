/**
 * AutoVio MCP Server - Configuration type definitions
 *
 * AI tarafında sadece 4 çift var: Video Analysis, LLM, Image Generate, Video Generate.
 * Her biri: model adı + apiKey. Provider gerekmez (model adından türetilir).
 */

export interface ServerConfig {
  name: string;
  version: string;
}

export interface AutoVioConfig {
  baseUrl: string;
  apiToken: string;
}

/** Tek bir AI servisi: model adı + API key (provider opsiyonel, model adından türetilebilir) */
export interface ModelKeyConfig {
  model: string;
  apiKey: string;
}

/** 4 işlem: Video Analysis (vision), LLM, Image Generate, Video Generate */
export interface ProvidersConfig {
  /** Video Analysis AI – referans video analizi */
  vision: ModelKeyConfig;
  /** LLM – senaryo ve style guide üretimi */
  llm: ModelKeyConfig;
  /** Image Generate AI – görsel üretimi */
  image: ModelKeyConfig;
  /** Video Generate AI – video üretimi */
  video: ModelKeyConfig;
}

export interface FeaturesConfig {
  enableResources: boolean;
  enablePrompts: boolean;
  cacheResponses: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

export interface AutoVioMCPConfig {
  server: ServerConfig;
  autovio: AutoVioConfig;
  providers: ProvidersConfig;
  features: FeaturesConfig;
}
