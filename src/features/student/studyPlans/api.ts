import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchStudyPlans() {
  const res = await client.get(endpoints.student.studyPlans);
  return res?.data?.data ?? [];
}

export async function createStudyPlan(body: { title: string; goal?: string; targetDate?: string }) {
  const res = await client.post(endpoints.student.studyPlans, body);
  return res?.data?.data ?? null;
}

export async function updateStudyPlan(planId: string, body: Record<string, unknown>) {
  const res = await client.patch(endpoints.student.studyPlan(planId), body);
  return res?.data?.data ?? null;
}

export async function deleteStudyPlan(planId: string) {
  const res = await client.delete(endpoints.student.studyPlan(planId));
  return res?.data?.data ?? null;
}

export async function createStudyPlanItem(planId: string, body: Record<string, unknown>) {
  const res = await client.post(endpoints.student.studyPlanItems(planId), body);
  return res?.data?.data ?? null;
}

export async function updateStudyPlanItem(planId: string, itemId: string, body: Record<string, unknown>) {
  const res = await client.patch(endpoints.student.studyPlanItem(planId, itemId), body);
  return res?.data?.data ?? null;
}

export async function deleteStudyPlanItem(planId: string, itemId: string) {
  const res = await client.delete(endpoints.student.studyPlanItem(planId, itemId));
  return res?.data?.data ?? null;
}
