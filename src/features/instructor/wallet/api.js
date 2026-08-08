import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchWalletSummary() {
  const response = await client.get(endpoints.instructor.wallet);
  return response?.data?.data;
}

export async function fetchWalletTransactions(params) {
  const response = await client.get(`${endpoints.instructor.wallet}/transactions`, { params });
  return response?.data?.data || { transactions: [], pagination: null };
}

export async function fetchWalletPayouts() {
  const response = await client.get(`${endpoints.instructor.wallet}/payouts`);
  return response?.data?.data || [];
}

export async function requestPayout(body) {
  const response = await client.post(`${endpoints.instructor.wallet}/payouts`, body);
  return response?.data?.data;
}
