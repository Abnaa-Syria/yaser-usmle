/**
 * Resolve relative /uploads/... paths against the API origin for display.
 * Also rewrites legacy demo.yaserusmle.com URLs that no longer resolve.
 */
const LEGACY_MEDIA_HOSTS = [
  "https://demo.yaserusmle.com",
  "http://demo.yaserusmle.com",
];

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60";

export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  for (const host of LEGACY_MEDIA_HOSTS) {
    if (trimmed.toLowerCase().startsWith(host)) {
      trimmed = trimmed.slice(host.length) || "/";
      break;
    }
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Seeded demo assets lived only on demo.yaserusmle.com — use a safe placeholder.
  if (trimmed.startsWith("/assets/")) {
    return PLACEHOLDER;
  }

  if (!trimmed.startsWith("/uploads/")) return trimmed;

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  try {
    return `${new URL(apiBase).origin}${trimmed}`;
  } catch {
    return trimmed;
  }
}
