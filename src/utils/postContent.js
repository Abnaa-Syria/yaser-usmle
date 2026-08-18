import { stripHtml } from "./htmlContent";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function youtubeIdFromUrl(url) {
  const cleaned = String(url || "").replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g, "").trim();
  const match = cleaned.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match?.[1] || "";
}

export function vimeoIdFromUrl(url) {
  const match = String(url || "").match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] || "";
}

export function videoEmbedHtml(url) {
  const yt = youtubeIdFromUrl(url);
  if (yt) {
    return `<div class="yu-embed"><iframe src="https://www.youtube.com/embed/${yt}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  const vimeo = vimeoIdFromUrl(url);
  if (vimeo) {
    return `<div class="yu-embed"><iframe src="https://player.vimeo.com/video/${vimeo}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return `<video class="yu-video" src="${escapeHtml(url)}" controls playsinline></video>`;
  }
  return "";
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let listType = null;

  const closeList = () => {
    if (listType) {
      html.push(listType === "ol" ? "</ol>" : "</ul>");
      listType = null;
    }
  };

  const inline = (text) => {
    let out = escapeHtml(text);
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return out;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }

    const embed = videoEmbedHtml(line);
    if (embed) {
      closeList();
      html.push(embed);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    if (/^>\s+/.test(line)) {
      closeList();
      html.push(`<blockquote>${inline(line.replace(/^>\s+/, ""))}</blockquote>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line)) {
      closeList();
      html.push("<hr />");
      continue;
    }

    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return html.join("");
}

export function contentToHtml(content) {
  if (content == null) return "";
  if (typeof content === "string") {
    return looksLikeMarkup(content) ? content : markdownToHtml(content);
  }
  if (typeof content !== "object") return "";

  const format = content.format;
  const body = content.body;
  if ((format === "html" || format === "markdown") && typeof body === "string") {
    if (format === "html" || looksLikeMarkup(body)) return body;
    return markdownToHtml(body);
  }

  if (Array.isArray(content.blocks) && content.blocks.length) {
    return content.blocks
      .map((block) => {
        if (!block || typeof block !== "object") return "";
        if (block.type === "paragraph" && typeof block.text === "string") {
          return `<p>${escapeHtml(block.text)}</p>`;
        }
        if (block.type === "heading" && typeof block.text === "string") {
          const level = Math.min(3, Math.max(1, Number(block.level) || 2));
          return `<h${level}>${escapeHtml(block.text)}</h${level}>`;
        }
        if (block.type === "image" && typeof block.src === "string") {
          return `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || "")}" />`;
        }
        if (block.type === "video" && typeof block.src === "string") {
          return videoEmbedHtml(block.src);
        }
        return "";
      })
      .join("");
  }

  if (Array.isArray(content.bullets) && content.bullets.length) {
    return `<ul>${content.bullets
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const title = typeof item.title === "string" ? `<strong>${escapeHtml(item.title)}: </strong>` : "";
        const text = typeof item.body === "string" ? escapeHtml(item.body) : "";
        return `<li>${title}${text}</li>`;
      })
      .join("")}</ul>`;
  }

  return "";
}

function looksLikeMarkup(value) {
  return /<\/?(p|h[1-6]|ul|ol|li|img|iframe|video|blockquote|strong|em|div)\b/i.test(String(value || ""));
}

export function excerptFromHtml(html, maxLen = 180) {
  const text = stripHtml(html);
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen).trim()}…` : text;
}

export function readingMinutes(html) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function postExcerptText(post, isRtl, fallback = "") {
  if (isRtl && post?.excerptAr) return post.excerptAr;
  if (typeof post?.excerpt === "string" && post.excerpt.trim()) return post.excerpt;
  return excerptFromHtml(contentToHtml(isRtl && post?.contentAr ? post.contentAr : post?.content), 180) || fallback;
}
