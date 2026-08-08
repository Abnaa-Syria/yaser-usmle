/** Query string for post-login cohort enrollment (from catalog / course detail links). */
export function getEnrollmentCheckoutPath(search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const cohortId = params.get("cohortId")?.trim();
  if (!cohortId) return null;
  const next = new URLSearchParams({ cohortId });
  const courseId = params.get("courseId")?.trim();
  if (courseId) next.set("courseId", courseId);
  return `/checkout?${next.toString()}`;
}

/**
 * `?redirect=/path?a=1` after login (internal paths only).
 */
export function getPostLoginRedirectPath(search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = params.get("redirect")?.trim();
  if (!raw) return null;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path.startsWith("//") || path.includes("://")) return null;
  return path;
}
