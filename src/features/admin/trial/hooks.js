import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminTrial,
  fetchAdminTrialSessions,
  replaceAdminTrialCourses,
  restoreAdminTrialSession,
  revokeAdminTrialSession,
  updateAdminTrialSettings,
} from "./api";

export function useAdminTrial() {
  return useQuery({
    queryKey: ["admin", "trial"],
    queryFn: fetchAdminTrial,
    retry: false,
  });
}

export function useUpdateAdminTrialSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminTrialSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "trial"] }),
  });
}

export function useReplaceAdminTrialCourses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: replaceAdminTrialCourses,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "trial"] }),
  });
}

export function useAdminTrialSessions(params) {
  return useQuery({
    queryKey: ["admin", "trial", "sessions", params],
    queryFn: () => fetchAdminTrialSessions(params),
    retry: false,
    refetchInterval: 15_000,
  });
}

export function useRevokeAdminTrialSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => revokeAdminTrialSession(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "trial", "sessions"] }),
  });
}

export function useRestoreAdminTrialSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreAdminTrialSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "trial", "sessions"] }),
  });
}
