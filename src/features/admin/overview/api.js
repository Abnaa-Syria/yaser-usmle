import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import { unwrapResponse } from "../../../api/error";

export async function fetchAdminStats() {
  const response = await client.get(endpoints.admin.stats);
  return unwrapResponse(response);
}

export async function fetchAdminOverview() {
  const response = await client.get(endpoints.admin.overview);
  return unwrapResponse(response);
}
