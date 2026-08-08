import { create } from "zustand";
import { persist } from "zustand/middleware";

const DISMISS_KEY = "yaser_trial_dismissed_at";

export function getTrialDismissedAt() {
  const raw = localStorage.getItem(DISMISS_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function setTrialDismissedNow() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export function clearTrialDismissed() {
  localStorage.removeItem(DISMISS_KEY);
}

export function isTrialDismissedWithinDays(dismissDays) {
  const at = getTrialDismissedAt();
  if (!at) return false;
  const days = Math.max(0, Number(dismissDays) || 0);
  if (days === 0) return true;
  return Date.now() - at < days * 24 * 60 * 60 * 1000;
}

const useTrialStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      trialId: null,
      startedAt: null,
      expiresAt: null,
      status: null,
      remainingMs: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      setSession: ({ accessToken, trialId, startedAt, expiresAt, status, remainingMs }) => {
        if (accessToken) localStorage.setItem("trialAccessToken", accessToken);
        else if (accessToken === null) localStorage.removeItem("trialAccessToken");
        set((prev) => ({
          accessToken: accessToken !== undefined ? accessToken || null : prev.accessToken,
          trialId: trialId !== undefined ? trialId || null : prev.trialId,
          startedAt: startedAt !== undefined ? startedAt || null : prev.startedAt,
          expiresAt: expiresAt !== undefined ? expiresAt || null : prev.expiresAt,
          status: status !== undefined ? status || null : prev.status,
          remainingMs: remainingMs !== undefined ? remainingMs : prev.remainingMs,
        }));
      },

      clearSession: () => {
        localStorage.removeItem("trialAccessToken");
        set({
          accessToken: null,
          trialId: null,
          startedAt: null,
          expiresAt: null,
          status: null,
          remainingMs: null,
        });
      },

      isActive: () => {
        const { accessToken, expiresAt, status } = get();
        if (!accessToken || !expiresAt) return false;
        if (status === "REVOKED") return false;
        return new Date(expiresAt).getTime() > Date.now();
      },

      isExpired: () => {
        const { expiresAt, accessToken, status } = get();
        if (!accessToken || !expiresAt) return false;
        if (status === "REVOKED") return true;
        return new Date(expiresAt).getTime() <= Date.now();
      },
    }),
    {
      name: "yaser-trial-session",
      partialize: (s) => ({
        accessToken: s.accessToken,
        trialId: s.trialId,
        startedAt: s.startedAt,
        expiresAt: s.expiresAt,
        status: s.status,
        remainingMs: s.remainingMs,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem("trialAccessToken", state.accessToken);
        }
        state?.setHydrated?.(true);
      },
    }
  )
);

export default useTrialStore;
