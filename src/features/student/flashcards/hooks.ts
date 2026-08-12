import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMyFlashcard,
  deleteMyFlashcard,
  fetchFlashcardIntervals,
  fetchMyFlashcards,
  fetchStudentFlashcards,
  reviewMyFlashcard,
  reviewStudentFlashcard,
  updateMyFlashcard,
  type FlashcardDifficulty,
  type FlashcardFilters,
} from "./api";

export function useStudentFlashcards(filters: FlashcardFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "flashcards", filters],
    queryFn: () => fetchStudentFlashcards(filters),
    enabled: options.enabled !== false,
    retry: false,
  });
}

export function useFlashcardIntervals(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "flashcard-intervals"],
    queryFn: fetchFlashcardIntervals,
    enabled: options.enabled !== false,
    staleTime: 60_000,
    retry: false,
  });
}

export function useReviewStudentFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, difficulty }: { id: string; difficulty: FlashcardDifficulty }) =>
      reviewStudentFlashcard(id, difficulty),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "flashcards"] });
    },
  });
}

export function useMyFlashcards(filters: FlashcardFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "my-flashcards", filters],
    queryFn: () => fetchMyFlashcards(filters),
    enabled: options.enabled !== false,
    retry: false,
  });
}

export function useCreateMyFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMyFlashcard,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["student", "my-flashcards"] }),
  });
}

export function useUpdateMyFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => updateMyFlashcard(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["student", "my-flashcards"] }),
  });
}

export function useDeleteMyFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMyFlashcard,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["student", "my-flashcards"] }),
  });
}

export function useReviewMyFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, difficulty }: { id: string; difficulty: FlashcardDifficulty }) =>
      reviewMyFlashcard(id, difficulty),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["student", "my-flashcards"] }),
  });
}
