import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldX, Home } from "lucide-react";

export default function AccessDenied() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-canvas)] px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-red-50 blur-3xl dark:bg-red-900/10" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 mx-auto dark:bg-red-500/10 dark:text-red-400">
          <ShieldX className="h-8 w-8" aria-hidden />
        </div>

        <h1 className="text-2xl font-black text-[var(--color-text-primary)] md:text-3xl">
          {t("accessDenied.title", { defaultValue: isRtl ? "غير مصرح" : "Access Denied" })}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
          {t("accessDenied.body", {
            defaultValue: isRtl
              ? "ليس لديك الصلاحية للوصول إلى هذا المورد. يرجى التحقق من حسابك أو التواصل مع الدعم."
              : "You do not have permission to access this resource. Please check your account or contact support.",
          })}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" aria-hidden />
            {t("accessDenied.home", { defaultValue: isRtl ? "الرئيسية" : "Go home" })}
          </Link>
          <Link to="/login" className="btn-secondary inline-flex">
            {t("accessDenied.login", { defaultValue: isRtl ? "تسجيل الدخول" : "Sign in" })}
          </Link>
        </div>
      </div>
    </div>
  );
}
