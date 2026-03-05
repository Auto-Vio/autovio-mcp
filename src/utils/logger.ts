/**
 * Simple logger - all output goes to stderr so stdout is reserved for MCP JSON-RPC.
 * MCP stdio transport: only JSON messages on stdout; any log on stdout breaks the client.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel];
}

function formatMessage(level: string, ...args: unknown[]): string {
  const prefix = `[${new Date().toISOString()}] [${level}]`;
  if (args.length === 0) return prefix;
  const first = args[0];
  if (typeof first === "string") {
    return `${prefix} ${first}` + (args.length > 1 ? " " + args.slice(1).map(String).join(" ") : "");
  }
  return prefix + " " + args.map(String).join(" ");
}

function writeStderr(msg: string): void {
  process.stderr.write(msg + "\n");
}

export const logger = {
  debug(...args: unknown[]): void {
    if (shouldLog("debug")) writeStderr(formatMessage("DEBUG", ...args));
  },
  info(...args: unknown[]): void {
    if (shouldLog("info")) writeStderr(formatMessage("INFO", ...args));
  },
  warn(...args: unknown[]): void {
    if (shouldLog("warn")) writeStderr(formatMessage("WARN", ...args));
  },
  error(...args: unknown[]): void {
    if (shouldLog("error")) writeStderr(formatMessage("ERROR", ...args));
  },
};
