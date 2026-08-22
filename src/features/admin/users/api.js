import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchAdminUsers(params) {
  const q = { ...params };
  if (q.role === "" || q.role == null) delete q.role;
  if (q.isActive === "" || q.isActive == null) delete q.isActive;
  if (q.search === "" || q.search == null) delete q.search;
  const response = await client.get(endpoints.admin.users, { params: q });
  const users = response?.data?.data;
  const meta = response?.data?.meta;
  return {
    users: Array.isArray(users) ? users : [],
    meta: meta || null,
  };
}

/** Load every matching user by walking pagination (picker / typeahead use). */
export async function fetchAllAdminUsers(params = {}) {
  const pageSize = Math.min(Math.max(Number(params.limit) || 200, 1), 500);
  const base = { ...params, limit: pageSize };
  delete base.page;

  let page = 1;
  let totalPages = 1;
  const users = [];
  let meta = null;

  do {
    const result = await fetchAdminUsers({ ...base, page });
    users.push(...result.users);
    meta = result.meta;
    totalPages = Math.max(1, Number(meta?.totalPages) || 1);
    page += 1;
  } while (page <= totalPages && page <= 100);

  return {
    users,
    meta: meta
      ? { ...meta, total: Number(meta.total) || users.length, page: 1, limit: users.length, totalPages: 1 }
      : { total: users.length, page: 1, limit: users.length, totalPages: 1 },
  };
}


export async function fetchAdminUserById(id) {
  const response = await client.get(`${endpoints.admin.users}/${id}`);
  return response?.data?.data || null;
}

export async function fetchAdminStudentPerformance(studentId) {
  const response = await client.get(`${endpoints.admin.students}/${studentId}/performance`);
  return response?.data?.data || null;
}

export async function toggleAdminUserActive(id) {
  const response = await client.patch(`${endpoints.admin.users}/${id}/toggle-active`);
  return response?.data?.data;
}

export async function updateAdminUser({ id, body }) {
  const response = await client.patch(`${endpoints.admin.users}/${id}`, body);
  return response?.data?.data || null;
}

export async function setAdminUserPassword({ id, newPassword }) {
  const response = await client.patch(`${endpoints.admin.users}/${id}/change-password`, { newPassword });
  return response?.data?.data || null;
}

export async function createStudentByAdmin(body) {
  const payload = {
    fullName: body.fullName,
    email: body.email,
    password: body.password,
    confirmPassword: body.confirmPassword || body.password,
    phone: body.phone || undefined,
  };
  const response = await client.post("/auth/register", payload);
  return response?.data?.data || null;
}

export async function createAdminStaffUser(body) {
  const response = await client.post(endpoints.admin.users, body);
  return response?.data?.data || null;
}

export async function grantUserPermission({ userId, permissionId, expiresAt }) {
  const response = await client.post(endpoints.admin.userPermissions(userId), {
    permissionId,
    expiresAt: expiresAt || undefined,
  });
  return response?.data?.data || null;
}

export async function revokeUserPermission({ userId, permissionId }) {
  const response = await client.delete(
    `${endpoints.admin.userPermissions(userId)}/${permissionId}`
  );
  return response?.data?.data || null;
}

export async function fetchUserSessions(userId) {
  const response = await client.get(endpoints.admin.userSessions(userId));
  const payload = response?.data?.data;
  return payload?.sessions || (Array.isArray(payload) ? payload : []);
}

export async function fetchUserDevices(userId) {
  const response = await client.get(endpoints.admin.userDevices(userId));
  const payload = response?.data?.data;
  return payload?.devices || (Array.isArray(payload) ? payload : []);
}

export async function forceLogoutUser(userId) {
  const response = await client.delete(endpoints.admin.forceLogout(userId));
  return response?.data?.data || null;
}

export async function deleteAdminUser(id) {
  const response = await client.delete(`${endpoints.admin.users}/${id}`);
  return response?.data?.data || null;
}
