import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminEmailTemplate,
  deleteAdminEmailTemplate,
  fetchAdminEmailTemplates,
  fetchAdminSettings,
  previewAdminEmailTemplate,
  sendTestAdminEmailTemplate,
  updateAdminEmailTemplate,
  updateAdminSettings,
} from "./api";

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
    retry: false,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["public", "site-settings"] });
    },
  });
}

export function useAdminEmailTemplates() {
  return useQuery({
    queryKey: ["admin", "settings", "emails"],
    queryFn: fetchAdminEmailTemplates,
    retry: false,
  });
}

export function useCreateAdminEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminEmailTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "settings", "emails"] }),
  });
}

export function useUpdateAdminEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminEmailTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "settings", "emails"] }),
  });
}

export function useDeleteAdminEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminEmailTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "settings", "emails"] }),
  });
}

export function usePreviewAdminEmailTemplate() {
  return useMutation({
    mutationFn: previewAdminEmailTemplate,
  });
}

export function useSendTestAdminEmailTemplate() {
  return useMutation({
    mutationFn: sendTestAdminEmailTemplate,
  });
}

