import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Brain, Layers, ClipboardCheck, Calendar, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS = [
  { key: "structuredCourses", Icon: Brain, to: "/explore", spanClass: "lg:col-span-7", featured: true, number: "01" },
  { key: "flashcards", Icon: Layers, to: "/login", spanClass: "lg:col-span-5", tone: "blue", number: "02" },
  { key: "quizzes", Icon: ClipboardCheck, to: "/login", spanClass: "lg:col-span-5", tone: "emerald", number: "03" },
  { key: "studyPlan", Icon: Calendar, to: "/login", spanClass: "lg:col-span-7", tone: "violet", number: "04" },
];

const TONES = {
  blue: {
    card: "border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/80 hover:border-blue-200",
    icon: "bg-blue-600 text-white shadow-blue-600/20",
    number: "text-blue-100",
    accent: "bg-blue-600",
    pill: "bg-blue-50 text-blue-700",
  },
  emerald: {
    card: "border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 hover:border-emerald-200",
    icon: "bg-emerald-600 text-white shadow-emerald-600/20",
    number: "text-emerald-100",
    accent: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700",
  },
  violet: {
    card: "border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/70 hover:border-violet-200",
    icon: "bg-violet-600 text-white shadow-violet-600/20",
    number: "text-violet-100",
    accent: "bg-violet-500",
    pill: "bg-violet-50 text-violet-700",
  },
};

export default function Features() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden bg-[#f4f7fc] py-20 md:py-28">
      <div className="pointer-events-none absolute -start-32 top-24 h-96 w-96 rounded-full bg-blue-200/25 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -end-32 bottom-0 h-96 w-96 rounded-full bg-violet-200/20 blur-[110px]" aria-hidden />

      <motion.div
        className="relative mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
          className="mb-12 grid items-end gap-6 lg:grid-cols-[1fr_0.75fr] lg:gap-20"
        >
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-[11px] font-extrabold text-blue-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t("features.eyebrow", { defaultValue: isRtl ? "منظومة تعلم متكاملة" : "A complete learning system" })}
            </p>
            <h2 className="max-w-3xl text-3xl font-black leading-[1.18] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
              {t("features.titleStart", { defaultValue: isRtl ? "كل ما تحتاجه" : "Everything you need" })}{" "}
              <span className="bg-gradient-to-l from-blue-700 to-cyan-500 bg-clip-text text-transparent">
                {t("features.titleAccent", { defaultValue: isRtl ? "للنجاح في USMLE" : "to pass USMLE" })}
              </span>
            </h2>
          </div>
          <p className="border-s-2 border-blue-200 ps-5 text-sm font-medium leading-7 text-slate-600 sm:text-base">
            {t("features.subtitle", {
              defaultValue: isRtl
                ? "منصة متكاملة تجمع المحتوى الطبي، والاختبارات، والبطاقات الدراسية، وخطط المراجعة في مكان واحد"
                : "An integrated platform combining medical content, quizzes, flashcards, and review plans in one place",
            })}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {ITEMS.map(({ key, Icon, to, spanClass, featured, tone, number }, index) => {
            const palette = TONES[tone];
            return (
            <motion.div
              key={key}
              variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
              className={spanClass}
            >
              <Link
                to={to}
                className={`group relative flex min-h-[300px] h-full overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(15,23,42,.12)] sm:p-8 ${
                  featured
                    ? "border-white/10 bg-[#081a39] text-white shadow-[0_24px_60px_rgba(8,26,57,.22)]"
                    : palette.card
                }`}
              >
                {featured && (
                  <>
                    <div className="pointer-events-none absolute -end-20 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-[70px]" aria-hidden />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)", backgroundSize: "38px 38px" }} aria-hidden />
                  </>
                )}

                <div className="relative z-10 flex w-full flex-col">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition duration-500 group-hover:rotate-3 group-hover:scale-110 ${featured ? "bg-white text-blue-700 shadow-black/20" : `${palette.icon} shadow-xl`}`}>
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <span className={`text-5xl font-black leading-none tracking-[-0.08em] ${featured ? "text-white/10" : palette.number}`}>{number}</span>
                  </div>

                  <div className="mt-8 max-w-lg">
                    <h3 className={`text-xl font-black tracking-tight sm:text-2xl ${featured ? "text-white" : "text-slate-950"}`}>
                      {t(`features.items.${key}.title`)}
                    </h3>
                    <p className={`mt-3 text-sm font-medium leading-7 ${featured ? "text-blue-100/75" : "text-slate-600"}`}>
                      {t(`features.items.${key}.description`)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                    <span className={`inline-flex items-center gap-2 text-xs font-extrabold ${featured ? "text-cyan-200" : "text-slate-900"}`}>
                      {t("features.learnMore", { defaultValue: isRtl ? "اكتشف المزيد" : "Learn more" })}
                      <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden />
                    </span>

                    {featured ? (
                      <div className="hidden min-w-[180px] rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur sm:block">
                        <div className="mb-3 flex items-center justify-between text-[9px] font-bold text-blue-100"><span>{isRtl ? "نظام القلب" : "Cardiovascular"}</span><span>82%</span></div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" /></div>
                      </div>
                    ) : (
                      <div className={`hidden rounded-2xl px-3 py-2 text-[10px] font-extrabold sm:inline-flex sm:items-center sm:gap-1.5 ${palette.pill}`}>
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        {isRtl ? `${index * 8 + 16} نشاطاً` : `${index * 8 + 16} activities`}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )})}
        </div>
      </motion.div>
    </section>
  );
}
