import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTrialNavigation } from "../config/navigation";
import useTrialStore from "../store/trialStore";
import { useTrialMe } from "../features/trial/hooks";
import TrialSidebar from "./trial/TrialSidebar";
import TrialTopbar from "./trial/TrialTopbar";

export default function TrialLayout() {
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const hydrated = useTrialStore((s) => s.hydrated);
  const accessToken = useTrialStore((s) => s.accessToken);
  const clearSession = useTrialStore((s) => s.clearSession);
  const { data: me, isError, error } = useTrialMe(Boolean(accessToken));
  const sidebarSections = getTrialNavigation();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeIfDesktop = () => {
      if (mq.matches) setIsMobileSidebarOpen(false);
    };
    closeIfDesktop();
    mq.addEventListener("change", closeIfDesktop);
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  useEffect(() => {
    if (!isMobileSidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setIsMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (!isError) return;
    const msg = String(error?.response?.data?.message || error?.message || "");
    if (
      msg.includes("stopped by an administrator") ||
      msg.includes("does not match this device") ||
      msg.includes("already ended") ||
      msg.includes("expired")
    ) {
      clearSession();
    }
  }, [isError, error, clearSession]);

  if (!hydrated) return null;
  if (!accessToken) return <Navigate to="/login" replace />;

  const revoked = me?.status === "REVOKED" || me?.revoked;
  const expired = Boolean(me?.expired) || revoked || (isError && !me);
  const remainingDays = me?.remainingDays ?? 0;
  const remainingMs = me?.remainingMs ?? 0;
  const expiresAt = me?.expiresAt;

  return (
    <div className="student-shell flex min-h-screen font-sans text-slate-900 selection:bg-[var(--yu-blue-100)] dark:text-slate-100 dark:selection:bg-[var(--yu-blue-800)]/40">
      {isMobileSidebarOpen ? (
        <button
          type="button"
          aria-label={t("common.closeMenu")}
          className="fixed inset-0 z-[90] bg-[#07111F]/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      ) : null}

      <TrialSidebar
        sections={sidebarSections}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        remainingDays={remainingDays}
        remainingMs={remainingMs}
        expiresAt={expiresAt}
        expired={expired}
        revoked={revoked}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 100% -10%, rgba(27,79,191,0.10), transparent 55%), radial-gradient(ellipse 60% 40% at 0% 0%, rgba(245,158,11,0.08), transparent 45%), linear-gradient(180deg, #F4F7FC 0%, #EEF3FA 48%, #F8FAFD 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 90% -5%, rgba(59,130,246,0.16), transparent 50%), linear-gradient(180deg, #070E1A 0%, #0B1628 55%, #0A1322 100%)",
          }}
        />

        <TrialTopbar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          remainingDays={remainingDays}
          remainingMs={remainingMs}
          expiresAt={expiresAt}
          expired={expired}
          revoked={revoked}
        />

        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="student-shell-content mx-auto max-w-7xl animate-[studentFadeIn_0.45s_ease-out]">
            <Outlet context={{ me, expired, remainingDays, remainingMs, expiresAt, revoked }} />
          </div>
        </main>
      </div>
    </div>
  );
}
