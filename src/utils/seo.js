import { useEffect } from "react";
import { APP_BRAND } from "../config/brand";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://yaser-usmle.com").replace(/\/+$/, "");
const DEFAULT_DESCRIPTION =
  "Yaser USMLE helps medical students prepare for USMLE Step 1 with structured courses, learning tools, and guided study workflows.";

function upsertMeta(selector, attrs) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
}

function upsertLink(rel, href, extra = {}) {
  let node = document.head.querySelector(`link[rel="${rel}"]${extra.hreflang ? `[hreflang="${extra.hreflang}"]` : ""}`);
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", rel);
    if (extra.hreflang) node.setAttribute("hreflang", extra.hreflang);
    document.head.appendChild(node);
  }
  node.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  let node = document.getElementById(id);
  if (!data) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement("script");
    node.id = id;
    node.type = "application/ld+json";
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(data);
}

export function absoluteUrl(pathOrUrl = "/") {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = typeof window !== "undefined" ? window.location.pathname : "/",
  image,
  type = "website",
  noindex = false,
  jsonLd,
} = {}) {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${APP_BRAND.name}` : APP_BRAND.name;
    const canonical = absoluteUrl(path);
    const imageUrl = image ? absoluteUrl(image) : undefined;

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    }
    upsertLink("canonical", canonical);
    upsertLink("alternate", absoluteUrl(path), { hreflang: "x-default" });
    upsertLink("alternate", absoluteUrl(path), { hreflang: "en" });
    upsertLink("alternate", absoluteUrl(path), { hreflang: "ar" });
    upsertJsonLd("route-jsonld", jsonLd);
  }, [title, description, path, image, type, noindex, jsonLd]);
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: APP_BRAND.name,
    url: SITE_URL,
    email: APP_BRAND.contactEmail,
  };
}
