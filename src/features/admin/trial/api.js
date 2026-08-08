import client from "../../../api/client";

export async function fetchAdminTrial() {
  const response = await client.get("/admin/trial");
  return response?.data?.data || null;
}

export async function updateAdminTrialSettings(body) {
  const response = await client.patch("/admin/trial/settings", body);
  return response?.data?.data || null;
}

export async function replaceAdminTrialCourses(courses) {
  const response = await client.put("/admin/trial/courses", { courses });
  return response?.data?.data || null;
}

export async function fetchAdminTrialSessions({ status = "ALL", page = 1, limit = 20, q = "" } = {}) {
  const response = await client.get("/admin/trial/sessions", {
    params: { status, page, limit, q: q || undefined },
  });
  return response?.data?.data || null;
}

export async function revokeAdminTrialSession(id, reason) {
  const response = await client.post(`/admin/trial/sessions/${id}/revoke`, { reason });
  return response?.data?.data || null;
}

export async function restoreAdminTrialSession(id) {
  const response = await client.post(`/admin/trial/sessions/${id}/restore`);
  return response?.data?.data || null;
}
