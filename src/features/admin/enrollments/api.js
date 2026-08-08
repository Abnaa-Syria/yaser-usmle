import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminEnrollments(params = {}) {
  const response = await client.get(endpoints.admin.enrollments, { params });
  const payload = response?.data?.data;
  return {
    enrollments: payload?.enrollments || (Array.isArray(payload) ? payload : []),
    meta: payload?.pagination || null,
    stats: payload?.stats || null,
  };
}


export async function createAdminEnrollment(body) {
  const response = await client.post(endpoints.admin.enrollments, body);
  return response?.data?.data || null;
}

export async function updateAdminEnrollmentExpiry({ id, expiresAt }) {
  const response = await client.patch(`${endpoints.admin.enrollments}/${id}`, { expiresAt });
  return response?.data?.data || null;
}

export async function revokeAdminEnrollment(id) {
  const response = await client.delete(`${endpoints.admin.enrollments}/${id}`);
  return response?.data?.data || null;
}

