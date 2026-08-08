import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAvailableSlots(limit = 100) {
  const res = await client.get(endpoints.student.bookingsAvailable, { params: { limit } });
  return res?.data?.data ?? [];
}

export async function bookAvailabilitySlot(availabilityId: string) {
  const res = await client.post(endpoints.student.bookSlot(availabilityId), {});
  return res?.data?.data ?? null;
}
