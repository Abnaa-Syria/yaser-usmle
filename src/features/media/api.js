import client from "../../api/client";
import endpoints from "../../api/endpoints";

export async function fetchMediaLibrary(params = {}) {
  const response = await client.get(endpoints.media.list, { params });
  return response?.data?.data || { items: [], meta: {} };
}

export async function uploadMediaFile(file) {
  const form = new FormData();
  form.append("file", file);
  // Do not set Content-Type manually — browser must include multipart boundary.
  const response = await client.post(endpoints.media.upload, form);
  return response?.data?.data;
}

export async function deleteMediaAsset(id) {
  const response = await client.delete(endpoints.media.item(id));
  return response?.data?.data;
}
