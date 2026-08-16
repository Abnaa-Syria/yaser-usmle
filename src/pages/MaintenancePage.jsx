import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Languages, Sparkles } from "lucide-react";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import BrandLogo from "../components/BrandLogo";

const LEGACY_PLATFORM_URL = "https://yaser-usmle2.tech/";

export default function MaintenancePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = (i18n.language || "en").startsWith("ar") ? "ar" : "en";
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || "Yaser USMLE";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [lang, isRtl]);

  const copy = useMemo(
    () =>
      lang === "ar"
        ? {
            eyebrow: "تحديث المنصة",
            title: "نجهّز تجربة أفضل لكم",
            body: "المنصة الجديدة قيد التجهيز حالياً. شكراً لصبركم — سنعود قريباً.",
            legacyTitle: "طالب في المنصة السابقة؟",
            legacyBody: "ادخل للمنصة القديمة لمتابعة دراستك حتى اكتمال التحديث.",
            legacyCta: "فتح المنصة السابقة",
            langAr: "عربي",
            langEn: "English",
          }
        : {
            eyebrow: "Platform update",
            title: "We're preparing a better experience",
            body: "The new platform is under maintenance. Thanks for your patience — we'll be back shortly.",
            legacyTitle: "Already a student on the previous platform?",
            legacyBody: "Open the legacy platform to continue studying until the update is complete.",
            legacyCta: "Open previous platform",
            langAr: "عربي",
            langEn: "English",
          },
    [lang]
  );

  const setLang = (next) => {
    void i18n.changeLanguage(next);
    try {
      localStorage.setItem("i18nextLng", next);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="relative h-dvh max-h-dvh overflow-hidden bg-[#06122a] text-white"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.28),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(14,165,233,0.12),_transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col px-5 py-4 sm:px-8 sm:py-5">
        <header className="flex shrink-0 items-center justify-between gap-4">
          <BrandLogo variant="light" alt={siteName} className="h-9 w-auto sm:h-10" />

          <div
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-md"
            role="group"
            aria-label={t("maintenance.language", { defaultValue: "Language" })}
          >
            <Languages className="ms-2 h-3.5 w-3.5 text-blue-200/80" aria-hidden />
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                lang === "ar" ? "bg-white text-[#06122a]" : "text-white/75 hover:text-white"
              }`}
            >
              {copy.langAr}
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                lang === "en" ? "bg-white text-[#06122a]" : "text-white/75 hover:text-white"
              }`}
            >
              {copy.langEn}
            </button>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-2 text-center sm:gap-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100 sm:text-[11px]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {copy.eyebrow}
          </div>

          <h1 className="max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] font-black leading-tight tracking-tight text-white">
            {copy.title}
          </h1>
          <p className="max-w-xl text-[clamp(0.875rem,1.6vw,1.05rem)] leading-relaxed text-slate-300">
            {copy.body}
          </p>

          <section className="w-full max-w-xl rounded-2xl border border-white/12 bg-white/[0.06] p-4 text-start shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-5">
            <p className="text-base font-black text-white sm:text-lg">{copy.legacyTitle}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-300">{copy.legacyBody}</p>
            <a
              href={LEGACY_PLATFORM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-600,#2563eb)] px-4 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-500,#3b82f6)]"
            >
              {copy.legacyCta}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}
