import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentChallenge,
  fetchGamificationBadges,
  fetchGamificationLeaderboard,
  fetchMyGamification,
  patchGamificationPrivacy,
  postFlashcardSessionXp,
} from "./api";

export function useMyGamification(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "gamification", "me"],
    queryFn: fetchMyGamification,
    enabled: options.enabled !== false,
    retry: false,
    staleTime: 30_000,
  });
}

export function useGamificationLeaderboard(
  params: { scope?: "global" | "course"; period?: "week" | "all"; courseId?: string } = {},
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: ["student", "gamification", "leaderboard", params],
    queryFn: () => fetchGamificationLeaderboard(params),
    enabled: options.enabled !== false && (params.scope !== "course" || !!params.courseId),
    retry: false,
  });
}

export function useGamificationBadges(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "gamification", "badges"],
    queryFn: fetchGamificationBadges,
    enabled: options.enabled !== false,
    retry: false,
  });
}

export function useCurrentChallenge(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["student", "gamification", "challenge"],
    queryFn: fetchCurrentChallenge,
    enabled: options.enabled !== false,
    retry: false,
  });
}

export function usePatchGamificationPrivacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (displayNameOptOut: boolean) => patchGamificationPrivacy(displayNameOptOut),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "gamification"] });
    },
  });
}

export function useFlashcardSessionXp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionKey: string) => postFlashcardSessionXp(sessionKey),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "gamification", "me"] });
    },
  });
}
