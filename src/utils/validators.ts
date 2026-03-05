/**
 * Helper validators for IDs and common inputs
 */

export function requireNonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value.trim();
}

export function requireProjectId(projectId: unknown): string {
  return requireNonEmptyString(projectId, "projectId");
}

export function requireWorkId(workId: unknown): string {
  return requireNonEmptyString(workId, "workId");
}

export function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
