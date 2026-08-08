import { Suspense } from "react";

export function loadingFallback() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-yu-blue-700 border-t-transparent"
        aria-hidden
      />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  );
}

/** Wrap lazy-loaded route pages with a shared fallback spinner. */
export function RouteSuspense({ children }) {
  return <Suspense fallback={loadingFallback()}>{children}</Suspense>;
}
