import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen, Shield, X } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import useAuthStore from "../../store/authStore";
import { isNavGroup } from "../../config/navigation";

function isItemActive(item, pathname) {
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

function AdminNavLink({ item, collapsed, onNavigate }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const Icon = item.icon;
  const active = isItemActive(item, pathname);

  return (
    <NavLink
      to={item.path}
      title={collapsed ? t(item.labelKey) : undefined}
      onClick={onNavigate}
      className={[
        "group relative flex items-center rounded-xl text-[13px] font-semibold transition-all duration-200",
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
        active
          ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          : "text-blue-100/70 hover:bg-white/6 hover:text-white",
      ].join(" ")}
    >
      {active ? (
        <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-[var(--yu-amber-400)]" aria-hidden />
      ) : null}
      {Icon ? <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[var(--yu-amber-400)]" : ""}`} /> : null}
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
          {item.badge ? (
            <span className="rounded-md bg-[var(--yu-amber-500)] px-1.5 py-0.5 text-[10px] font-black text-[#0A1628]">
              {item.badge}
            </span>
          ) : null}
        </>
      ) : item.badge ? (
        <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-[var(--yu-amber-400)]" />
      ) : null}
    </NavLink>
  );
}

function AdminNavGroup({ group, collapsed }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const Icon = group.icon;
  const isAnyChildActive = group.children.some((child) => isItemActive(child, pathname));
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem(`yu-admin-nav-${group.labelKey}`);
    if (saved !== null) return saved === "true";
    return isAnyChildActive;
  });

  useEffect(() => {
    localStorage.setItem(`yu-admin-nav-${group.labelKey}`, String(open));
  }, [group.labelKey, open]);

  if (collapsed) {
    return (
      <NavLink
        to={group.basePath}
        title={t(group.labelKey)}
        className={[
          "flex items-center justify-center rounded-xl px-2 py-2.5 transition",
          isAnyChildActive ? "bg-white/12 text-white" : "text-blue-100/70 hover:bg-white/6 hover:text-white",
        ].join(" ")}
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition",
          isAnyChildActive ? "text-white" : "text-blue-100/70 hover:bg-white/6 hover:text-white",
        ].join(" ")}
      >
        <span className="flex min-w-0 items-center gap-3">
          {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
          <span className="truncate">{t(group.labelKey)}</span>
        </span>
        <ChevronRight
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 rtl:rotate-180 ${open ? "rotate-90" : ""}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-96" : "max-h-0"}`}>
        <div className="ms-3 space-y-0.5 border-s border-white/10 ps-2 pb-1">
          {group.children.map((child) => (
            <AdminNavLink key={child.path} item={child} collapsed={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ sections = [], isMobileOpen, setIsMobileOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setIsMobileOpen?.(false);
  }, [pathname, setIsMobileOpen]);

  const initials = useMemo(() => {
    return String(user?.fullName || "AD")
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }, [user?.fullName]);

  const widthClass = collapsed ? "lg:w-[5.25rem]" : "lg:w-[17.75rem]";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside
      className={[
        "admin-sidebar relative flex h-screen shrink-0 flex-col text-white transition-[width,transform] duration-300 ease-out",
        "bg-[linear-gradient(165deg,#050B16_0%,#0A1628_38%,#102A56_100%)]",
        "max-lg:fixed max-lg:inset-y-0 max-lg:start-0 max-lg:z-[100] max-lg:w-[min(18.5rem,90vw)] max-lg:shadow-2xl",
        "lg:sticky lg:top-0 lg:z-30 lg:self-start",
        widthClass,
        isMobileOpen ? "max-lg:translate-x-0" : "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -start-12 top-8 h-44 w-44 rounded-full bg-[var(--yu-blue-500)]/25 blur-3xl" />
        <div className="absolute -end-10 bottom-20 h-40 w-40 rounded-full bg-[var(--yu-amber-500)]/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div
        className={`relative flex h-[4.5rem] items-center border-b border-white/10 px-3 sm:h-20 ${
          collapsed ? "lg:justify-center lg:px-2" : "justify-between px-4"
        }`}
      >
        <Link
          to="/admin"
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
            aria-label={t("common.closeMenu", { defaultValue: "Close menu" })}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto overscroll-y-contain px-2.5 py-4 no-scrollbar">
        {!collapsed ? (
          <div className="mb-4 flex items-center gap-2 px-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--yu-amber-500)]/15 text-[var(--yu-amber-400)]">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/55">
                {t("header.dashboardMenu.adminPanel")}
              </p>
              <p className="truncate text-xs font-semibold text-blue-100/80">
                {t("admin.shell.controlCenter", { defaultValue: "Control center" })}
              </p>
            </div>
          </div>
        ) : null}

        {sections.map((section) => (
          <div key={section.labelKey} className="mb-5">
            {!collapsed ? (
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/40">
                {t(section.labelKey)}
              </p>
            ) : (
              <div className="mx-auto mb-2 h-px w-8 bg-white/10" />
            )}
            <nav className="space-y-1">
              {section.items.map((item) =>
                isNavGroup(item) ? (
                  <AdminNavGroup key={item.labelKey} group={item} collapsed={collapsed} />
                ) : (
                  <AdminNavLink
                    key={item.labelKey}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={() => setIsMobileOpen?.(false)}
                  />
                )
              )}
            </nav>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10 p-3">
        <div className={`flex items-center gap-3 rounded-xl bg-white/5 p-2.5 ${collapsed ? "lg:justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--yu-blue-600),var(--yu-blue-800))] text-xs font-black">
            {initials}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user?.fullName || t("admin.shell.adminFallback")}</p>
              <p className="truncate text-[11px] text-blue-200/60">{user?.email}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-blue-100/70 transition hover:bg-white/10 hover:text-white"
            aria-label={t("header.dashboardMenu.logout")}
            title={t("header.dashboardMenu.logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
