export type AdminUserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT" | "STAFF";

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar?: string | null;
  role: AdminUserRole | string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  customRole?: { id: string; name: string } | null;
};

export type AdminUsersPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
