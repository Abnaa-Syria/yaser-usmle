import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Zap, ArrowLeft, ArrowRight, Sparkles, BookOpen, ShieldCheck, Layers3, CreditCard } from "lucide-react";
import { usePublicPackages } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { useCatalogHero } from "../hooks/useCatalogHero";
import { useSeo } from "../utils/seo";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

function parseDescription(description) {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function durationLabel(tier, isRtl) {
  if (!tier) return isRtl ? "وصول مرن" : "Flexible access";
  if (tier.durationValue && tier.durationUnit) {
    const unit = String(tier.durationUnit).toLowerCase();
    const translatedUnit = isRtl
      ? ({ day: "يوم", week: "أسبوع", month: "شهر", year: "سنة" }[unit.replace(/s$/, "")] || unit)
      : `${unit.replace(/s$/, "")}${tier.durationValue === 1 ? "" : "s"}`;
    return `${tier.durationValue} ${translatedUnit}`;
  }
  if (tier.durationDays) return isRtl ? `${tier.durationDays} يوم` : `${tier.durationDays} days`;
  return isRtl ? "وصول كامل" : "Full access";
}

function PlanCard({ pkg, onGetStarted }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const lowestTier = useMemo(() => (pkg.pricingTiers || []).slice().sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0], [pkg.pricingTiers]);
  const descriptionLines = useMemo(() => {
    const courseLines = (pkg.courses || []).map((item) => isRtl ? (item.course?.titleAr || item.course?.title) : item.course?.title).filter(Boolean);
    const description = isRtl
      ? (pkg.shortDescriptionAr || pkg.descriptionAr || pkg.shortDescription || pkg.description)
      : (pkg.shortDescription || pkg.description);
    return parseDescription(description).concat(courseLines);
  }, [pkg, isRtl]);
  const highlighted = !!pkg.isFeatured;
  const price = Number(lowestTier?.price ?? pkg.price ?? 0);
  const originalPrice = Number(pkg.originalPrice || 0);
  const savings = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const title = isRtl ? (pkg.titleAr || pkg.title) : pkg.title;
  const coverFallback = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=85&w=1200&auto=format&fit=crop";
  const coverImage = resolveMediaUrl(pkg.coverImage) || coverFallback;

  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,.13)] ${highlighted ? "border-blue-300 shadow-[0_24px_65px_rgba(37,99,235,.15)]" : "border-slate-200 shadow-[0_14px_40px_rgba(15,23,42,.06)]"}`}>
      {highlighted ? (
        <span className="absolute end-5 top-5 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-l from-blue-600 to-cyan-500 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
          <Zap className="h-3.5 w-3.5" />
          {t("subscription.mostPopular", { defaultValue: "Most Popular" })}
        </span>
      ) : null}

      <div className="relative h-44 overflow-hidden bg-[#071a38]">
        <img
          src={coverImage}
          alt=""
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = coverFallback;
          }}
          className="h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071a38] via-[#071a38]/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-cyan-200 backdrop-blur-md">
            {durationLabel(lowestTier, isRtl)}
          </span>
          <h3 className="mt-3 text-2xl font-black leading-tight text-white">{title}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">{isRtl ? "سعر الباقة" : "PACKAGE PRICE"}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight text-slate-950">{Number(price).toFixed(0)}</span>
              <span className="text-sm font-black text-blue-700">{lowestTier?.currency || pkg.currency || "USD"}</span>
              {originalPrice > price ? <span className="text-sm font-bold text-slate-400 line-through">{originalPrice.toFixed(0)}</span> : null}
            </div>
          </div>
          {savings > 0 ? <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">{isRtl ? `وفّر ${savings}%` : `Save ${savings}%`}</span> : null}
        </div>

        {descriptionLines.length > 0 ? (
          <ul className="mt-6 flex-1 space-y-3.5">
            {descriptionLines.slice(0, 6).map((line, idx) => (
              <li key={`${pkg.id}-desc-${idx}`} className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Check className="h-3 w-3 text-blue-700" strokeWidth={3} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 p-6">
            <span className="text-xs text-slate-400">{t("subscription.noDescription", { defaultValue: "No details available." })}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onGetStarted(pkg, lowestTier)}
          className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black transition ${highlighted ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20 hover:bg-blue-600" : "bg-[#071a38] text-white hover:bg-blue-700"}`}
        >
          {t("subscription.getStarted")}
          <Arrow className="h-4 w-4" />
        </button>
        <Link
          to={`/packages/${pkg.id}`}
          className="mt-4 text-center text-xs font-black text-slate-500 transition hover:text-blue-700"
        >
          {t("subscription.viewDetails", { defaultValue: "View package details" })}
        </Link>
      </div>
    </article>
  );
}

export default function Subscription() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const { data: packages = [], isLoading, isError } = usePublicPackages();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);
  const hero = useCatalogHero(
    "PACKAGES_HERO",
    {
      eyebrow: t("subscription.eyebrow", { defaultValue: isRtl ? "قيمة أكبر لمسار تعليمي متكامل" : "More value for a complete learning path" }),
      titlePrefix: t("subscription.titlePrefix"),
      titleAccent: t("subscription.titleAccent"),
      subtitle: t("subscription.subtitle"),
    },
    i18n.language
  );

  useSeo({
    title: t("header.nav.packages", { defaultValue: "Packages" }),
    description: hero.subtitle || t("subscription.subtitle", {
      defaultValue: "Choose a Yaser USMLE package with bundled course access and manual payment review.",
    }),
    path: "/packages",
  });

  const handleGetStarted = (pkg, tier) => {
    const qs = new URLSearchParams({ packageId: pkg.id });
    if (tier?.id) qs.set("pricingTierId", tier.id);
    const path = `/student/checkout?${qs.toString()}`;
    if (!isAuthenticated || role !== APP_ROLES.STUDENT) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)),
    [packages]
  );

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-28 pt-16 text-white md:pb-32 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)", backgroundSize: "64px 64px" }} aria-hidden />

        <div className="relative mx-auto max-w-[1180px] px-4 text-center md:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {hero.eyebrow}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.7rem]">
            {hero.titlePrefix}{" "}
            <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{hero.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{hero.subtitle}</p>

          <div className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-3">
            {[
              { Icon: Layers3, label: isRtl ? "دورات مترابطة في باقة واحدة" : "Connected courses in one bundle" },
              { Icon: CreditCard, label: isRtl ? "دفع واحد ووصول واضح" : "One payment, clear access" },
              { Icon: ShieldCheck, label: isRtl ? "تفعيل آمن بعد مراجعة الدفع" : "Secure activation after payment review" },
            ].map(({ Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.055] px-4 py-3 text-[11px] font-bold text-slate-200 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-cyan-300" aria-hidden />{label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-14 max-w-[1180px] px-4 md:px-6">
        {isLoading ? (
          <div className="grid gap-7 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
                <div className="h-44 animate-pulse bg-slate-200" />
                <div className="space-y-4 p-7"><div className="h-10 w-1/2 animate-pulse rounded bg-slate-100" /><div className="h-4 w-full animate-pulse rounded bg-slate-100" /><div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" /><div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" /></div>
              </div>
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-[2rem] border border-red-100 bg-white px-6 py-16 text-center text-sm font-bold text-red-600 shadow-sm">{t("subscription.loadError", { defaultValue: "Could not load plans." })}</div>
        ) : null}

        {!isLoading && !isError && sortedPackages.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
            <p className="mt-4 text-sm font-bold text-slate-500">{t("subscription.empty", { defaultValue: "No packages are available yet." })}</p>
          </div>
        ) : null}

        {!isLoading && sortedPackages.length > 0 ? (
          <div className={`grid justify-center gap-7 ${sortedPackages.length === 1 ? "mx-auto max-w-xl" : "md:grid-cols-2"}`}>
            {sortedPackages.map((pkg) => <PlanCard key={pkg.id} pkg={pkg} onGetStarted={handleGetStarted} />)}
          </div>
        ) : null}

        <section className="mt-20">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-700">{isRtl ? "تجربة تعلم متكاملة" : "A COMPLETE LEARNING EXPERIENCE"}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{isRtl ? "ما الذي تحصل عليه مع باقات Yaser USMLE؟" : "What comes with a Yaser USMLE bundle?"}</h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: BookOpen, title: isRtl ? "محتوى منظّم" : "Structured content", body: isRtl ? "دورات مترابطة ترتّب دراستك حسب الأنظمة والموضوعات." : "Connected courses organized by systems and topics." },
              { Icon: Layers3, title: isRtl ? "قيمة أفضل" : "Better value", body: isRtl ? "احصل على أكثر من دورة بسعر أقل من شرائها منفردة." : "Access multiple courses for less than buying separately." },
              { Icon: Zap, title: isRtl ? "وصول بسيط" : "Simple access", body: isRtl ? "عملية شراء واحدة ومسار واضح من لوحة الطالب." : "One purchase and a clear path from your dashboard." },
              { Icon: ShieldCheck, title: isRtl ? "دعم موثوق" : "Reliable support", body: isRtl ? "فريق المنصة جاهز لمساعدتك في الدفع والوصول." : "Our team helps with payment and access whenever needed." },
            ].map(({ Icon, title, body }) => (
              <article key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,.04)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-5 text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-xs font-medium leading-6 text-slate-500">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-col items-center justify-between gap-5 rounded-[1.75rem] bg-[#071a38] px-7 py-7 text-white sm:flex-row">
          <div><p className="text-lg font-black">{isRtl ? "هل تحتاج مساعدة في اختيار الباقة؟" : "Need help choosing a bundle?"}</p><p className="mt-1 text-xs font-medium text-slate-400">{isRtl ? "اطّلع على الإجابات أو تواصل مع فريقنا قبل الشراء." : "Browse common answers or contact our team before purchasing."}</p></div>
          <Link to="/faq" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-[#071a38] transition hover:bg-cyan-50">
            {t("subscription.faqLink")}
            {isRtl ? <ArrowLeft className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
          </Link>
        </div>
      </main>
    </div>
  );
}
