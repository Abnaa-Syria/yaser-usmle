import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminGamificationStats() {
  const res = await client.get(endpoints.admin.gamificationStats);
  return res?.data?.data ?? null;
}

export async function fetchAdminChallenges() {
  const res = await client.get(endpoints.admin.gamificationChallenges);
  return res?.data?.data ?? [];
}

export async function createAdminChallenge(body) {
  const res = await client.post(endpoints.admin.gamificationChallenges, body);
  return res?.data?.data ?? null;
}

export async function seedAdminBadges() {
  const res = await client.post(endpoints.admin.gamificationSeedBadges);
  return res?.data?.data ?? null;
}
