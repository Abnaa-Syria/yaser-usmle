import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats, fetchAdminOverview } from "./api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    retry: false,
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    retry: false,
  });
}
