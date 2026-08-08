import { useQuery } from "@tanstack/react-query";
import { fetchInstructorPerformance } from "./api";

export function useInstructorPerformance() {
  return useQuery({
    queryKey: ["instructor", "performance"],
    queryFn: fetchInstructorPerformance,
  });
}
