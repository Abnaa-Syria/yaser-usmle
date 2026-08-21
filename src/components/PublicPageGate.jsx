import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import { isPublicPathVisible, normalizePageVisibility } from "../utils/publicPageVisibility";

export default function PublicPageGate({ children }) {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { settings, isLoading } = useSiteSettings();
  const visibility = normalizePageVisibility(settings.pageVisibility);

  if (isLoading && settings.pageVisibility == null) {
    return children;
  }

  if (isPublicPathVisible(pathname, visibility)) {
    return children;
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-black text-slate-900">
        {t("public.pageUnavailable.title", { defaultValue: isAr ? "الصفحة غير متاحة" : "Page unavailable" })}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        {t("public.pageUnavailable.body", {
          defaultValue: isAr
            ? "هذه الصفحة مخفية حالياً من إدارة المنصة."
            : "This page is currently hidden by the platform administrator.",
        })}
      </p>
      <Link to="/" className="mt-8 rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white">
        {t("public.pageUnavailable.home", { defaultValue: isAr ? "العودة للرئيسية" : "Back to home" })}
      </Link>
    </div>
  );
}
