import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminFlashcard, deleteAdminFlashcard, fetchAdminFlashcards, updateAdminFlashcard } from "./api";

const FLASHCARDS_KEY = ["admin", "flashcards"];

export function useAdminFlashcards(params = {}) {
  return useQuery({
    queryKey: [...FLASHCARDS_KEY, params],
    queryFn: () => fetchAdminFlashcards(params),
    retry: false,
  });
}

export function useCreateAdminFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminFlashcard,
    onSuccess: () => qc.invalidateQueries({ queryKey: FLASHCARDS_KEY }),
  });
}

export function useUpdateAdminFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminFlashcard,
    onSuccess: () => qc.invalidateQueries({ queryKey: FLASHCARDS_KEY }),
  });
}

export function useDeleteAdminFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminFlashcard,
    onSuccess: () => qc.invalidateQueries({ queryKey: FLASHCARDS_KEY }),
  });
}
