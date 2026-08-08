/**
 * Lightweight HTML helpers for legacy/CMS content.
 * Prefer shortDescription for cards; use SafeHtml for rich description blocks.
 */

export function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip executable markup before dangerouslySetInnerHTML. */
export function sanitizeRichHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*(['"])[\s\S]*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
}

export function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}
