import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchStudentExam,
  fetchStudentExams,
  fetchExamResult,
  startStudentExam,
  submitStudentExam,
  type StudentExamFilters,
} from "./api";

export function useStudentExams(filters: StudentExamFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "exams", filters],
    queryFn: () => fetchStudentExams(filters),
    enabled: options.enabled !== false,
    retry: false,
  });
}

export function useStudentExam(examId: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "exam", examId],
    queryFn: () => fetchStudentExam(examId as string),
    enabled: !!examId && options.enabled !== false,
    retry: false,
  });
}

export function useStartStudentExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => startStudentExam(examId),
    onSuccess: (_, examId) => {
      void qc.invalidateQueries({ queryKey: ["student", "exam", examId] });
      void qc.invalidateQueries({ queryKey: ["student", "exams"] });
    },
  });
}

export function useSubmitStudentExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, answers }: { examId: string; answers: { questionId: string; answerText: string | null }[] }) =>
      submitStudentExam(examId, answers),
    onSuccess: (_, { examId }) => {
      void qc.invalidateQueries({ queryKey: ["student", "exam", examId] });
      void qc.invalidateQueries({ queryKey: ["student", "exams"] });
    },
  });
}

export function useExamResult(examId: string | undefined, submissionId: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "exam-result", examId, submissionId],
    queryFn: () => fetchExamResult(examId as string, submissionId as string),
    enabled: !!(examId && submissionId) && options.enabled !== false,
    retry: false,
  });
}
