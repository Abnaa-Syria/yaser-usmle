import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCoupons,
  updateAdminCoupon,
} from "./api";

const COUPONS_KEY = ["admin", "coupons"];

export function useAdminCoupons(params = {}) {
  return useQuery({
    queryKey: [...COUPONS_KEY, params],
    queryFn: () => fetchAdminCoupons(params),
    retry: false,
  });
}

export function useCreateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
}

export function useUpdateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
}

export function useDeleteAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
}

