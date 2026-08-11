import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, Brain, ClipboardList, TrendingUp, Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { pickLocalized } from "../utils/cmsLocale";

const STEP_ICONS = [BookOpen, Brain, ClipboardList, TrendingUp];
const STEPS = ["step1", "step2", "step3", "step4"];
const NUMS = ["01", "02", "03", "04"];
const STEP_TONES = [
  { icon: "bg-blue-50 text-blue-700", line: "bg-blue-500", number: "text-blue-500/[0.14]" },
  { icon: "bg-violet-50 text-violet-700", line: "bg-violet-500", number: "text-violet-500/[0.14]" },
  { icon: "bg-emerald-50 text-emerald-700", line: "bg-emerald-500", number: "text-emerald-500/[0.14]" },
  { icon: "bg-amber-50 text-amber-700", line: "bg-amber-500", number: "text-amber-500/[0.14]" },
];
const ICON_MAP = { BookOpen, Brain, ClipboardList, TrendingUp };

export default function HowItWorks({ cmsContent = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const c = cmsContent && typeof cmsContent === "object" ? cmsContent : null;

  const eyebrow = pickLocalized(c?.eyebrow, lang) || t("howItWorks.eyebrow", { defaultValue: isRtl ? "تجربة تعليمية متكاملة" : "A complete learning experience" });
  const titleStart = pickLocalized(c?.titleStart, lang) || t("howItWorks.titleStart", { defaultValue: isRtl ? "رحلتك التعليمية" : "Your learning journey" });
  const titleAccent = pickLocalized(c?.titleAccent, lang) || t("howItWorks.titleAccent", { defaultValue: isRtl ? "من الفهم إلى الثقة" : "from understanding to confidence" });
  const subtitle =
    pickLocalized(c?.subtitle, lang) ||
    t("howItWorks.subtitle", {
      defaultValue: isRtl
        ? "تجمع Yaser USMLE المحتوى والتدريب والمتابعة في تجربة تعليمية واحدة تساعدك على الاستعداد بوضوح وثقة."
        : "Yaser USMLE brings content, practice, and progress tracking into one focused learning experience.",
    });
  const footerTitle = pickLocalized(c?.footerTitle, lang) || (isRtl ? "كل أدوات تعلمك في مساحة واحدة" : "Every learning tool in one focused space");
  const footerSubtitle = pickLocalized(c?.footerSubtitle, lang) || (isRtl ? "دروس، اختبارات، فلاش كاردز، وخطة مذاكرة متكاملة" : "Lessons, assessments, flashcards, and an integrated study plan");
  const footerCta = pickLocalized(c?.footerCtaLabel, lang) || (isRtl ? "ابدأ رحلتك" : "Start your journey");
  const footerHref = c?.footerCtaHref || "#courses";

  const cmsSteps = Array.isArray(c?.steps) ? c.steps : [];
  const steps =
    cmsSteps.length > 0
      ? cmsSteps.map((step, idx) => ({
          key: step.id || `step-${idx}`,
          Icon: ICON_MAP[step.icon] || STEP_ICONS[idx % STEP_ICONS.length],
          title: pickLocalized(step.title, lang),
          description: pickLocalized(step.description, lang),
          tone: STEP_TONES[idx % STEP_TONES.length],
          number: NUMS[idx % NUMS.length],
        }))
      : STEPS.map((stepKey, idx) => ({
          key: stepKey,
          Icon: STEP_ICONS[idx],
          title: t(`howItWorks.steps.${stepKey}.title`),
          description: t(`howItWorks.steps.${stepKey}.description`),
          tone: STEP_TONES[idx],
          number: NUMS[idx],
        }));

  return (
    <section className="relative overflow-hidden bg-[#f5f8fd] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,.10),transparent_24%),radial-gradient(circle_at_88%_78%,rgba(139,92,246,.08),transparent_25%)]" aria-hidden />

      <div className="relative mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-[11px] font-extrabold text-blue-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {eyebrow}
          </p>
          <h2 className="text-3xl font-black leading-[1.18] tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            {titleStart}{" "}
            <span className="bg-gradient-to-l from-blue-700 to-cyan-500 bg-clip-text text-transparent">{titleAccent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">{subtitle}</p>
        </motion.header>

        <div className="mt-14 overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white p-3 shadow-[0_25px_75px_rgba(15,23,42,.08)] sm:p-5 lg:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, idx) => {
              const Icon = step.Icon;
              const tone = step.tone;
              return (
                <motion.article
                  key={step.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                  className="group relative min-h-[260px] overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50/65 p-6 transition duration-500 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-[0_20px_45px_rgba(15,23,42,.08)] sm:p-8"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 ${tone.line}`} aria-hidden />
                  <span className={`pointer-events-none absolute end-5 top-3 select-none text-[5.5rem] font-black leading-none tracking-[-0.09em] sm:end-7 sm:text-[6.5rem] ${tone.number}`} aria-hidden>
                    {step.number}
                  </span>
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition duration-500 group-hover:rotate-3 group-hover:scale-105 ${tone.icon}`}>
                        <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                      </div>
                    </div>
                    <div className="mt-8 max-w-lg">
                      <h3 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{step.title}</h3>
                      <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{step.description}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-7 text-[10px] font-extrabold text-slate-400">
                      <Check className="h-4 w-4 text-emerald-500" aria-hidden />
                      {isRtl ? "جزء من تجربتك داخل المنصة" : "Part of your platform experience"}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-5 rounded-[1.75rem] bg-[#081a39] px-6 py-6 text-white sm:flex-row sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                <BookOpen className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-black sm:text-base">{footerTitle}</p>
                <p className="mt-1 text-[10px] font-semibold text-blue-200/70">{footerSubtitle}</p>
              </div>
            </div>
            <a href={footerHref} className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-[#081a39] transition hover:bg-blue-50">
              {footerCta}
              <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
