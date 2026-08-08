import { useQuery } from "@tanstack/react-query";
import { fetchInstructorClasses } from "./api";

export function useInstructorClasses(params) {
  return useQuery({
    queryKey: ["instructor", "classes", params],
    queryFn: () => fetchInstructorClasses(params),
  });
}
