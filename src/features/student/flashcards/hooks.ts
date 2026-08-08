import { useQuery } from "@tanstack/react-query";
import { fetchStudentFlashcards, type FlashcardFilters } from "./api";

export function useStudentFlashcards(filters: FlashcardFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "flashcards", filters],
    queryFn: () => fetchStudentFlashcards(filters),
    enabled: options.enabled !== false,
    retry: false,
  });
}
