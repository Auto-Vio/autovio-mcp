/**
 * Tool type definitions - MCP tool result format
 */

export interface ToolTextContent {
  type: "text";
  text: string;
}

export interface ToolImageContent {
  type: "image";
  data: string; // base64
  mimeType?: string;
}

export type ToolContent = ToolTextContent | ToolImageContent;

export interface CallToolResult {
  content: ToolContent[];
  isError?: boolean;
}
