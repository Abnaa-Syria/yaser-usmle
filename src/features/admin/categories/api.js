import client from "../../../api/client";

export async function fetchAdminCategories(params = {}) {
  const response = await client.get("/admin/categories", { params });
  const payload = response?.data?.data;
  return {
    categories: payload?.categories || payload || [],
    meta: payload?.pagination || null,
  };
}

export async function createAdminCategory(body) {
  const response = await client.post("/admin/categories", body);
  return response?.data?.data || null;
}

export async function updateAdminCategory({ id, body }) {
  const response = await client.patch(`/admin/categories/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminCategory(id) {
  const response = await client.delete(`/admin/categories/${id}`);
  return response?.data?.data || null;
}

