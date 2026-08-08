import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "./api";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
