import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminPackage,
  deleteAdminPackage,
  fetchAdminPackage,
  fetchAdminPackages,
  updateAdminPackage,
} from "./api";
import type { CreatePackageInput, UpdatePackageInput } from "./types";

export function useAdminPackages() {
  return useQuery({
    queryKey: ["admin", "packages"],
    queryFn: () => fetchAdminPackages(),
    retry: false,
  });
}

export function useAdminPackage(id: string | null) {
  return useQuery({
    queryKey: ["admin", "package", id],
    queryFn: () => fetchAdminPackage(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateAdminPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePackageInput) => createAdminPackage(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
}

export function useUpdateAdminPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdatePackageInput }) => updateAdminPackage(args),
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "package", vars.id] });
    },
  });
}

export function useDeleteAdminPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminPackage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });
}
