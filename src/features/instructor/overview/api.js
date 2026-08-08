import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import { unwrapResponse } from "../../../api/error";

export async function fetchInstructorOverview() {
  const response = await client.get(endpoints.instructorDashboard.overview);
  return unwrapResponse(response);
}
