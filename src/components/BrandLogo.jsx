import { useEffect, useState } from "react";
import { APP_BRAND } from "../config/brand";
import { useSiteSettings } from "../features/public/siteSettings/hooks";

export function resolveBrandAssetUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (!url.startsWith("/uploads/")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  try {
    return `${new URL(apiBase).origin}${url}`;
  } catch {
    return url;
  }
}

// Re-export shared helper for callers that already import BrandLogo utilities
export { resolveMediaUrl } from "../utils/resolveMediaUrl";

const FALLBACKS = {
  primary: APP_BRAND.logoPath,
  light: APP_BRAND.logoLightPath,
  mark: APP_BRAND.logoMarkPath,
};

export default function BrandLogo({ variant = "primary", className = "", alt, ...props }) {
  const { settings } = useSiteSettings();
  const [failed, setFailed] = useState(false);
  const configured = {
    primary: settings.logoPrimaryUrl,
    light: settings.logoLightUrl,
    mark: settings.logoMarkUrl,
  }[variant];
  const source = failed ? FALLBACKS[variant] : resolveBrandAssetUrl(configured || FALLBACKS[variant]);

  useEffect(() => setFailed(false), [configured, variant]);

  return (
    <img
      src={source}
      alt={alt || settings.siteName || APP_BRAND.name}
      className={`block max-w-full object-contain ${className}`}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}

export function BrandRuntimeAssets() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const markUrl = resolveBrandAssetUrl(settings.logoMarkUrl || APP_BRAND.faviconPath);
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
      link.setAttribute("href", markUrl);
    });
  }, [settings.logoMarkUrl]);

  return null;
}
