import client from "../../../api/client";

export type ProfileMe = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar?: string | null;
  bio?: string | null;
  experience?: number | null;
};

export async function fetchProfileMe(): Promise<ProfileMe> {
  const res = await client.get("/profile/me");
  return res?.data?.data as ProfileMe;
}

export async function updateProfileMe(payload: {
  fullName?: string;
  phone?: string;
  bio?: string;
  experience?: number;
}) {
  const res = await client.patch("/profile/me", payload);
  return res?.data?.data as ProfileMe;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  const res = await client.patch("/profile/change-password", payload);
  return res?.data?.data;
}

export async function updateMyAvatar(avatar: string | null) {
  const res = await client.patch("/profile/me/avatar", { avatar });
  return res?.data?.data as { avatar: string | null };
}
