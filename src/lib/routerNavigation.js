/** Registered from a component inside `BrowserRouter` so axios can soft-navigate. */
let navigateReplace = null;

export function setRouterNavigateReplace(fn) {
  navigateReplace = typeof fn === "function" ? fn : null;
}

/**
 * Client-side navigation with replace. Falls back to full navigation if the router is not mounted yet.
 * @param {string} to
 */
export function navigateReplaceTo(to) {
  if (navigateReplace) {
    navigateReplace(to);
    return;
  }
  const url =
    typeof to === "string" && to.startsWith("http")
      ? to
      : `${window.location.origin}${to.startsWith("/") ? "" : "/"}${to}`;
  window.location.assign(url);
}
