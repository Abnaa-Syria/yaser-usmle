import { useQuery } from "@tanstack/react-query";
import { fetchPublicSiteSettings } from "./api";
import { SITE_SETTINGS_FALLBACK } from "../../../config/siteLinks";

function mergeWithFallback(data) {
  const base = data && typeof data === "object" ? data : {};
  return {
    siteName: base.siteName || SITE_SETTINGS_FALLBACK.siteName,
    logoPrimaryUrl: base.logoPrimaryUrl || SITE_SETTINGS_FALLBACK.logoPrimaryUrl,
    logoLightUrl: base.logoLightUrl || SITE_SETTINGS_FALLBACK.logoLightUrl,
    logoMarkUrl: base.logoMarkUrl || SITE_SETTINGS_FALLBACK.logoMarkUrl,
    contactEmail: base.contactEmail || SITE_SETTINGS_FALLBACK.contactEmail,
    phoneNumber: base.phoneNumber ?? SITE_SETTINGS_FALLBACK.phoneNumber,
    social: {
      ...SITE_SETTINGS_FALLBACK.social,
      ...(base.social && typeof base.social === "object" ? base.social : {}),
    },
  };
}

export function useSiteSettings() {
  const query = useQuery({
    queryKey: ["public", "site-settings"],
    queryFn: fetchPublicSiteSettings,
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    ...query,
    settings: mergeWithFallback(query.data),
  };
}
