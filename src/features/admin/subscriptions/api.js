import client from "../../../api/client";

export async function fetchAdminSubscriptions() {
  const response = await client.get("/admin/subscriptions");
  return response?.data?.data || [];
}

export async function updateAdminSubscriptionStatus({ id, status }) {
  const response = await client.patch(`/admin/subscriptions/${id}/status`, { status });
  return response?.data?.data || null;
}

export async function fetchAdminSubscriptionEnrollments() {
  const response = await client.get("/admin/subscriptions/enrollments");
  return response?.data?.data || [];
}

export async function createAdminSubscription(body) {
  const response = await client.post("/admin/subscriptions", body);
  return response?.data?.data || null;
}

export async function createAdminSubscriptionEnrollment(body) {
  const response = await client.post("/admin/subscriptions/enrollments", body);
  return response?.data?.data || null;
}

export async function fetchAdminSubscriptionLookups() {
  try {
    const response = await client.get("/admin/subscriptions/lookups", {
      params: { _ts: Date.now() },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    return response?.data?.data || { students: [], packages: [], courses: [] };
  } catch {
    return { students: [], packages: [], courses: [] };
  }
}

