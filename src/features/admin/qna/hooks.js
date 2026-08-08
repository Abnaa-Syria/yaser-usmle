import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminQuestions, replyToAdminQuestion, toggleResolveAdminQuestion } from "./api";

export function useAdminQuestions(params) {
  return useQuery({
    queryKey: ["admin", "qna", "questions", params],
    queryFn: () => fetchAdminQuestions(params),
  });
}

export function useAdminReplyToQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyToAdminQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "qna", "questions"] }),
  });
}

export function useAdminToggleResolveQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleResolveAdminQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "qna", "questions"] }),
  });
}
