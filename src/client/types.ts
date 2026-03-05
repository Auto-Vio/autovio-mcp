/**
 * AutoVio API request/response types (aligned with OpenAPI schemas)
 */

export interface StyleGuide {
  tone?: string;
  color_palette?: string[];
  tempo?: "fast" | "medium" | "slow";
  camera_style?: string;
  brand_voice?: string;
  must_include?: string[];
  must_avoid?: string[];
}

export interface CreateProjectInput {
  name?: string;
  systemPrompt?: string;
  knowledge?: string;
  styleGuide?: StyleGuide;
  imageSystemPrompt?: string;
  videoSystemPrompt?: string;
}

export interface UpdateProjectInput {
  id: string;
  userId?: string;
  name: string;
  systemPrompt?: string;
  knowledge?: string;
  analyzerPrompt?: string;
  styleGuide?: StyleGuide;
  imageSystemPrompt?: string;
  videoSystemPrompt?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateWorkInput {
  name?: string;
  mode?: "style_transfer" | "content_remix";
  productName?: string;
  productDescription?: string;
  targetAudience?: string;
  language?: string;
  videoDuration?: number;
  sceneCount?: number;
}

export interface WorkSceneItem {
  scene_index: number;
  duration_seconds: number;
  image_prompt?: string;
  negative_prompt?: string;
  video_prompt?: string;
  text_overlay?: string;
  transition?: string;
}

/** Timeline track item (videoTrack, textTrack, imageTrack, audioTrack) */
export interface TimelineActionSnapshot {
  id?: string;
  start?: number;
  end?: number;
  sceneIndex?: number;
  trimStart?: number;
  trimEnd?: number;
  transitionType?: string;
  transitionDuration?: number;
}

export interface TextOverlaySnapshot {
  text?: string;
  fontSize?: number;
  fontColor?: string;
  centerX?: number;
  centerY?: number;
}

export interface ImageOverlaySnapshot {
  assetId?: string;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  opacity?: number;
  rotation?: number;
  maintainAspectRatio?: boolean;
}

export interface ExportSettings {
  width?: number;
  height?: number;
  fps?: number;
}

export interface EditorData {
  videoTrack?: TimelineActionSnapshot[];
  textTrack?: TimelineActionSnapshot[];
  imageTrack?: TimelineActionSnapshot[];
  audioTrack?: TimelineActionSnapshot[];
}

/** Editör state: timeline (editorData), textOverlays, imageOverlays, exportSettings. PUT work ile gönderilir. */
export interface EditorState {
  editorData?: EditorData;
  textOverlays?: Record<string, TextOverlaySnapshot>;
  imageOverlays?: Record<string, ImageOverlaySnapshot>;
  exportSettings?: ExportSettings;
}

/** PUT work body: sadece id ve projectId zorunlu; diğer alanlar opsiyonel (partial update için). */
export interface UpdateWorkInput {
  id: string;
  projectId: string;
  name?: string;
  createdAt?: number;
  updatedAt?: number;
  currentStep?: number;
  hasReferenceVideo?: boolean;
  mode?: "style_transfer" | "content_remix";
  systemPrompt?: string;
  analyzerPrompt?: string;
  imageSystemPrompt?: string;
  videoSystemPrompt?: string;
  productName?: string;
  productDescription?: string;
  targetAudience?: string;
  language?: string;
  videoDuration?: number;
  sceneCount?: number;
  analysis?: unknown;
  scenes?: WorkSceneItem[];
  generatedScenes?: unknown[];
  editorState?: EditorState;
}

export interface ScenarioRequest {
  intent: {
    mode: "style_transfer" | "content_remix";
    product_name?: string;
    product_description?: string;
    target_audience?: string;
    language?: string;
    video_duration?: number;
    scene_count?: number;
  };
  analysis?: unknown;
  systemPrompt?: string;
  knowledge?: string;
  styleGuide?: StyleGuide;
}

export interface GenerateImageRequest {
  prompt: string;
  negative_prompt?: string;
  image_instruction?: string;
  styleGuide?: StyleGuide;
}

export interface GenerateVideoRequest {
  image_url: string;
  prompt: string;
  duration?: number;
  video_instruction?: string;
  styleGuide?: StyleGuide;
}

export interface ExportRequest {
  workId: string;
  projectId: string;
  [key: string]: unknown;
}

export interface ApplyTemplateToWorkRequest {
  templateId: string;
  placeholderValues?: Record<string, string>;
}
