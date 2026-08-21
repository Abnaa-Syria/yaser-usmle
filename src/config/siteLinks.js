/**
 * Fallbacks when the API is unavailable (env or defaults).
 * Live values come from GET /public/settings via useSiteSettings().
 */
import { APP_BRAND } from "./brand";

export const SITE_SETTINGS_FALLBACK = {
  siteName: APP_BRAND.name,
  logoPrimaryUrl: APP_BRAND.logoPath,
  logoLightUrl: APP_BRAND.logoLightPath,
  logoMarkUrl: APP_BRAND.logoMarkPath,
  contactEmail: APP_BRAND.contactEmail,
  phoneNumber: import.meta.env.VITE_SUPPORT_PHONE || "",
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK_URL || "",
    twitter: import.meta.env.VITE_SOCIAL_X_URL || "",
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL || "",
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN_URL || "",
  },
};

/** Official Telegram community links */
export const TELEGRAM_LINKS = {
  channel: "https://t.me/yaser_usmle",
  group: "https://t.me/DrYaserUsmleCommunity",
};

/** External Coursology Qbank */
export const COURSOLOGY_QBANK_URL = "https://coursology-qbank.com/";

/** @deprecated Use useSiteSettings().settings.social */
export const SOCIAL_URLS = SITE_SETTINGS_FALLBACK.social;

/** @deprecated Use useSiteSettings().settings.contactEmail */
export const CONTACT_EMAIL = SITE_SETTINGS_FALLBACK.contactEmail;
