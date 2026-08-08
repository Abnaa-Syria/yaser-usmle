import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/dashboard/Topbar";

function DashboardLayout({ sidebarSections = [] }) {
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen font-sans transition-all duration-300 selection:bg-blue-100 dark:selection:bg-blue-900/30 dark:selection:text-white" style={{ backgroundColor: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }}>
      {/* Mobile drawer backdrop — below sidebar (z-[100]), above page */}
      {isMobileSidebarOpen ? (
        <button
          type="button"
          aria-label={t("common.closeMenu")}
          className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <Sidebar
        sections={sidebarSections}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="relative flex min-w-0 min-h-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}



export default DashboardLayout;
