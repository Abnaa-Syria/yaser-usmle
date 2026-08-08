import client from "../../api/client";
import { getDeviceFingerprint } from "../../utils/deviceFingerprint";

async function trialOpts(extra = {}) {
  const fingerprint = await getDeviceFingerprint();
  return {
    skip403Redirect: true,
    headers: { "X-Device-Fingerprint": fingerprint },
    ...extra,
  };
}

export async function fetchTrialFlashcards(filters = {}) {
  const response = await client.get("/trial/flashcards", await trialOpts({ params: filters }));
  return response?.data?.data || [];
}

export async function fetchTrialExams(filters = {}) {
  const response = await client.get("/trial/exams", await trialOpts({ params: filters }));
  return response?.data?.data || [];
}

export async function fetchTrialExam(examId) {
  const response = await client.get(`/trial/exams/${examId}`, await trialOpts());
  return response?.data?.data || null;
}

export async function startTrialExam(examId) {
  const response = await client.post(`/trial/exams/${examId}/start`, {}, await trialOpts());
  return response?.data?.data || null;
}

export async function submitTrialExam(examId, answers) {
  const response = await client.post(`/trial/exams/${examId}/submit`, { answers }, await trialOpts());
  return response?.data?.data || null;
}

export async function fetchTrialExamResult(examId, submissionId) {
  const response = await client.get(`/trial/exams/${examId}/results/${submissionId}`, await trialOpts());
  return response?.data?.data || null;
}
