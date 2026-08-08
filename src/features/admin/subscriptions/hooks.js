import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminSubscription,
  createAdminSubscriptionEnrollment,
  fetchAdminSubscriptionEnrollments,
  fetchAdminSubscriptionLookups,
  fetchAdminSubscriptions,
  updateAdminSubscriptionStatus,
} from "./api";

const SUBS_KEY = ["admin", "subscriptions"];

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: [...SUBS_KEY, "list"],
    queryFn: fetchAdminSubscriptions,
    retry: false,
  });
}

export function useAdminSubscriptionEnrollments() {
  return useQuery({
    queryKey: [...SUBS_KEY, "enrollments"],
    queryFn: fetchAdminSubscriptionEnrollments,
    retry: false,
  });
}

export function useAdminSubscriptionLookups() {
  return useQuery({
    queryKey: [...SUBS_KEY, "lookups"],
    queryFn: fetchAdminSubscriptionLookups,
    retry: false,
  });
}

export function useUpdateAdminSubscriptionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSubscriptionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBS_KEY });
    },
  });
}

export function useCreateAdminSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBS_KEY });
    },
  });
}

export function useCreateAdminSubscriptionEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminSubscriptionEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBS_KEY });
    },
  });
}

