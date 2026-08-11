import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Brain, Layers, ClipboardCheck, Calendar, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { pickLocalized } from "../utils/cmsLocale";

const FALLBACK_ITEMS = [
  { key: "structuredCourses", Icon: Brain, to: "/explore", spanClass: "lg:col-span-7", featured: true, number: "01" },
  { key: "flashcards", Icon: Layers, to: "/login", spanClass: "lg:col-span-5", tone: "blue", number: "02" },
  { key: "quizzes", Icon: ClipboardCheck, to: "/login", spanClass: "lg:col-span-5", tone: "emerald", number: "03" },
  { key: "studyPlan", Icon: Calendar, to: "/login", spanClass: "lg:col-span-7", tone: "violet", number: "04" },
];

const ICONS = { Brain, Layers, ClipboardCheck, Calendar };
const SPANS = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];
const TONES_CYCLE = ["blue", "emerald", "violet", "blue"];

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

export default function Features({ cmsContent = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const c = cmsContent && typeof cmsContent === "object" ? cmsContent : null;

  const eyebrow = pickLocalized(c?.eyebrow, lang) || t("features.eyebrow", { defaultValue: isRtl ? "منظومة تعلم متكاملة" : "A complete learning system" });
  const titleStart = pickLocalized(c?.titleStart, lang) || t("features.titleStart", { defaultValue: isRtl ? "كل ما تحتاجه" : "Everything you need" });
  const titleAccent = pickLocalized(c?.titleAccent, lang) || t("features.titleAccent", { defaultValue: isRtl ? "للنجاح في USMLE" : "to pass USMLE" });
  const subtitle =
    pickLocalized(c?.subtitle, lang) ||
    t("features.subtitle", {
      defaultValue: isRtl
        ? "منصة متكاملة تجمع المحتوى الطبي، والاختبارات، والبطاقات الدراسية، وخطط المراجعة في مكان واحد"
        : "An integrated platform combining medical content, quizzes, flashcards, and review plans in one place",
    });

  const cmsItems = Array.isArray(c?.items) ? c.items : [];
  const items =
    cmsItems.length > 0
      ? cmsItems.map((item, index) => {
          const Icon = ICONS[item.icon] || FALLBACK_ITEMS[index % FALLBACK_ITEMS.length].Icon;
          return {
            key: item.id || `f-${index}`,
            Icon,
            to: item.to || "/explore",
            spanClass: SPANS[index % SPANS.length],
            featured: index === 0,
            tone: item.tone || TONES_CYCLE[index % TONES_CYCLE.length],
            number: item.number || String(index + 1).padStart(2, "0"),
            title: pickLocalized(item.title, lang) || t(`features.items.${FALLBACK_ITEMS[index % FALLBACK_ITEMS.length].key}.title`, { defaultValue: "" }),
            description:
              pickLocalized(item.description, lang) ||
              t(`features.items.${FALLBACK_ITEMS[index % FALLBACK_ITEMS.length].key}.description`, { defaultValue: "" }),
            imageUrl: item.imageUrl || "",
          };
        })
      : FALLBACK_ITEMS.map((item) => ({
          ...item,
          title: t(`features.items.${item.key}.title`),
          description: t(`features.items.${item.key}.description`),
          imageUrl: "",
        }));

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
              {eyebrow}
            </p>
            <h2 className="max-w-3xl text-3xl font-black leading-[1.18] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
              {titleStart}{" "}
              <span className="bg-gradient-to-l from-blue-700 to-cyan-500 bg-clip-text text-transparent">{titleAccent}</span>
            </h2>
          </div>
          <p className="border-s-2 border-blue-200 ps-5 text-sm font-medium leading-7 text-slate-600 sm:text-base">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {items.map(({ key, Icon, to, spanClass, featured, tone, number, title, description, imageUrl }, index) => {
            const toneCfg = featured ? null : TONES[tone] || TONES.blue;
            return (
              <motion.div
                key={key}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.06 } } }}
                className={spanClass}
              >
                <Link
                  to={to}
                  className={`group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-[1.75rem] border p-6 transition duration-500 hover:-translate-y-1 sm:p-8 ${
                    featured
                      ? "border-slate-900/10 bg-[linear-gradient(145deg,#07111F_0%,#1B4FBF_55%,#0B2A5A_100%)] text-white shadow-xl"
                      : `${toneCfg.card} shadow-sm`
                  }`}
                >
                  {imageUrl ? <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" /> : null}
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${featured ? "bg-white/15 text-white" : toneCfg.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-4xl font-black ${featured ? "text-white/20" : toneCfg.number}`}>{number}</span>
                  </div>
                  <div className="relative z-10 mt-auto pt-8">
                    <h3 className={`text-xl font-black tracking-tight ${featured ? "text-white" : "text-slate-950"}`}>{title}</h3>
                    <p className={`mt-3 text-sm font-medium leading-7 ${featured ? "text-blue-100/90" : "text-slate-600"}`}>{description}</p>
                    <span className={`mt-5 inline-flex items-center gap-2 text-xs font-extrabold ${featured ? "text-cyan-200" : "text-blue-700"}`}>
                      {t("common.learnMore", { defaultValue: isRtl ? "اعرف المزيد" : "Learn more" })}
                      <Arrow className="h-3.5 w-3.5" />
                    </span>
                    {!featured ? (
                      <span className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${toneCfg.pill}`}>
                        <Check className="h-3 w-3" /> {t("features.included", { defaultValue: isRtl ? "ضمن المنصة" : "Included" })}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
