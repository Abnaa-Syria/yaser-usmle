import { usePublicLandingPage } from "../features/public/hooks";
import { findLandingSection, pickLocalized } from "../utils/cmsLocale";

/**
 * Read a catalog/page hero section from landing CMS with i18n fallbacks.
 * @param {string} key HomePageSection key e.g. EXPLORE_HERO
 * @param {object} defaults { eyebrow, titlePrefix, titleAccent, subtitle, searchPlaceholder, pillars }
 * @param {string} lang
 */
export function useCatalogHero(key, defaults = {}, lang = "en") {
  const { data } = usePublicLandingPage();
  const section = findLandingSection(data?.sections || [], key);
  const c = section?.content && typeof section.content === "object" ? section.content : {};
  const L = (value, fallback = "") => pickLocalized(value, lang) || fallback;

  const pillarsRaw = Array.isArray(c.pillars) ? c.pillars : [];
  const defaultPillars = Array.isArray(defaults.pillars) ? defaults.pillars : [];

  return {
    visible: !section || section.isVisible !== false,
    eyebrow: L(c.eyebrow, defaults.eyebrow || ""),
    titlePrefix: L(c.titlePrefix, defaults.titlePrefix || ""),
    titleAccent: L(c.titleAccent, defaults.titleAccent || ""),
    subtitle: L(c.subtitle, defaults.subtitle || ""),
    searchPlaceholder: L(c.searchPlaceholder, defaults.searchPlaceholder || ""),
    pillars:
      pillarsRaw.length > 0
        ? pillarsRaw.map((p, i) => ({
            key: p.id || p.key || `p-${i}`,
            title: L(p.title, defaultPillars[i]?.title || ""),
            body: L(p.body, defaultPillars[i]?.body || ""),
            icon: p.icon || defaultPillars[i]?.icon || "",
            imageUrl: p.imageUrl || "",
          }))
        : defaultPillars,
  };
}
