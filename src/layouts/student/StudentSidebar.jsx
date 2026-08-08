import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import useAuthStore from "../../store/authStore";
import { isNavGroup } from "../../config/navigation";

function isItemActive(item, pathname) {
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

export default function StudentSidebar({ sections = [], isMobileOpen, setIsMobileOpen }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setIsMobileOpen?.(false);
  }, [pathname, setIsMobileOpen]);

  const initials = useMemo(() => {
    return String(user?.fullName || "ST")
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }, [user?.fullName]);

  const widthClass = collapsed ? "lg:w-[5.25rem]" : "lg:w-[17.5rem]";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside
      className={[
        "student-sidebar flex h-screen shrink-0 flex-col text-white transition-[width,transform] duration-300 ease-out",
        "bg-[linear-gradient(180deg,#07111F_0%,#0B1A33_42%,#102A56_100%)]",
        "max-lg:fixed max-lg:inset-y-0 max-lg:start-0 max-lg:z-[100] max-lg:w-[min(18rem,88vw)] max-lg:shadow-2xl",
        "lg:sticky lg:top-0 lg:z-30 lg:self-start",
        widthClass,
        isMobileOpen ? "max-lg:translate-x-0" : "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -start-10 top-0 h-40 w-40 rounded-full bg-[var(--yu-blue-500)]/20 blur-3xl" />
        <div className="absolute -end-8 bottom-24 h-36 w-36 rounded-full bg-[var(--yu-amber-500)]/10 blur-3xl" />
      </div>

      <div
        className={`relative flex h-[4.5rem] items-center border-b border-white/10 px-3 sm:h-20 ${
          collapsed ? "lg:justify-center lg:px-2" : "justify-between px-4"
        }`}
      >
        <Link
          to="/student"
          className={`flex min-w-0 items-center gap-2.5 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}
          title="Yaser USMLE"
        >
          <BrandLogo variant="light" className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-100 transition hover:bg-white/10 lg:flex"
            aria-label={collapsed ? t("common.expandSidebar") : t("common.collapseSidebar")}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen?.(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-100 transition hover:bg-white/10 lg:hidden"
            aria-label={t("common.closeMenu")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto overscroll-y-contain px-2.5 py-4 no-scrollbar">
        {!collapsed ? (
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/55">
            {t("header.dashboardMenu.studentPanel", { defaultValue: isAr ? "لوحة الطالب" : "Student panel" })}
          </p>
        ) : null}

        {sections.map((section) => (
          <div key={section.labelKey} className="mb-5">
            {!collapsed ? (
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/45">
                {t(section.labelKey)}
              </p>
            ) : (
              <div className="mx-auto mb-2 h-px w-8 bg-white/10" />
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                if (isNavGroup(item)) return null;
                const Icon = item.icon;
                const active = isItemActive(item, pathname);
                return (
                  <NavLink
                    key={item.labelKey}
                    to={item.path}
                    title={collapsed ? t(item.labelKey) : undefined}
                    className={[
                      "group relative flex items-center rounded-xl text-[13px] font-semibold transition-all duration-200",
                      collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                      active
                        ? "bg-white text-[var(--yu-blue-950)] shadow-[0_10px_30px_rgba(15,23,42,0.22)]"
                        : "text-blue-100/75 hover:bg-white/8 hover:text-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                        active
                          ? "bg-[var(--yu-blue-50)] text-[var(--yu-blue-700)]"
                          : "bg-white/5 text-blue-100/80 group-hover:bg-white/10",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {!collapsed ? <span className="truncate">{t(item.labelKey)}</span> : null}
                    {!collapsed && typeof item.badge === "number" && item.badge > 0 ? (
                      <span className="ms-auto rounded-full bg-[var(--yu-amber-500)] px-1.5 py-0.5 text-[10px] font-black text-[var(--yu-blue-950)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={`relative border-t border-white/10 p-3 ${collapsed ? "lg:px-2" : ""}`}>
        <div
          className={[
            "rounded-2xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm",
            collapsed ? "lg:flex lg:flex-col lg:items-center lg:gap-2 lg:p-2" : "flex items-center gap-3",
          ].join(" ")}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#1B4FBF,#60A5FA)] text-xs font-black text-white ring-2 ring-white/20">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initials}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {user?.fullName || t("student.overview.studentFallback")}
              </p>
              <p className="truncate text-[11px] font-medium text-blue-200/70">{user?.email || ""}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-blue-100/80 transition hover:bg-rose-500/20 hover:text-rose-200"
            title={t("header.dashboardMenu.logout", { defaultValue: "Logout" })}
            aria-label={t("header.dashboardMenu.logout", { defaultValue: "Logout" })}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
