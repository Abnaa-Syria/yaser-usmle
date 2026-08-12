import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchPayments(params) {
  const response = await client.get(`${endpoints.admin.financials}/payments`, { params });
  const payload = response?.data?.data;
  return payload?.payments || (Array.isArray(payload) ? payload : []);
}

export async function fetchCoupons(params) {
  const response = await client.get(endpoints.admin.coupons, { params });
  const payload = response?.data?.data;
  return {
    coupons: payload?.coupons || (Array.isArray(payload) ? payload : []),
    meta: payload?.pagination || null,
  };
}

export async function fetchPayouts(params = {}) {
  const response = await client.get(`${endpoints.admin.payouts}`, { params });
  const payload = response?.data?.data;
  if (payload?.payouts) return payload.payouts;
  if (Array.isArray(payload)) return payload;
  return [];
}


export async function processPayout({ id, body }) {
  const response = await client.patch(`${endpoints.admin.payouts}/${id}/process`, body);
  return response?.data?.data;
}

export async function updateAdminPaymentStatus({ id, status }) {
  const response = await client.patch(`${endpoints.admin.financials}/payments/${id}/status`, { status });
  return response?.data?.data;
}

export async function approveAdminPayment({ id, adminNote }) {
  const response = await client.patch(endpoints.admin.paymentApprove(id), { adminNote });
  return response?.data?.data;
}

export async function rejectAdminPayment({ id, rejectionReason }) {
  const response = await client.patch(endpoints.admin.paymentReject(id), { rejectionReason });
  return response?.data?.data;
}

/** Open admin payment proof with auth (blob URL). Plain <a href> cannot send Bearer token. */
export async function openAdminPaymentProof(paymentId) {
  try {
    const res = await client.get(endpoints.admin.paymentProof(paymentId), {
      responseType: "blob",
    });
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
    if (blob.type && blob.type.includes("application/json")) {
      const text = await blob.text();
      let message = "Could not open payment proof";
      try {
        message = JSON.parse(text)?.message || message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return url;
  } catch (err) {
    const data = err?.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        err.response.data = json;
      } catch {
        /* ignore */
      }
    }
    throw err;
  }
}

export async function updateInstructorCommission({ instructorId, commissionRate }) {
  const response = await client.patch(endpoints.admin.instructorCommission(instructorId), { commissionRate });
  return response?.data?.data;
}
