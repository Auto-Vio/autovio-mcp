/**
 * Custom error classes for AutoVio MCP Server
 */

export class AutoVioMCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "AutoVioMCPError";
    Object.setPrototypeOf(this, AutoVioMCPError.prototype);
  }
}

export class ConfigurationError extends AutoVioMCPError {
  constructor(message: string, details?: unknown) {
    super(message, "CONFIG_ERROR", undefined, details);
    this.name = "ConfigurationError";
  }
}

export class APIError extends AutoVioMCPError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, "API_ERROR", statusCode, details);
    this.name = "APIError";
  }
}

export class ToolExecutionError extends AutoVioMCPError {
  constructor(toolName: string, message: string, details?: unknown) {
    const fullMessage = message && String(message).trim() ? message : formatErrorDetail(details);
    super(`Tool '${toolName}' failed: ${fullMessage}`, "TOOL_ERROR", undefined, details);
    this.name = "ToolExecutionError";
  }
}

/**
 * Extract a readable error string from any thrown value (including Axios, AggregateError).
 * Used so tool errors always show status code and API response body to the user.
 */
function getAggregateErrors(err: Error): unknown[] | undefined {
  const agg = err as unknown as { errors?: unknown[] };
  return Array.isArray(agg.errors) && agg.errors.length > 0 ? agg.errors : undefined;
}

export function formatErrorDetail(err: unknown): string {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  // AggregateError: by name or instanceof (some runtimes don't have global AggregateError)
  if (err instanceof Error) {
    const innerErrors = getAggregateErrors(err);
    const isAggregate =
      err.name === "AggregateError" ||
      (typeof AggregateError !== "undefined" && err instanceof AggregateError) ||
      !!innerErrors;
    if (isAggregate) {
      const parts: string[] = [err.message && err.message.trim() ? err.message : "AggregateError"];
      if (innerErrors?.length) {
        parts.push(innerErrors.map((e) => formatErrorDetail(e)).join("; "));
      }
      // Node 16+ AggregateError / standard Error may have .cause
      const withCause = err as { cause?: unknown };
      if (withCause.cause !== undefined) {
        parts.push("cause: " + formatErrorDetail(withCause.cause));
      }
      if (parts.length > 1) return parts.join(": ");
      if (parts[0] === "AggregateError") return "AggregateError (check network, API URL, or server logs for details)";
      return parts[0]!;
    }
    const ax = err as { response?: { status?: number; statusText?: string; data?: unknown } };
    if (ax.response) {
      const status = ax.response.status ?? "";
      const statusText = ax.response.statusText ?? "";
      const data = ax.response.data;
      const body =
        typeof data === "string" ? data : data && typeof data === "object" ? JSON.stringify(data) : "";
      const parts = [`HTTP ${status} ${statusText}`.trim()];
      if (body) parts.push(body);
      if (err.message && !String(err.message).includes("status code")) parts.push(err.message);
      return parts.join(" | ");
    }
    return err.message || err.name || "Error";
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
