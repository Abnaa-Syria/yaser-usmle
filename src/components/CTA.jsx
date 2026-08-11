import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { pickLocalized } from "../utils/cmsLocale";

export default function CTA({ cmsContent = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const c = cmsContent && typeof cmsContent === "object" ? cmsContent : null;

  const eyebrow = pickLocalized(c?.eyebrow, lang) || t("cta.eyebrow", { defaultValue: isRtl ? "ابدأ اليوم" : "Start today" });
  const title = pickLocalized(c?.title, lang) || t("cta.title");
  const subtitle = pickLocalized(c?.subtitle, lang) || t("cta.subtitle");
  const primaryLabel = pickLocalized(c?.primaryLabel, lang) || t("cta.actions.createAccount");
  const secondaryLabel = pickLocalized(c?.secondaryLabel, lang) || t("cta.actions.learnMore");
  const primaryTo = c?.primaryTo || "/signup";
  const secondaryTo = c?.secondaryTo || "/explore";

  return (
    <section className="section-sm">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--yu-blue-700)] via-[var(--yu-blue-800)] to-[var(--yu-blue-900)] px-6 py-12 text-center shadow-[var(--shadow-cta)] md:px-12 md:py-16">
          <div className="pointer-events-none absolute -start-16 top-0 h-56 w-56 rounded-full bg-white/5 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -end-10 bottom-0 h-64 w-64 rounded-full bg-[var(--yu-blue-500)]/20 blur-3xl" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute start-0 top-0 h-1 w-full bg-gradient-to-r from-[var(--yu-blue-400)] via-[var(--yu-blue-300)] to-[var(--yu-blue-400)] opacity-60" aria-hidden />

          <div className="relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--yu-blue-300)]">{eyebrow}</p>
            <h2 className="mx-auto max-w-2xl text-2xl font-black text-white md:text-3xl lg:text-4xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">{subtitle}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to={primaryTo}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[var(--yu-blue-700)] shadow-lg transition hover:bg-[var(--yu-blue-50)] active:scale-[0.98] sm:w-auto"
              >
                {primaryLabel}
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden />
              </Link>
              <Link
                to={secondaryTo}
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:border-white/50 sm:w-auto"
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
