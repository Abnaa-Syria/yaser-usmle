import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminChallenge,
  fetchAdminChallenges,
  fetchAdminGamificationStats,
  seedAdminBadges,
} from "./api";

export function useAdminGamificationStats() {
  return useQuery({
    queryKey: ["admin", "gamification", "stats"],
    queryFn: fetchAdminGamificationStats,
    retry: false,
  });
}

export function useAdminChallenges() {
  return useQuery({
    queryKey: ["admin", "gamification", "challenges"],
    queryFn: fetchAdminChallenges,
    retry: false,
  });
}

export function useCreateAdminChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminChallenge,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "gamification"] });
    },
  });
}

export function useSeedAdminBadges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seedAdminBadges,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "gamification"] });
    },
  });
}
