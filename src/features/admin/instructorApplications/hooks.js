import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInstructorApplications, updateInstructorApplication } from "./api";

const APPLICATIONS_KEY = ["admin", "instructor-applications"];

export function useInstructorApplications(params = {}) {
  return useQuery({
    queryKey: [...APPLICATIONS_KEY, params],
    queryFn: () => fetchInstructorApplications(params),
    retry: false,
  });
}

export function useUpdateInstructorApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateInstructorApplication,
    onSuccess: () => qc.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  });
}
