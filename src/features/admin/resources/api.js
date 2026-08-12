import client from "../../api/client";

export async function fetchAdminLessonResources(lessonId) {
  const response = await client.get(`/admin/lessons/${lessonId}/resources`);
  const data = response?.data?.data;
  return Array.isArray(data) ? data : data?.resources || [];
}

export async function uploadAdminLessonResource(lessonId, file, title) {
  const form = new FormData();
  form.append("file", file);
  if (title?.trim()) form.append("title", title.trim());
  const response = await client.post(`/admin/lessons/${lessonId}/resources/upload`, form);
  return response?.data?.data;
}

export async function deleteAdminLessonResource(resourceId) {
  const response = await client.delete(`/admin/resources/${resourceId}`);
  return response?.data?.data;
}
