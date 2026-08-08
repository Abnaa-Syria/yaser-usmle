import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminInstructorAvailability,
  createInstructor,
  deleteAdminInstructorAvailability,
  deleteInstructor,
  fetchAdminInstructorAvailability,
  fetchAdminInstructorById,
  fetchAdminInstructorPerformance,
  fetchAdminInstructors,
  updateAdminInstructorAvailabilityPrice,
  updateInstructor,
} from "./api";

export function useAdminInstructors(params = {}) {
  const { enabled = true, ...queryParams } = params;
  return useQuery({
    queryKey: ["admin", "instructors", queryParams],
    queryFn: () => fetchAdminInstructors(queryParams),
    enabled,
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] }),
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInstructor,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["admin", "instructors", variables.id] });
      }
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] }),
  });
}

export function useAdminInstructorById(id) {
  return useQuery({
    queryKey: ["admin", "instructors", id],
    queryFn: () => fetchAdminInstructorById(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useAdminInstructorPerformance(instructorId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["admin", "instructors", instructorId, "performance"],
    queryFn: () => fetchAdminInstructorPerformance(instructorId),
    enabled: Boolean(instructorId) && enabled,
    retry: false,
  });
}

export function useAdminInstructorAvailability(instructorId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["admin", "instructors", instructorId, "availability"],
    queryFn: () => fetchAdminInstructorAvailability(instructorId),
    enabled: Boolean(instructorId) && enabled,
    retry: false,
  });
}

function invalidateAvailability(queryClient, instructorId) {
  queryClient.invalidateQueries({ queryKey: ["admin", "instructors", instructorId, "availability"] });
}

export function useCreateAdminInstructorAvailability(instructorId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => createAdminInstructorAvailability(instructorId, body),
    onSuccess: () => invalidateAvailability(queryClient, instructorId),
  });
}

export function useUpdateAdminInstructorAvailabilityPrice(instructorId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, price }) => updateAdminInstructorAvailabilityPrice(instructorId, slotId, price),
    onSuccess: () => invalidateAvailability(queryClient, instructorId),
  });
}

export function useDeleteAdminInstructorAvailability(instructorId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId) => deleteAdminInstructorAvailability(instructorId, slotId),
    onSuccess: () => invalidateAvailability(queryClient, instructorId),
  });
}
