import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-canvas)] px-6 py-16 text-center">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--yu-blue-50)] blur-3xl dark:bg-[var(--yu-blue-900)]/20" />
      </div>

      <div className="relative">
        <p className="text-8xl font-black tracking-tight text-[var(--yu-blue-100)] dark:text-[var(--yu-blue-900)] select-none" aria-hidden>
          404
        </p>
        <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--yu-blue-50)] text-[var(--yu-blue-600)] mx-auto dark:bg-[var(--yu-blue-700)]/10 dark:text-[var(--yu-blue-400)]">
          <Search className="h-8 w-8" aria-hidden />
        </div>

        <h1 className="mt-5 text-2xl font-black text-[var(--color-text-primary)] md:text-3xl">
          {t("notFound.title", { defaultValue: isRtl ? "الصفحة غير موجودة" : "Page not found" })}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)]">
          {t("notFound.body", {
            defaultValue: isRtl
              ? "الرابط الذي طلبته غير موجود أو تم نقله. تأكد من صحة الرابط أو ابدأ من الصفحة الرئيسية."
              : "The page you requested doesn't exist or has been moved. Check the URL or start from the homepage.",
          })}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home className="h-4 w-4" aria-hidden />
            {t("notFound.home", { defaultValue: isRtl ? "الرئيسية" : "Go home" })}
          </Link>
          <Link
            to="/explore"
            className="btn-secondary inline-flex"
          >
            {t("notFound.cta", { defaultValue: isRtl ? "تصفّح الدورات" : "Browse courses" })}
          </Link>
        </div>
      </div>
    </div>
  );
}
