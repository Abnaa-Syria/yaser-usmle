import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminEnrollment,
  fetchAdminEnrollments,
  revokeAdminEnrollment,
  updateAdminEnrollmentExpiry,
} from "./api";

export function useAdminEnrollments(params) {
  return useQuery({
    queryKey: ["admin", "enrollments", params],
    queryFn: () => fetchAdminEnrollments(params),
    retry: false,
  });
}

export function useCreateAdminEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
    },
  });
}

export function useUpdateAdminEnrollmentExpiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminEnrollmentExpiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRevokeAdminEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeAdminEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
