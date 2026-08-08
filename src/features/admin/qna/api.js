import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminQuestions(params) {
  const response = await client.get(`${endpoints.admin.qna}/questions`, { params });
  return response?.data?.data || [];
}

export async function replyToAdminQuestion({ questionId, body }) {
  const response = await client.post(`${endpoints.admin.qna}/questions/${questionId}/answers`, { body });
  return response?.data?.data;
}

export async function toggleResolveAdminQuestion(questionId) {
  const response = await client.patch(`${endpoints.admin.qna}/questions/${questionId}/resolve`);
  return response?.data?.data;
}
