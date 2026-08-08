import { useMemo } from "react";

/**
 * Derives list query params from URLSearchParams (server-side pagination + filters).
 */
function usePaginatedQuery(searchParams) {
  return useMemo(() => {
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    return { page, limit, search, role, status };
  }, [searchParams]);
}

export default usePaginatedQuery;
