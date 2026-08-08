import { useQuery } from "@tanstack/react-query";
import { fetchCourseUnits, fetchMyCourses } from "./api";

export function useMyCourses(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["student", "my-courses"],
    queryFn: fetchMyCourses,
    enabled,
    retry: false,
  });
}

export function useCourseUnits(courseId: string | undefined) {
  return useQuery({
    queryKey: ["student", "course-units", courseId],
    queryFn: () => fetchCourseUnits(courseId as string),
    enabled: !!courseId,
    retry: false,
  });
}
