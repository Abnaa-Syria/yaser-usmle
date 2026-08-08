import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../../store/authStore";
import { changePassword, fetchProfileMe, updateMyAvatar, updateProfileMe } from "./api";

export function useProfileMe(enabled = true) {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchProfileMe,
    enabled,
    retry: false,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfileMe,
    onSuccess: (data) => {
      const prev = useAuthStore.getState().user;
      if (prev && data) {
        useAuthStore.setState({
          user: {
            ...prev,
            fullName: data.fullName ?? prev.fullName,
            phone: data.phone ?? prev.phone,
            avatar: data.avatar ?? prev.avatar,
            bio: data.bio ?? prev.bio,
            experience: data.experience ?? prev.experience,
          },
        });
      }
      void qc.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyAvatar,
    onSuccess: (data) => {
      const prev = useAuthStore.getState().user;
      if (prev && data) {
        useAuthStore.setState({
          user: { ...prev, avatar: data.avatar ?? null },
        });
      }
      void qc.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}
