import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAdminExamQuestion,
  createAdminExam,
  deleteAdminExam,
  deleteAdminExamQuestion,
  fetchAdminExamById,
  fetchAdminExams,
  fetchAdminExamSubmissions,
  updateAdminExam,
  updateAdminExamQuestion,
} from "./api";

export function useAdminExams(params) {
  return useQuery({
    queryKey: ["admin", "exams", params],
    queryFn: () => fetchAdminExams(params),
    retry: false,
  });
}

export function useAdminExamById(id) {
  return useQuery({
    queryKey: ["admin", "exam", id],
    queryFn: () => fetchAdminExamById(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useAdminExamSubmissions(examId, params) {
  return useQuery({
    queryKey: ["admin", "exam", examId, "submissions", params],
    queryFn: () => fetchAdminExamSubmissions(examId, params),
    enabled: Boolean(examId),
    retry: false,
  });
}

export function useCreateAdminExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminExam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "exams"] }),
  });
}

export function useUpdateAdminExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminExam,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exam", vars.id] });
    },
  });
}

export function useDeleteAdminExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminExam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "exams"] }),
  });
}

export function useAddAdminExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAdminExamQuestion,
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ["admin", "exam", vars.examId] }),
  });
}

export function useUpdateAdminExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminExamQuestion,
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ["admin", "exam", vars.examId] }),
  });
}

export function useDeleteAdminExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminExamQuestion,
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ["admin", "exam", vars.examId] }),
  });
}
