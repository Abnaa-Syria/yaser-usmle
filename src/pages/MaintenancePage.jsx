import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Construction, LogIn } from "lucide-react";
import { useSiteSettings } from "../features/public/siteSettings/hooks";

export default function MaintenancePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || "Yaser USMLE";

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#071733] px-6 py-16 text-center text-white"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-300 backdrop-blur-md">
          <Construction className="h-8 w-8" aria-hidden />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200/80">{siteName}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {t("maintenance.title", {
            defaultValue: isRtl ? "الموقع تحت الصيانة" : "We'll be right back",
          })}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
          {t("maintenance.body", {
            defaultValue: isRtl
              ? "نقوم حالياً بأعمال صيانة لتحسين المنصة. شكراً لصبرك — سنعود قريباً."
              : "We're performing scheduled maintenance to improve the platform. Thanks for your patience — we'll be back shortly.",
          })}
        </p>

        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            {t("maintenance.staffLogin", {
              defaultValue: isRtl ? "دخول الطاقم" : "Staff sign in",
            })}
          </Link>
        </div>
      </div>
    </div>
  );
}
