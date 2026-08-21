import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminSettings() {
  const response = await client.get(endpoints.admin.settings);
  const data = response?.data?.data;
  return Array.isArray(data) ? data : [];
}

export async function updateAdminSettings(body) {
  const response = await client.patch(endpoints.admin.settings, body);
  return response?.data?.data || {};
}

export async function uploadAdminLogo(file) {
  const formData = new FormData();
  formData.append("logo", file);
  const response = await client.post(`${endpoints.admin.settings}/logo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response?.data?.data || null;
}

export async function uploadPaymentMethodAsset(file) {
  const formData = new FormData();
  formData.append("asset", file);
  const response = await client.post(`${endpoints.admin.settings}/payment-method-asset`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response?.data?.data || null;
}

export async function fetchAdminEmailTemplates() {
  const response = await client.get(`${endpoints.admin.settings}/emails`);
  return response?.data?.data || [];
}

export async function createAdminEmailTemplate(body) {
  const response = await client.post(`${endpoints.admin.settings}/emails`, body);
  return response?.data?.data || null;
}

export async function updateAdminEmailTemplate({ id, body }) {
  const response = await client.patch(`${endpoints.admin.settings}/emails/${id}`, body);
  return response?.data?.data || null;
}

export async function deleteAdminEmailTemplate(id) {
  const response = await client.delete(`${endpoints.admin.settings}/emails/${id}`);
  return response?.data?.data || null;
}

export async function previewAdminEmailTemplate(body) {
  const response = await client.post(`${endpoints.admin.settings}/emails/preview`, body);
  return response?.data?.data || null;
}

export async function sendTestAdminEmailTemplate(body) {
  const response = await client.post(`${endpoints.admin.settings}/emails/send-test`, body);
  return response?.data?.data || null;
}

