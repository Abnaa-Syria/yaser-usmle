import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "./api";

export function useAdminCategories(params) {
  return useQuery({
    queryKey: ["admin", "categories", params],
    queryFn: () => fetchAdminCategories(params),
    retry: false,
  });
}

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCategory,
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => invalidate(queryClient),
  });
}

