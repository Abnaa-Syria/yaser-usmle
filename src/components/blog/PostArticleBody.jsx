import { sanitizeArticleHtml } from "../../utils/htmlContent";
import { contentToHtml } from "../../utils/postContent";

export default function PostArticleBody({ content, emptyLabel = "" }) {
  const html = sanitizeArticleHtml(contentToHtml(content));
  if (!html.trim()) {
    return <p className="text-slate-500">{emptyLabel}</p>;
  }
  return <div className="yu-article text-slate-700" dangerouslySetInnerHTML={{ __html: html }} />;
}
