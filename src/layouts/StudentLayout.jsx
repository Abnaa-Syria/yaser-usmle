import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentNavigation } from "../config/navigation";
import StudentSidebar from "./student/StudentSidebar";
import StudentTopbar from "./student/StudentTopbar";

function StudentLayout() {
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarSections = getStudentNavigation();

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

      <StudentSidebar
        sections={sidebarSections}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 100% -10%, rgba(27,79,191,0.10), transparent 55%), radial-gradient(ellipse 60% 40% at 0% 0%, rgba(245,158,11,0.06), transparent 45%), linear-gradient(180deg, #F4F7FC 0%, #EEF3FA 48%, #F8FAFD 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] dark:hidden" aria-hidden style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231B4FBF' fill-opacity='0.035'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z'/%3E%3C/g%3E%3C/svg%3E\")",
        }} />
        <div
          className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 90% -5%, rgba(59,130,246,0.16), transparent 50%), linear-gradient(180deg, #070E1A 0%, #0B1628 55%, #0A1322 100%)",
          }}
        />

        <StudentTopbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="student-shell-content mx-auto max-w-7xl animate-[studentFadeIn_0.45s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
