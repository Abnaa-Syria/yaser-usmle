import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudyPlan,
  createStudyPlanItem,
  deleteStudyPlan,
  deleteStudyPlanItem,
  fetchStudyPlans,
  updateStudyPlan,
  updateStudyPlanItem,
} from "./api";

const STUDY_PLANS_KEY = ["student", "study-plans"] as const;

export function useStudyPlans() {
  return useQuery({
    queryKey: STUDY_PLANS_KEY,
    queryFn: fetchStudyPlans,
    retry: false,
  });
}

export function useCreateStudyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudyPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY }),
  });
}

export function useUpdateStudyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, body }: { planId: string; body: Record<string, unknown> }) => updateStudyPlan(planId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY }),
  });
}

export function useDeleteStudyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStudyPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY }),
  });
}

export function useCreateStudyPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, body }: { planId: string; body: Record<string, unknown> }) => createStudyPlanItem(planId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY }),
  });
}

export function useUpdateStudyPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, itemId, body }: { planId: string; itemId: string; body: Record<string, unknown> }) =>
      updateStudyPlanItem(planId, itemId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY });
      void qc.invalidateQueries({ queryKey: ["student", "gamification"] });
    },
  });
}

export function useDeleteStudyPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, itemId }: { planId: string; itemId: string }) => deleteStudyPlanItem(planId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY }),
  });
}
