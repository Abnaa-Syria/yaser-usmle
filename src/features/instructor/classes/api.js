import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorClasses(params) {
  const response = await client.get(endpoints.instructor.classes, { params });
  return {
    classes: response?.data?.data || [],
    meta: response?.data?.meta || null,
  };
}
