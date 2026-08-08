import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, FlaskConical, Globe, Home, Menu, Moon, Sun, UserPlus } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useLang } from "../../contexts/LangContext";
import TrialCountdown from "../../components/trial/TrialCountdown";

export default function TrialTopbar({ onMenuClick, remainingDays, expiresAt, expired, revoked }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();

  let banner;
  if (revoked) {
    banner = t("trial.bannerRevoked", {
      defaultValue: isAr ? "تم إيقاف التجربة على هذا الجهاز من الإدارة" : "Trial stopped on this device by admin",
    });
  } else if (expired) {
    banner = t("trial.bannerExpired", { defaultValue: isAr ? "انتهت فترة التجربة المجانية" : "Your free trial has ended" });
  } else {
    banner = (
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>
          {t("trial.bannerActiveClock", {
            defaultValue: isAr ? "لوحة طالب تجريبية · الوقت المتبقي على هذا الجهاز:" : "Student trial panel · time left on this device:",
          })}
        </span>
        <TrialCountdown expiresAt={expiresAt} expired={expired} className="rounded-md bg-amber-200/60 px-2 py-0.5 font-black dark:bg-amber-500/20" />
        <span className="opacity-70">({remainingDays}d)</span>
      </span>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/8 dark:bg-[#0B1628]/75">
      <div className="border-b border-amber-200/70 bg-amber-50 px-3 py-1.5 text-center text-[11px] font-bold text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100 sm:px-6">
        <span className="inline-flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" />
          {banner}
        </span>
      </div>
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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              {t("trial.badge", { defaultValue: isAr ? "تجربة مجانية" : "Free trial" })}
            </p>
            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {t("header.dashboardMenu.studentPanel", { defaultValue: isAr ? "لوحة الطالب" : "Student panel" })}
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
              <Home className="h-3.5 w-3.5" />
              {t("header.home", { defaultValue: isAr ? "الرئيسية" : "Home" })}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/signup"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-3 text-xs font-black text-white shadow-[var(--shadow-cta)]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {t("trial.saveProgress", { defaultValue: isAr ? "أنشئ حساباً" : "Create account" })}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
