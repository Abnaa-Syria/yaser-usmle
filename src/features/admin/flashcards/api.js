import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminFlashcards(params = {}) {
  const response = await client.get(endpoints.admin.flashcards, { params });
  const payload = response?.data?.data;
  return Array.isArray(payload) ? payload : payload?.flashcards || [];
}

export async function createAdminFlashcard(body) {
  const response = await client.post(endpoints.admin.flashcards, body);
  return response?.data?.data;
}

export async function updateAdminFlashcard({ id, body }) {
  const response = await client.patch(`${endpoints.admin.flashcards}/${id}`, body);
  return response?.data?.data;
}

export async function deleteAdminFlashcard(id) {
  const response = await client.delete(`${endpoints.admin.flashcards}/${id}`);
  return response?.data?.data;
}
