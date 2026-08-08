import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import { unwrapResponse } from "../../../api/error";

export async function fetchPublicSiteSettings() {
  const response = await client.get(endpoints.public.siteSettings);
  return unwrapResponse(response);
}
