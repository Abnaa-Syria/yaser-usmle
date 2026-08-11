/**
 * Resolve relative /uploads/... paths against the API origin for display.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  if (!trimmed.startsWith("/uploads/")) return trimmed;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  try {
    return `${new URL(apiBase).origin}${trimmed}`;
  } catch {
    return trimmed;
  }
}
