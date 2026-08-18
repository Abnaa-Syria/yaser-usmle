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

const TRUSTED_EMBED =
  /^(https?:)?\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i;

function rewriteTrustedIframes(html) {
  return String(html || "").replace(/<iframe\b([^>]*)>/gi, (full, attrs) => {
    const srcMatch = String(attrs).match(/\ssrc\s*=\s*(['"])(.*?)\1/i);
    const src = srcMatch?.[2] || "";
    if (!TRUSTED_EMBED.test(src)) return "";
    return `<iframe src="${src}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  });
}

/** Article HTML: keep images/video embeds, drop scripts and unknown iframes. */
export function sanitizeArticleHtml(html) {
  const cleaned = String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(['"])[\s\S]*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
  return rewriteTrustedIframes(cleaned);
}

export function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}
