import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPublicTrialConfig,
  fetchTrialCourseUnits,
  fetchTrialLessonPlayback,
  fetchTrialMe,
  fetchTrialRecordings,
  startPublicTrial,
} from "./api";
import {
  fetchTrialExam,
  fetchTrialExamResult,
  fetchTrialExams,
  fetchTrialFlashcards,
  startTrialExam,
  submitTrialExam,
} from "./learningApi";
import useTrialStore from "../../store/trialStore";

export function usePublicTrialConfig() {
  return useQuery({
    queryKey: ["public", "trial"],
    queryFn: fetchPublicTrialConfig,
    staleTime: 60_000,
    retry: false,
  });
}

export function useStartTrial() {
  return useMutation({
    mutationFn: startPublicTrial,
  });
}

export function useTrialMe(enabled = true) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "me", token],
    queryFn: fetchTrialMe,
    enabled: Boolean(enabled && token),
    retry: false,
    refetchInterval: 60_000,
  });
}

export function useTrialCourseUnits(courseId) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "units", courseId, token],
    queryFn: () => fetchTrialCourseUnits(courseId),
    enabled: Boolean(token && courseId),
    retry: false,
  });
}

export function useTrialLessonPlayback(lessonId, { enabled = true } = {}) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "playback", lessonId, token],
    queryFn: () => fetchTrialLessonPlayback(lessonId),
    enabled: Boolean(enabled && token && lessonId),
    retry: false,
    staleTime: 30_000,
  });
}

export function useTrialRecordings(enabled = true) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "recordings", token],
    queryFn: fetchTrialRecordings,
    enabled: Boolean(enabled && token),
    retry: false,
  });
}

export function useTrialFlashcards(filters = {}, options = {}) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "flashcards", filters, token],
    queryFn: () => fetchTrialFlashcards(filters),
    enabled: Boolean(token) && options.enabled !== false,
    retry: false,
  });
}

export function useTrialExams(filters = {}, options = {}) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "exams", filters, token],
    queryFn: () => fetchTrialExams(filters),
    enabled: Boolean(token) && options.enabled !== false,
    retry: false,
  });
}

export function useTrialExam(examId, options = {}) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "exam", examId, token],
    queryFn: () => fetchTrialExam(examId),
    enabled: Boolean(token && examId) && options.enabled !== false,
    retry: false,
  });
}

export function useStartTrialExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId) => startTrialExam(examId),
    onSuccess: (_, examId) => {
      void qc.invalidateQueries({ queryKey: ["trial", "exam", examId] });
      void qc.invalidateQueries({ queryKey: ["trial", "exams"] });
    },
  });
}

export function useSubmitTrialExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, answers }) => submitTrialExam(examId, answers),
    onSuccess: (_, { examId }) => {
      void qc.invalidateQueries({ queryKey: ["trial", "exam", examId] });
      void qc.invalidateQueries({ queryKey: ["trial", "exams"] });
    },
  });
}

export function useTrialExamResult(examId, submissionId, options = {}) {
  const token = useTrialStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["trial", "exam-result", examId, submissionId, token],
    queryFn: () => fetchTrialExamResult(examId, submissionId),
    enabled: Boolean(token && examId && submissionId) && options.enabled !== false,
    retry: false,
  });
}
