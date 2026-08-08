import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone, ChevronRight, ChevronLeft, Sparkles, GraduationCap, Users, BookOpenCheck, ChartNoAxesCombined, ArrowLeft, ArrowRight, Check, Send, ShieldCheck, UserPlus, Compass, WalletCards, PlayCircle, ClipboardCheck, TrendingUp, HelpCircle, ScrollText, UserCheck, CreditCard, Copyright, Scale, RefreshCcw, Database, LockKeyhole, Eye, Cookie, Share2, Clock3, BadgeCheck, Ban, FileSearch, Banknote, CircleDollarSign } from "lucide-react";
import { usePublicCmsPage } from "../features/public/hooks";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import { parseCmsSections } from "../utils/cmsLocale";
import ContactForm from "../components/ContactForm";
import BecomeInstructorModal from "../components/BecomeInstructorModal";
import { useSeo } from "../utils/seo";

function SectionBlock({ section, isRtl }) {
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      {section.heading ? (
        <h2 className="text-lg font-extrabold text-slate-900 md:text-xl">{section.heading}</h2>
      ) : null}
      {section.body ? (
        <p className={`text-sm leading-relaxed text-slate-600 md:text-base ${section.heading ? "mt-3" : ""}`}>
          {section.body}
        </p>
      ) : null}
      {section.listItems?.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {section.listItems.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
              <Chevron className="mt-0.5 h-4 w-4 shrink-0 text-[var(--yu-blue-700)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function TeachLanding({ isRtl, title, subtitle, isLoading, isError, onApply }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-24 pt-16 text-white md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)", backgroundSize: "64px 64px" }} aria-hidden />

        <div className="relative mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link><span>/</span><span className="text-white">{title || t("publicTeach.navTitle")}</span>
          </nav>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />{t("publicTeach.eyebrow")}
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
                {t("publicTeach.heroPrefix")}{" "}
                <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{t("publicTeach.heroAccent")}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{subtitle || t("publicTeach.subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={onApply} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">
                  {t("publicTeach.applyCta")}<Arrow className="h-4 w-4" aria-hidden />
                </button>
                <a href="#journey" className="inline-flex items-center rounded-xl border border-white/15 bg-white/[.06] px-5 py-3.5 text-sm font-black transition hover:bg-white/[.1]">{t("publicTeach.howItWorks")}</a>
              </div>
            </div>

            <div className="relative">
              <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] p-2 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=85&w=1400&auto=format&fit=crop"
                  alt=""
                  className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-[1.55rem] object-cover"
                />
                <div className="absolute inset-2 rounded-[1.55rem] bg-gradient-to-t from-[#06152f]/90 via-[#06152f]/15 to-transparent" />
                <div className="absolute inset-x-8 bottom-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-[#071a38]"><GraduationCap className="h-5 w-5" aria-hidden /></span>
                  <p className="mt-4 text-xl font-black leading-8">{t("publicTeach.imageStatement")}</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -start-5 rounded-2xl bg-blue-600 p-4 text-white shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-100">YASER USMLE FACULTY</p>
                <p className="mt-1 text-sm font-black">{t("publicTeach.imageBadge")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-7 max-w-[1240px] px-4 md:px-6 lg:px-8">
        {isLoading ? <div className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" /> : null}
        {isError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">{t("publicPage.loadError")}</div> : null}

        <section className="grid gap-5 py-16 md:grid-cols-3">
          {[
            { Icon: Users, title: t("publicTeach.benefits.impact.title"), body: t("publicTeach.benefits.impact.body") },
            { Icon: BookOpenCheck, title: t("publicTeach.benefits.tools.title"), body: t("publicTeach.benefits.tools.body") },
            { Icon: ChartNoAxesCombined, title: t("publicTeach.benefits.growth.title"), body: t("publicTeach.benefits.growth.body") },
          ].map(({ Icon, title: itemTitle, body }) => (
            <article key={itemTitle} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_12px_35px_rgba(15,23,42,.04)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a38] text-cyan-300"><Icon className="h-5 w-5" aria-hidden /></span>
              <h2 className="mt-6 text-lg font-black text-slate-950">{itemTitle}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{body}</p>
            </article>
          ))}
        </section>

        <section id="journey" className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,.07)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-700">{t("publicTeach.processEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">{t("publicTeach.processTitle")}</h2>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-500">{t("publicTeach.processSubtitle")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["apply", "review", "conversation", "onboarding"].map((key, index) => (
                <article key={key} className="relative overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-50/70 p-5">
                  <span className="absolute -end-1 -top-4 text-[4.8rem] font-black leading-none text-blue-500/[.07]">0{index + 1}</span>
                  <span className="relative text-[9px] font-black uppercase tracking-[.16em] text-blue-700">{isRtl ? `الخطوة ${index + 1}` : `STEP ${index + 1}`}</span>
                  <h3 className="relative mt-3 text-base font-black text-slate-950">{t(`publicTeach.process.${key}.title`)}</h3>
                  <p className="relative mt-2 text-xs font-medium leading-6 text-slate-500">{t(`publicTeach.process.${key}.body`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid items-center gap-10 py-20 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-cyan-600 p-8 text-white sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-100">{t("publicTeach.profileEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-black">{t("publicTeach.profileTitle")}</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-blue-100/80">{t("publicTeach.profileSubtitle")}</p>
          </div>
          <ul className="grid gap-3">
            {["expertise", "clarity", "commitment", "quality"].map((key) => (
              <li key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Check className="h-4 w-4" strokeWidth={3} /></span>
                {t(`publicTeach.profile.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-[2rem] bg-[#071a38] text-white">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-5">
              <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 sm:flex"><ShieldCheck className="h-6 w-6" /></span>
              <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">YASER USMLE FACULTY</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{t("publicTeach.finalTitle")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-400">{t("publicTeach.finalBody")}</p></div>
            </div>
            <button type="button" onClick={onApply} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">
              {t("publicTeach.applyCta")}<Send className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function GuideLanding({ isRtl }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const steps = [
    { Icon: UserPlus, key: "account", to: "/signup" },
    { Icon: Compass, key: "discover", to: "/explore" },
    { Icon: WalletCards, key: "enroll", to: "/packages" },
    { Icon: PlayCircle, key: "learn", to: "/login" },
    { Icon: ClipboardCheck, key: "practice", to: "/login" },
    { Icon: TrendingUp, key: "progress", to: "/login" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-28 pt-16 text-white md:pb-32 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)", backgroundSize: "64px 64px" }} aria-hidden />

        <div className="relative mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link><span>/</span><span className="text-white">{t("publicGuide.title")}</span>
          </nav>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.04fr_.96fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />{t("publicGuide.eyebrow")}
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
                {t("publicGuide.heroPrefix")}{" "}
                <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{t("publicGuide.heroAccent")}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{t("publicGuide.subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#guide-steps" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">{t("publicGuide.startGuide")}<Arrow className="h-4 w-4" /></a>
                <Link to="/faq" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-5 py-3.5 text-sm font-black transition hover:bg-white/[.1]"><HelpCircle className="h-4 w-4" />{t("footer.community.faq")}</Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.06] p-4 shadow-2xl backdrop-blur-sm">
              <div className="rounded-[1.5rem] bg-white p-5 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-700">YASER USMLE</p><p className="mt-1 text-sm font-black">{t("publicGuide.previewTitle")}</p></div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071a38] text-cyan-300"><BookOpenCheck className="h-5 w-5" /></span>
                </div>
                <div className="mt-5 space-y-3">
                  {steps.slice(0, 4).map(({ Icon, key }, index) => (
                    <div key={key} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-4 w-4" /></span>
                      <div className="flex-1"><p className="text-xs font-black">{t(`publicGuide.steps.${key}.title`)}</p><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-gradient-to-l from-blue-600 to-cyan-400" style={{ width: `${35 + index * 18}%` }} /></div></div>
                      <span className="text-[10px] font-black text-slate-300">0{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-8 max-w-[1240px] px-4 md:px-6 lg:px-8">
        <section className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,.08)] sm:grid-cols-3 sm:p-5">
          {[
            { value: "06", label: t("publicGuide.stats.steps") },
            { value: "01", label: t("publicGuide.stats.platform") },
            { value: "24/7", label: t("publicGuide.stats.access") },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.25rem] bg-slate-50 px-5 py-4 text-center"><p className="text-2xl font-black text-blue-700">{item.value}</p><p className="mt-1 text-[10px] font-bold text-slate-500">{item.label}</p></div>
          ))}
        </section>

        <section id="guide-steps" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-700">{t("publicGuide.journeyEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t("publicGuide.journeyTitle")}</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-500">{t("publicGuide.journeySubtitle")}</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {steps.map(({ Icon, key, to }, index) => (
              <article key={key} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_12px_35px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <span className="absolute -end-2 -top-5 text-[6rem] font-black leading-none text-blue-500/[.07]">0{index + 1}</span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a38] text-cyan-300"><Icon className="h-5 w-5" /></span>
                <p className="relative mt-6 text-[9px] font-black uppercase tracking-[.16em] text-blue-700">{isRtl ? `الخطوة ${index + 1}` : `STEP ${index + 1}`}</p>
                <h3 className="relative mt-2 text-xl font-black text-slate-950">{t(`publicGuide.steps.${key}.title`)}</h3>
                <p className="relative mt-3 text-sm font-medium leading-7 text-slate-500">{t(`publicGuide.steps.${key}.body`)}</p>
                <Link to={to} className="relative mt-6 inline-flex items-center gap-2 text-xs font-black text-blue-700 transition hover:text-blue-900">{t(`publicGuide.steps.${key}.action`)}<Arrow className="h-3.5 w-3.5" /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] bg-[#071a38] text-white">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">YASER USMLE SUPPORT</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{t("publicGuide.supportTitle")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-400">{t("publicGuide.supportBody")}</p></div>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">{t("publicGuide.contactSupport")}<Arrow className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function TermsLanding({ isRtl }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const sections = [
    { key: "acceptance", Icon: ScrollText },
    { key: "account", Icon: UserCheck },
    { key: "content", Icon: BookOpenCheck },
    { key: "payments", Icon: CreditCard },
    { key: "access", Icon: ShieldCheck },
    { key: "intellectualProperty", Icon: Copyright },
    { key: "conduct", Icon: Scale },
    { key: "changes", Icon: RefreshCcw },
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-24 pt-16 text-white md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)", backgroundSize: "64px 64px" }} aria-hidden />

        <div className="relative mx-auto max-w-[1180px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link><span>/</span><span className="text-white">{t("publicTerms.title")}</span>
          </nav>
          <div className="mt-12 max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
              <ScrollText className="h-3.5 w-3.5" aria-hidden />{t("publicTerms.eyebrow")}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
              {t("publicTerms.heroPrefix")}{" "}
              <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{t("publicTerms.heroAccent")}</span>
            </h1>
            <p className="mt-6 max-w-3xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{t("publicTerms.subtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-[10px] font-bold text-slate-300">
              <span className="rounded-xl border border-white/10 bg-white/[.06] px-4 py-3">{t("publicTerms.effectiveDate")}</span>
              <span className="rounded-xl border border-white/10 bg-white/[.06] px-4 py-3">{t("publicTerms.readingTime")}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-10 max-w-[1180px] px-4 md:px-6 lg:px-8">
        <section className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,.09)] sm:grid-cols-3 sm:p-5">
          {[
            { Icon: UserCheck, title: t("publicTerms.summary.account.title"), body: t("publicTerms.summary.account.body") },
            { Icon: CreditCard, title: t("publicTerms.summary.payment.title"), body: t("publicTerms.summary.payment.body") },
            { Icon: ShieldCheck, title: t("publicTerms.summary.access.title"), body: t("publicTerms.summary.access.body") },
          ].map(({ Icon, title, body }) => (
            <article key={title} className="rounded-[1.25rem] bg-slate-50 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm"><Icon className="h-4 w-4" /></span>
              <h2 className="mt-4 text-sm font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{body}</p>
            </article>
          ))}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[.62fr_1.38fr]">
          <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,.05)] lg:sticky lg:top-28">
            <p className="px-2 text-[10px] font-black uppercase tracking-[.18em] text-blue-700">{t("publicTerms.contentsTitle")}</p>
            <nav className="mt-4 space-y-1">
              {sections.map(({ key }, index) => (
                <a key={key} href={`#terms-${key}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                  <span className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-300">{String(index + 1).padStart(2, "0")}</span>{t(`publicTerms.sections.${key}.title`)}</span>
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </a>
              ))}
            </nav>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="px-2 text-xs font-medium leading-5 text-slate-500">{t("publicTerms.helpText")}</p>
              <Link to="/contact" className="mt-3 inline-flex items-center gap-2 px-2 text-xs font-black text-blue-700">{t("publicTerms.contact")}<Arrow className="h-3.5 w-3.5" /></Link>
            </div>
          </aside>

          <section className="space-y-4">
            {sections.map(({ key, Icon }, index) => (
              <article id={`terms-${key}`} key={key} className="scroll-mt-28 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.04)] sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071a38] text-cyan-300"><Icon className="h-5 w-5" /></span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-700">{isRtl ? `البند ${index + 1}` : `SECTION ${index + 1}`}</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{t(`publicTerms.sections.${key}.title`)}</h2>
                  </div>
                </div>
                <p className="mt-5 text-sm font-medium leading-8 text-slate-600">{t(`publicTerms.sections.${key}.body`)}</p>
                {["account", "payments", "access", "conduct"].includes(key) ? (
                  <ul className="mt-5 space-y-3">
                    {[1, 2, 3].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-600">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {t(`publicTerms.sections.${key}.points.${item}`)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        </div>

        <section className="mt-12 overflow-hidden rounded-[2rem] bg-[#071a38] text-white">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">YASER USMLE</p><h2 className="mt-2 text-2xl font-black">{t("publicTerms.footerTitle")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-400">{t("publicTerms.footerBody")}</p></div>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">{t("publicTerms.contact")}<Arrow className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function PrivacyLanding({ isRtl }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const sections = [
    { key: "collection", Icon: Database },
    { key: "usage", Icon: Eye },
    { key: "cookies", Icon: Cookie },
    { key: "sharing", Icon: Share2 },
    { key: "security", Icon: LockKeyhole },
    { key: "retention", Icon: Clock3 },
    { key: "rights", Icon: UserCheck },
    { key: "updates", Icon: RefreshCcw },
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#061a2d] pb-24 pt-16 text-white md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -start-44 top-0 h-[32rem] w-[32rem] rounded-full bg-cyan-400/15 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-40 -bottom-36 h-[32rem] w-[32rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize: "28px 28px" }} aria-hidden />
        <div className="relative mx-auto max-w-[1180px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link><span>/</span><span className="text-white">{t("publicPrivacy.title")}</span>
          </nav>
          <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
                <LockKeyhole className="h-3.5 w-3.5" />{t("publicPrivacy.eyebrow")}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
                {t("publicPrivacy.heroPrefix")}{" "}
                <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{t("publicPrivacy.heroAccent")}</span>
              </h1>
              <p className="mt-6 max-w-3xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{t("publicPrivacy.subtitle")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[.06] p-5 backdrop-blur-md">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-[#061a2d]"><ShieldCheck className="h-4 w-4" /></span><div><p className="text-xs font-black">{t("publicPrivacy.promiseTitle")}</p><p className="mt-1 text-[10px] font-bold text-slate-400">{t("publicPrivacy.effectiveDate")}</p></div></div>
              <p className="mt-4 text-xs font-medium leading-6 text-slate-300">{t("publicPrivacy.promiseBody")}</p>
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-10 max-w-[1180px] px-4 md:px-6 lg:px-8">
        <section className="grid overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,.09)] sm:grid-cols-3">
          {[
            { Icon: ShieldCheck, key: "noSale" },
            { Icon: Eye, key: "transparent" },
            { Icon: UserCheck, key: "control" },
          ].map(({ Icon, key }, index) => (
            <article key={key} className={`p-6 ${index ? "border-t border-slate-100 sm:border-s sm:border-t-0" : ""}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Icon className="h-4 w-4" /></span>
              <h2 className="mt-4 text-sm font-black text-slate-950">{t(`publicPrivacy.summary.${key}.title`)}</h2>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{t(`publicPrivacy.summary.${key}.body`)}</p>
            </article>
          ))}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[.62fr_1.38fr]">
          <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,.05)] lg:sticky lg:top-28">
            <p className="px-2 text-[10px] font-black uppercase tracking-[.18em] text-cyan-700">{t("publicPrivacy.contentsTitle")}</p>
            <nav className="mt-4 space-y-1">
              {sections.map(({ key }, index) => (
                <a key={key} href={`#privacy-${key}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-800">
                  <span className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-300">{String(index + 1).padStart(2, "0")}</span>{t(`publicPrivacy.sections.${key}.title`)}</span>
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </a>
              ))}
            </nav>
            <div className="mt-5 rounded-xl bg-[#061a2d] p-4 text-white">
              <p className="text-xs font-black">{t("publicPrivacy.requestTitle")}</p>
              <p className="mt-2 text-[10px] font-medium leading-5 text-slate-400">{t("publicPrivacy.requestBody")}</p>
              <Link to="/contact" className="mt-3 inline-flex items-center gap-2 text-xs font-black text-cyan-300">{t("publicPrivacy.contact")}<Arrow className="h-3.5 w-3.5" /></Link>
            </div>
          </aside>

          <section className="space-y-4">
            {sections.map(({ key, Icon }, index) => (
              <article id={`privacy-${key}`} key={key} className="scroll-mt-28 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.04)] sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#061a2d] text-cyan-300"><Icon className="h-5 w-5" /></span>
                  <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-cyan-700">{isRtl ? `القسم ${index + 1}` : `SECTION ${index + 1}`}</p><h2 className="mt-1 text-xl font-black text-slate-950">{t(`publicPrivacy.sections.${key}.title`)}</h2></div>
                </div>
                <p className="mt-5 text-sm font-medium leading-8 text-slate-600">{t(`publicPrivacy.sections.${key}.body`)}</p>
                {["collection", "usage", "sharing", "rights"].includes(key) ? (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                      <li key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 text-xs font-bold leading-5 text-slate-600">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-800"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {t(`publicPrivacy.sections.${key}.points.${item}`)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        </div>

        <section className="mt-12 overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-700 to-blue-800 text-white">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-100">PRIVACY AT YASER USMLE</p><h2 className="mt-2 text-2xl font-black">{t("publicPrivacy.footerTitle")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-cyan-50/80">{t("publicPrivacy.footerBody")}</p></div>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-cyan-800 transition hover:bg-cyan-50">{t("publicPrivacy.contact")}<Arrow className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function RefundLanding({ isRtl }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const sections = [
    { key: "scope", Icon: ScrollText },
    { key: "eligible", Icon: BadgeCheck },
    { key: "notEligible", Icon: Ban },
    { key: "request", Icon: Send },
    { key: "review", Icon: FileSearch },
    { key: "processing", Icon: Banknote },
    { key: "contact", Icon: HelpCircle },
  ];
  const journey = [
    { key: "submit", Icon: Send },
    { key: "verify", Icon: FileSearch },
    { key: "decision", Icon: BadgeCheck },
    { key: "return", Icon: Banknote },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fc] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-28 pt-16 text-white md:pb-32 md:pt-20">
        <div className="pointer-events-none absolute -start-36 -top-40 h-[30rem] w-[30rem] rounded-full bg-amber-400/15 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute -end-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "60px 60px" }} aria-hidden />
        <div className="relative mx-auto max-w-[1180px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-amber-200">{t("header.nav.home")}</Link><span>/</span><span className="text-white">{t("publicRefund.title")}</span>
          </nav>
          <div className="mt-12 max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-amber-200 backdrop-blur-md">
              <CircleDollarSign className="h-3.5 w-3.5" />{t("publicRefund.eyebrow")}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
              {t("publicRefund.heroPrefix")}{" "}
              <span className="bg-gradient-to-l from-amber-200 to-orange-300 bg-clip-text text-transparent">{t("publicRefund.heroAccent")}</span>
            </h1>
            <p className="mt-6 max-w-3xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{t("publicRefund.subtitle")}</p>
            <div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-[10px] font-bold text-slate-300">
              <Clock3 className="h-4 w-4 text-amber-300" />{t("publicRefund.effectiveDate")}
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-14 max-w-[1180px] px-4 md:px-6 lg:px-8">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,.1)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-700">{t("publicRefund.processEyebrow")}</p><h2 className="mt-1 text-lg font-black text-slate-950">{t("publicRefund.processTitle")}</h2></div>
            <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-black text-amber-800 sm:block">{t("publicRefund.caseReview")}</span>
          </div>
          <div className="relative mt-6 grid gap-3 sm:grid-cols-4">
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-6 hidden h-px bg-slate-200 sm:block" aria-hidden />
            {journey.map(({ key, Icon }, index) => (
              <article key={key} className="relative flex items-center gap-3 rounded-xl bg-slate-50 p-4 sm:block sm:bg-transparent sm:p-0 sm:text-center">
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071a38] text-amber-300 sm:mx-auto"><Icon className="h-4 w-4" /></span>
                <div className="sm:mt-3"><p className="text-[9px] font-black text-amber-700">{String(index + 1).padStart(2, "0")}</p><h3 className="mt-0.5 text-xs font-black text-slate-800">{t(`publicRefund.journey.${key}`)}</h3></div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[.62fr_1.38fr]">
          <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,.05)] lg:sticky lg:top-28">
            <p className="px-2 text-[10px] font-black uppercase tracking-[.18em] text-amber-700">{t("publicRefund.contentsTitle")}</p>
            <nav className="mt-4 space-y-1">
              {sections.map(({ key }, index) => (
                <a key={key} href={`#refund-${key}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-amber-50 hover:text-amber-800">
                  <span className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-300">{String(index + 1).padStart(2, "0")}</span>{t(`publicRefund.sections.${key}.title`)}</span>
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </a>
              ))}
            </nav>
            <div className="mt-5 rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-black text-amber-950">{t("publicRefund.beforeRequestTitle")}</p>
              <p className="mt-2 text-[10px] font-medium leading-5 text-amber-900/70">{t("publicRefund.beforeRequestBody")}</p>
            </div>
          </aside>

          <section className="space-y-4">
            {sections.map(({ key, Icon }, index) => (
              <article id={`refund-${key}`} key={key} className="scroll-mt-28 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.04)] sm:p-8">
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${key === "notEligible" ? "bg-red-50 text-red-600" : "bg-[#071a38] text-amber-300"}`}><Icon className="h-5 w-5" /></span>
                  <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-amber-700">{isRtl ? `البند ${index + 1}` : `SECTION ${index + 1}`}</p><h2 className="mt-1 text-xl font-black text-slate-950">{t(`publicRefund.sections.${key}.title`)}</h2></div>
                </div>
                <p className="mt-5 text-sm font-medium leading-8 text-slate-600">{t(`publicRefund.sections.${key}.body`)}</p>
                {["eligible", "notEligible", "request"].includes(key) ? (
                  <ul className="mt-5 space-y-3">
                    {[1, 2, 3].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-600">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${key === "notEligible" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-800"}`}><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {t(`publicRefund.sections.${key}.points.${item}`)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        </div>

        <section className="mt-12 overflow-hidden rounded-[2rem] bg-[#071a38] text-white">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-300">YASER USMLE SUPPORT</p><h2 className="mt-2 text-2xl font-black">{t("publicRefund.footerTitle")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-400">{t("publicRefund.footerBody")}</p></div>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-amber-200">{t("publicRefund.startRequest")}<Arrow className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function ContactLanding({ isRtl, site }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const channels = [
    site.contactEmail ? { Icon: Mail, label: t("publicContact.channels.email"), value: site.contactEmail, href: `mailto:${site.contactEmail}`, tone: "bg-blue-50 text-blue-700" } : null,
    site.phoneNumber ? { Icon: Phone, label: t("publicContact.channels.phone"), value: site.phoneNumber, href: `tel:${site.phoneNumber}`, tone: "bg-cyan-50 text-cyan-700" } : null,
    { Icon: MapPin, label: t("publicContact.channels.location"), value: t("footer.brand.location", { defaultValue: isRtl ? "القاهرة، مصر" : "Cairo, Egypt" }), tone: "bg-violet-50 text-violet-700" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-28 pt-16 text-white md:pb-32 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.8) 1px,transparent 1px)", backgroundSize: "30px 30px" }} aria-hidden />
        <div className="relative mx-auto max-w-[1180px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link><span>/</span><span className="text-white">{t("publicContact.title")}</span>
          </nav>
          <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md"><Sparkles className="h-3.5 w-3.5" />{t("publicContact.eyebrow")}</span>
              <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.55rem]">
                {t("publicContact.heroPrefix")}{" "}<span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{t("publicContact.heroAccent")}</span>
              </h1>
              <p className="mt-6 max-w-3xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{t("publicContact.subtitle")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[.06] p-5 backdrop-blur-md">
              <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-[#071a38]"><Clock3 className="h-4 w-4" /></span><div><p className="text-xs font-black">{t("publicContact.responseTitle")}</p><p className="mt-1 text-[10px] font-bold text-cyan-200">{t("publicContact.responseTime")}</p></div></div>
              <p className="mt-4 text-xs font-medium leading-6 text-slate-300">{t("publicContact.responseBody")}</p>
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-12 max-w-[1180px] px-4 md:px-6 lg:px-8">
        <section className={`grid overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,.1)] ${channels.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {channels.map(({ Icon, label, value, href, tone }, index) => {
            const content = <><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-black text-slate-900" dir={href ? "ltr" : undefined}>{value}</p></div></>;
            const className = `flex items-center gap-4 p-6 transition hover:bg-slate-50 ${index ? "border-t border-slate-100 sm:border-s sm:border-t-0" : ""}`;
            return href ? <a key={label} href={href} className={className}>{content}</a> : <div key={label} className={className}>{content}</div>;
          })}
        </section>

        <section className="mt-10 grid items-start gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[1.75rem] bg-[#071a38] p-6 text-white sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">{t("publicContact.beforeTitle")}</p>
              <h2 className="mt-2 text-xl font-black">{t("publicContact.prepareTitle")}</h2>
              <ul className="mt-5 space-y-4">
                {[1, 2, 3].map((item) => <li key={item} className="flex items-start gap-3 text-xs font-medium leading-6 text-slate-300"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-cyan-300"><Check className="h-3 w-3" strokeWidth={3} /></span>{t(`publicContact.prepare.${item}`)}</li>)}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Link to="/faq" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"><span className="flex items-center gap-3"><HelpCircle className="h-5 w-5 text-blue-700" /><span><span className="block text-xs font-black text-slate-900">{t("publicContact.quick.faqTitle")}</span><span className="mt-1 block text-[10px] font-medium text-slate-500">{t("publicContact.quick.faqBody")}</span></span></span><Arrow className="h-4 w-4 text-slate-300 transition group-hover:text-blue-700" /></Link>
              <Link to="/refund-policy" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-amber-200 hover:shadow-md"><span className="flex items-center gap-3"><CircleDollarSign className="h-5 w-5 text-amber-700" /><span><span className="block text-xs font-black text-slate-900">{t("publicContact.quick.refundTitle")}</span><span className="mt-1 block text-[10px] font-medium text-slate-500">{t("publicContact.quick.refundBody")}</span></span></span><Arrow className="h-4 w-4 text-slate-300 transition group-hover:text-amber-700" /></Link>
            </div>
          </aside>
          <ContactForm />
        </section>
      </main>
    </div>
  );
}

export default function StaticContentPage({ slug, showContactInfo = false, extraActions = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);

  const isBuiltInGuide = slug === "user-guide";
  const isBuiltInTerms = slug === "terms";
  const isBuiltInPrivacy = slug === "privacy";
  const isBuiltInRefund = slug === "refund-policy";
  const isBuiltInContact = slug === "contact";
  const { data: page, isLoading, isError } = usePublicCmsPage(isBuiltInGuide || isBuiltInTerms || isBuiltInPrivacy || isBuiltInRefund || isBuiltInContact ? undefined : slug);
  const { settings: site } = useSiteSettings();

  const title = page ? (isRtl ? page.titleAr || page.titleEn : page.titleEn || page.titleAr) : "";
  const subtitle = page
    ? isRtl
      ? page.subtitleAr || page.subtitleEn
      : page.subtitleEn || page.subtitleAr
    : "";
  const sections = parseCmsSections(isRtl ? page?.sectionsAr : page?.sectionsEn);
  const fallbackSections = parseCmsSections(isRtl ? page?.sectionsEn : page?.sectionsAr);
  const displaySections = sections.length > 0 ? sections : fallbackSections;

  const mailto = site.contactEmail ? `mailto:${site.contactEmail}` : null;

  useSeo({
    title: isBuiltInGuide ? t("publicGuide.title") : isBuiltInTerms ? t("publicTerms.title") : isBuiltInPrivacy ? t("publicPrivacy.title") : isBuiltInRefund ? t("publicRefund.title") : isBuiltInContact ? t("publicContact.title") : title || slug,
    description:
      (isBuiltInGuide ? t("publicGuide.subtitle") : isBuiltInTerms ? t("publicTerms.subtitle") : isBuiltInPrivacy ? t("publicPrivacy.subtitle") : isBuiltInRefund ? t("publicRefund.subtitle") : isBuiltInContact ? t("publicContact.subtitle") : subtitle) ||
      t("publicPage.defaultDescription", {
        defaultValue: "Learn more about Yaser USMLE programs, policies, and student support.",
      }),
    path:
      slug === "user-guide"
        ? "/guide"
        : slug === "refund-policy"
          ? "/refund-policy"
          : `/${slug}`,
  });

  if (slug === "teach") {
    return (
      <>
        <TeachLanding
          isRtl={isRtl}
          title={title}
          isLoading={isLoading}
          isError={isError}
          onApply={() => setInstructorModalOpen(true)}
        />
        {instructorModalOpen ? <BecomeInstructorModal onClose={() => setInstructorModalOpen(false)} /> : null}
      </>
    );
  }

  if (isBuiltInGuide) {
    return <GuideLanding isRtl={isRtl} />;
  }

  if (isBuiltInTerms) {
    return <TermsLanding isRtl={isRtl} />;
  }

  if (isBuiltInPrivacy) {
    return <PrivacyLanding isRtl={isRtl} />;
  }

  if (isBuiltInRefund) {
    return <RefundLanding isRtl={isRtl} />;
  }

  if (isBuiltInContact) {
    return <ContactLanding isRtl={isRtl} site={site} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="transition hover:text-[var(--yu-blue-700)]">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{title || t("dashboard.common.loading")}</span>
        </nav>

        <header className="mt-4 border-b border-slate-200/80 pb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title || "—"}</h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">{subtitle}</p>
          ) : null}
        </header>

        {showContactInfo && (site.contactEmail || site.phoneNumber) ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {site.contactEmail ? (
              <a
                href={mailto}
                className="flex items-start gap-3 rounded-2xl border border-[var(--yu-blue-700)]/20 bg-[var(--yu-blue-700)]/5 p-5 transition hover:border-[var(--yu-blue-700)]/40"
              >
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("publicContact.emailLabel", { defaultValue: isRtl ? "البريد الإلكتروني" : "Email" })}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{site.contactEmail}</p>
                </div>
              </a>
            ) : null}
            {site.phoneNumber ? (
              <a
                href={`tel:${site.phoneNumber}`}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[var(--yu-blue-700)]/30"
              >
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("publicContact.phoneLabel", { defaultValue: isRtl ? "الهاتف" : "Phone" })}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{site.phoneNumber}</p>
                </div>
              </a>
            ) : null}
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("publicContact.locationLabel", { defaultValue: isRtl ? "الموقع" : "Location" })}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {t("footer.brand.location", { defaultValue: isRtl ? "القاهرة، مصر" : "Cairo, Egypt" })}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-10 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
            {t("publicPage.loadError", { defaultValue: isRtl ? "تعذّر تحميل الصفحة." : "Could not load this page." })}
          </div>
        ) : null}

        {!isLoading && !isError && displaySections.length > 0 ? (
          <div className="mt-10 space-y-5">
            {displaySections.map((section) => (
              <SectionBlock key={section.id} section={section} isRtl={isRtl} />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && displaySections.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            {t("publicPage.empty", { defaultValue: isRtl ? "المحتوى قيد الإعداد." : "Content is being prepared." })}
          </div>
        ) : null}

        {slug === "contact" ? <ContactForm /> : null}

        {extraActions ? <div className="mt-10">{extraActions}</div> : null}

        {slug === "library" ? (
          <div className="mt-10 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--yu-blue-700)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
            >
              {t("footer.community.courses", { defaultValue: isRtl ? "تصفح الدورات" : "Browse courses" })}
            </Link>
          </div>
        ) : null}

        {slug === "teach" ? (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setInstructorModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--yu-blue-700)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
            >
              {t("publicTeach.applyCta", { defaultValue: isRtl ? "قدّم طلبك الآن" : "Apply now" })}
            </button>
          </div>
        ) : null}

        {instructorModalOpen && (
          <BecomeInstructorModal onClose={() => setInstructorModalOpen(false)} />
        )}
      </div>
    </div>
  );
}
