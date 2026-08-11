import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchMyGamification() {
  const res = await client.get(endpoints.student.gamificationMe);
  return res?.data?.data ?? null;
}

export async function fetchGamificationLeaderboard(params: {
  scope?: "global" | "course";
  period?: "week" | "all";
  courseId?: string;
  limit?: number;
} = {}) {
  const res = await client.get(endpoints.student.gamificationLeaderboard, { params });
  return res?.data?.data ?? null;
}

export async function fetchGamificationBadges() {
  const res = await client.get(endpoints.student.gamificationBadges);
  return res?.data?.data ?? [];
}

export async function fetchCurrentChallenge() {
  const res = await client.get(endpoints.student.gamificationChallenge);
  return res?.data?.data ?? null;
}

export async function patchGamificationPrivacy(displayNameOptOut: boolean) {
  const res = await client.patch(endpoints.student.gamificationPrivacy, { displayNameOptOut });
  return res?.data?.data ?? null;
}

export async function postFlashcardSessionXp(sessionKey: string) {
  const res = await client.post(endpoints.student.gamificationFlashcardSession, { sessionKey });
  return res?.data?.data ?? null;
}
