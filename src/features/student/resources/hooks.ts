import { useQuery } from "@tanstack/react-query";
import { fetchLessonResources } from "./api";

export function useLessonResources(lessonId: string | undefined) {
  return useQuery({
    queryKey: ["student", "lesson-resources", lessonId],
    queryFn: () => fetchLessonResources(lessonId as string),
    enabled: !!lessonId,
    retry: false,
  });
}
