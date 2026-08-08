import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorPerformance() {
  const response = await client.get(endpoints.instructor.performance);
  return response?.data?.data ?? null;
}
