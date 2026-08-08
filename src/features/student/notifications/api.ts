import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchNotifications() {
  const res = await client.get(endpoints.notifications);
  return res?.data?.data ?? [];
}

export async function markNotificationRead(id: string) {
  const res = await client.patch(`${endpoints.notifications}/${id}/read`);
  return res?.data?.data ?? null;
}

export async function markAllNotificationsRead() {
  const res = await client.patch(`${endpoints.notifications}/read-all`);
  return res?.data?.data ?? null;
}
