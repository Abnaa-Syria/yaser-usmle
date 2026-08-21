/** Default public page visibility. Packages hidden by product decision. */
export const DEFAULT_PUBLIC_PAGE_VISIBILITY = {
  home: true,
  explore: true,
  packages: false,
  instructors: true,
  events: true,
  about: true,
  contact: true,
  faq: true,
  blogs: true,
  library: true,
  teach: true,
  guide: true,
  terms: true,
  privacy: true,
  refund: true,
};

export const PUBLIC_PAGE_VISIBILITY_KEY = "PUBLIC_PAGE_VISIBILITY";

export function normalizePageVisibility(raw) {
  const base = { ...DEFAULT_PUBLIC_PAGE_VISIBILITY };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  for (const key of Object.keys(base)) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      base[key] = Boolean(raw[key]);
    }
  }
  return base;
}

/** Map pathname → visibility key */
export function visibilityKeyForPath(pathname) {
  if (!pathname || pathname === "/") return "home";
  if (pathname.startsWith("/packages") || pathname.startsWith("/subscription")) return "packages";
  if (pathname.startsWith("/explore") || pathname.startsWith("/courses")) return "explore";
  if (pathname.startsWith("/instructors")) return "instructors";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname.startsWith("/faq")) return "faq";
  if (pathname.startsWith("/blogs")) return "blogs";
  if (pathname.startsWith("/library")) return "library";
  if (pathname.startsWith("/teach")) return "teach";
  if (pathname.startsWith("/guide")) return "guide";
  if (pathname.startsWith("/terms")) return "terms";
  if (pathname.startsWith("/privacy")) return "privacy";
  if (pathname.startsWith("/refund")) return "refund";
  return null;
}

export function isPublicPathVisible(pathname, visibility) {
  const key = visibilityKeyForPath(pathname);
  if (!key) return true;
  const v = normalizePageVisibility(visibility);
  return v[key] !== false;
}

export function pathToVisibilityKey(to) {
  if (!to || typeof to !== "string") return null;
  if (to === "/") return "home";
  if (to.startsWith("/packages")) return "packages";
  if (to.startsWith("/explore") || to === "/courses") return "explore";
  if (to.startsWith("/instructors")) return "instructors";
  if (to.startsWith("/events")) return "events";
  if (to.startsWith("/about")) return "about";
  if (to.startsWith("/contact")) return "contact";
  if (to.startsWith("/faq")) return "faq";
  if (to.startsWith("/blogs")) return "blogs";
  if (to.startsWith("/library")) return "library";
  if (to.startsWith("/teach")) return "teach";
  if (to.startsWith("/guide")) return "guide";
  if (to.startsWith("/terms")) return "terms";
  if (to.startsWith("/privacy")) return "privacy";
  if (to.startsWith("/refund")) return "refund";
  return null;
}
