import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminExams(params = {}) {
  const response = await client.get(endpoints.admin.exams, { params });
  const payload = response?.data?.data;
  return {
    exams: payload?.exams || (Array.isArray(payload) ? payload : []),
    meta: payload?.pagination || null,
  };
}

export async function fetchAdminExamById(id) {
  const response = await client.get(`${endpoints.admin.exams}/${id}`);
  return response?.data?.data || null;
}

export async function createAdminExam(body) {
  const response = await client.post(endpoints.admin.exams, body);
  return response?.data?.data || null;
}

export async function updateAdminExam({ id, body }) {
  const response = await client.patch(`${endpoints.admin.exams}/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminExam(id) {
  const response = await client.delete(`${endpoints.admin.exams}/${id}`);
  return response?.data?.data || null;
}

export async function addAdminExamQuestion({ examId, body }) {
  const response = await client.post(`${endpoints.admin.exams}/${examId}/questions`, body);
  return response?.data?.data || null;
}

export async function updateAdminExamQuestion({ examId, questionId, body }) {
  const response = await client.patch(`${endpoints.admin.exams}/${examId}/questions/${questionId}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminExamQuestion({ examId, questionId }) {
  const response = await client.delete(`${endpoints.admin.exams}/${examId}/questions/${questionId}`);
  return response?.data?.data || null;
}

export async function fetchAdminExamSubmissions(examId, params = {}) {
  const response = await client.get(`${endpoints.admin.exams}/${examId}/submissions`, { params });
  const payload = response?.data?.data;
  return {
    submissions: payload?.submissions || [],
    meta: payload?.pagination || null,
  };
}
