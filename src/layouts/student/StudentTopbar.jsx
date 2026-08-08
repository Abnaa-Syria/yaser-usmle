import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Compass,
  Globe,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";
import { useLang } from "../../contexts/LangContext";
import NotificationBell from "../../components/dashboard/NotificationBell";

export default function StudentTopbar({ onMenuClick }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = useMemo(() => {
    return String(user?.fullName || "ST")
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
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/8 dark:bg-[#0B1628]/75">
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
              {t("header.dashboardMenu.studentPanel", { defaultValue: isAr ? "لوحة الطالب" : "Student panel" })}
            </p>
            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {t("student.shell.tagline", {
                defaultValue: isAr ? "مسارك المنظم نحو Step 1" : "Your focused path to Step 1",
              })}
            </p>
          </div>

          <div className="ms-1 hidden items-center gap-1.5 lg:flex">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[var(--yu-blue-200)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <Compass className="h-3.5 w-3.5" />
              {t("sidebarNav.items.websiteExplore", { defaultValue: isAr ? "استكشف" : "Explore" })}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-3 py-2 text-xs font-bold text-white shadow-[var(--shadow-cta)] transition hover:bg-[var(--yu-blue-600)]"
            >
              <Globe className="h-3.5 w-3.5" />
              {t("header.dashboardMenu.visitWebsite", { defaultValue: isAr ? "زيارة الموقع" : "Visit site" })}
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Link
            to="/explore"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:text-[var(--yu-blue-700)] md:hidden dark:border-white/10 dark:bg-white/5"
            aria-label={t("sidebarNav.items.websiteExplore")}
          >
            <Search className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            aria-label={t("common.toggleTheme")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                lang === "en" ? "bg-[var(--yu-blue-700)] text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                lang === "ar" ? "bg-[var(--yu-blue-700)] text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              AR
            </button>
          </div>

          <NotificationBell variant="dashboard" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white py-1 pe-2 ps-1 shadow-sm transition hover:border-[var(--yu-blue-200)] dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1B4FBF,#3B82F6)] text-[11px] font-black text-white">
                {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="hidden max-w-[9rem] text-start sm:block">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {user?.fullName || t("student.overview.studentFallback")}
              </p>
                <p className="truncate text-[10px] font-semibold text-slate-400">
                  {t("header.dashboardMenu.studentPanel", { defaultValue: isAr ? "لوحة الطالب" : "Student" })}
                </p>
              </div>
              <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition sm:block ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen ? (
              <div className="absolute end-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[var(--shadow-lg)] dark:border-white/10 dark:bg-[#0F1E38]">
                {[
                  { icon: Home, label: t("header.dashboardMenu.websiteHome", { defaultValue: isAr ? "الموقع" : "Website" }), onClick: () => navigate("/") },
                  { icon: Compass, label: t("sidebarNav.items.websiteExplore", { defaultValue: isAr ? "استكشف" : "Explore" }), onClick: () => navigate("/explore") },
                  { icon: User, label: t("header.dashboardMenu.account", { defaultValue: isAr ? "الحساب" : "Account" }), onClick: () => navigate("/student/settings") },
                  { icon: Settings, label: t("sidebarNav.items.settings", { defaultValue: isAr ? "الإعدادات" : "Settings" }), onClick: () => navigate("/student/settings") },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      item.onClick();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-[var(--yu-blue-50)] hover:text-[var(--yu-blue-800)] dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  {t("header.dashboardMenu.logout", { defaultValue: "Logout" })}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
