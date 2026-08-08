import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";
import { useLang } from "../../contexts/LangContext";
import NotificationBell from "../../components/dashboard/NotificationBell";

export default function AdminTopbar({ onMenuClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = useMemo(() => {
    return String(user?.fullName || "AD")
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }, [user?.fullName]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/8 dark:bg-[#0A1424]/80">
      <div className="flex h-[4.25rem] items-center justify-between gap-3 px-3 sm:h-[4.75rem] sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t("header.mobile.menuToggle")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-[var(--yu-blue-200)] hover:text-[var(--yu-blue-700)] lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            <Menu className="h-5 w-5 rtl:scale-x-[-1]" />
          </button>

          <div className="hidden min-w-0 md:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--yu-blue-600)] dark:text-[var(--yu-blue-400)]">
              {t("header.dashboardMenu.adminPanel")}
            </p>
            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {t("admin.shell.tagline")}
            </p>
          </div>

          <Link
            to="/"
            className="ms-1 hidden items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-3 py-2 text-xs font-bold text-white shadow-[var(--shadow-cta)] transition hover:bg-[var(--yu-blue-600)] lg:inline-flex"
          >
            <Globe className="h-3.5 w-3.5" />
            {t("header.dashboardMenu.visitWebsite")}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div className="flex overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-2.5 py-2 text-[11px] font-black transition ${
                lang === "ar"
                  ? "bg-[var(--yu-blue-700)] text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              AR
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-2 text-[11px] font-black transition ${
                lang === "en"
                  ? "bg-[var(--yu-blue-700)] text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("header.themeToggle", { defaultValue: "Toggle theme" })}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <NotificationBell />

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white py-1.5 pe-2 ps-1.5 shadow-sm transition hover:border-[var(--yu-blue-200)] dark:border-white/10 dark:bg-white/5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--yu-blue-600),var(--yu-blue-900))] text-[11px] font-black text-white">
                {initials}
              </span>
              <span className="hidden max-w-[7rem] truncate text-xs font-bold text-slate-800 sm:block dark:text-slate-100">
                {user?.fullName || t("admin.shell.adminFallback")}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {profileOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-30 cursor-default"
                  aria-label={t("common.closeMenu", { defaultValue: "Close" })}
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute end-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1 shadow-[var(--shadow-lg)] dark:border-white/10 dark:bg-[#0F1E38]">
                  {[
                    {
                      icon: LayoutDashboard,
                      label: t("sidebarNav.items.overview"),
                      onClick: () => navigate("/admin"),
                    },
                    {
                      icon: User,
                      label: t("header.dashboardMenu.account"),
                      onClick: () => navigate("/admin/account"),
                    },
                    {
                      icon: Settings,
                      label: t("sidebarNav.items.settings"),
                      onClick: () => navigate("/admin/settings"),
                    },
                  ].map((row) => (
                    <button
                      key={row.label}
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        row.onClick();
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      <row.icon className="h-3.5 w-3.5 text-[var(--yu-blue-700)]" />
                      {row.label}
                    </button>
                  ))}
                  <div className="my-1 border-t border-slate-100 dark:border-white/8" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("header.dashboardMenu.logout")}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
