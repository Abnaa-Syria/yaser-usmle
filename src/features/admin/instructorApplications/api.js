import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorApplications(params = {}) {
  const response = await client.get(endpoints.admin.instructorApplications, { params });
  const payload = response?.data?.data;
  return Array.isArray(payload) ? payload : payload?.applications || [];
}

export async function updateInstructorApplication({ id, body }) {
  const response = await client.patch(endpoints.admin.instructorApplication(id), body);
  return response?.data?.data;
}
