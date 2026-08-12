import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminInstructorReviews(params = {}) {
  const res = await client.get(endpoints.admin.instructorReviews, {
    params: { includeHidden: "true", ...params },
  });
  return res?.data?.data ?? { reviews: [] };
}

export async function createAdminInstructorReview(body) {
  const res = await client.post(endpoints.admin.instructorReviews, body);
  return res?.data?.data ?? null;
}

export async function updateAdminInstructorReview(id, body) {
  const res = await client.patch(endpoints.admin.instructorReview(id), body);
  return res?.data?.data ?? null;
}

export async function deleteAdminInstructorReview(id) {
  const res = await client.delete(endpoints.admin.instructorReview(id));
  return res?.data?.data ?? null;
}
