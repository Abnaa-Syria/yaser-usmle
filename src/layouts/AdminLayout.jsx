import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  filterNavByPermission,
  getAdminNavigation,
} from "../config/navigation";
import { usePermissions } from "../hooks/usePermissions";
import { useSessionHeartbeat } from "../hooks/useSessionHeartbeat";
import useAuthStore from "../store/authStore";
import { fetchAdminTickets } from "../features/admin/tickets/api";
import AdminSidebar from "./admin/AdminSidebar";
import AdminTopbar from "./admin/AdminTopbar";

function AdminLayout() {
  const { t } = useTranslation();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const { hasPermission } = usePermissions();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useSessionHeartbeat(true);

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, [refreshProfile]);

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

  const { data: ticketsData } = useQuery({
    queryKey: ["admin", "tickets", "open-count"],
    queryFn: () => fetchAdminTickets({ status: "OPEN" }),
    enabled: hasPermission("support:manage"),
    staleTime: 60_000,
  });

  const openTicketsCount = useMemo(() => {
    const tickets = ticketsData?.tickets || [];
    return tickets.filter((t) => String(t.status || "").toUpperCase() === "OPEN").length;
  }, [ticketsData]);

  const sidebarSections = useMemo(
    () => filterNavByPermission(getAdminNavigation(openTicketsCount), hasPermission),
    [openTicketsCount, hasPermission]
  );

  return (
    <div className="admin-shell flex min-h-screen font-sans text-slate-900 selection:bg-[var(--yu-blue-100)] dark:text-slate-100 dark:selection:bg-[var(--yu-blue-800)]/40">
      {isMobileSidebarOpen ? (
        <button
          type="button"
          aria-label={t("common.closeMenu", { defaultValue: "Close menu" })}
          className="fixed inset-0 z-[90] bg-[#050B16]/60 backdrop-blur-[3px] lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      ) : null}

      <AdminSidebar
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
              "radial-gradient(ellipse 75% 48% at 100% -8%, rgba(27,79,191,0.12), transparent 52%), radial-gradient(ellipse 50% 35% at 0% 100%, rgba(15,36,72,0.06), transparent 50%), linear-gradient(165deg, #F3F6FB 0%, #E8EEF8 42%, #F7F9FC 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4] dark:hidden"
          aria-hidden
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231B4FBF' fill-opacity='0.03'%3E%3Cpath d='M36 18l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 65% 40% at 95% 0%, rgba(59,130,246,0.14), transparent 48%), linear-gradient(180deg, #050B16 0%, #0A1424 50%, #08101C 100%)",
          }}
        />

        <AdminTopbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="admin-shell-content mx-auto max-w-[90rem] animate-[adminFadeIn_0.4s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
