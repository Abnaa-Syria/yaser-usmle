import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminInstructorReview,
  deleteAdminInstructorReview,
  fetchAdminInstructorReviews,
  updateAdminInstructorReview,
} from "./api";

const KEY = ["admin", "instructor-reviews"];

export function useAdminInstructorReviews(params = {}, options = {}) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => fetchAdminInstructorReviews(params),
    enabled: options.enabled !== false,
    retry: false,
  });
}

export function useCreateAdminInstructorReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminInstructorReview,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAdminInstructorReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateAdminInstructorReview(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAdminInstructorReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminInstructorReview,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}
