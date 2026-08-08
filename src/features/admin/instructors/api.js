import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminInstructors(params) {
  const response = await client.get(endpoints.admin.instructors, { params });
  const payload = response?.data;
  const list = payload?.data?.instructors || payload?.data || [];
  const meta = payload?.meta || payload?.data?.pagination || null;
  return { instructors: list, meta };
}

export async function fetchAdminInstructorById(id) {
  const response = await client.get(`${endpoints.admin.instructors}/${id}`);
  return response?.data?.data || null;
}

export async function fetchAdminInstructorPerformance(id) {
  const response = await client.get(`${endpoints.admin.instructors}/${id}/performance`);
  return response?.data?.data || null;
}

export async function fetchAdminInstructorAvailability(id) {
  const response = await client.get(`${endpoints.admin.instructors}/${id}/availability`);
  return response?.data?.data || [];
}

export async function createAdminInstructorAvailability(id, body) {
  const response = await client.post(`${endpoints.admin.instructors}/${id}/availability`, body);
  return response?.data?.data;
}

export async function updateAdminInstructorAvailabilityPrice(id, slotId, price) {
  const response = await client.patch(`${endpoints.admin.instructors}/${id}/availability/${slotId}`, { price });
  return response?.data?.data;
}

export async function deleteAdminInstructorAvailability(id, slotId) {
  const response = await client.delete(`${endpoints.admin.instructors}/${id}/availability/${slotId}`);
  return response?.data?.data;
}

export async function createInstructor(body) {
  const response = await client.post(endpoints.admin.instructors, body);
  return response?.data?.data;
}

export async function updateInstructor({ id, body }) {
  const response = await client.patch(`${endpoints.admin.instructors}/${id}`, body);
  return response?.data?.data;
}

export async function deleteInstructor(id) {
  const response = await client.delete(`${endpoints.admin.instructors}/${id}`);
  return response?.data?.data;
}
