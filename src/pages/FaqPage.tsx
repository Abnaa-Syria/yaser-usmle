import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, HelpCircle, MessageCircle, ArrowLeft, ArrowRight, Sparkles, BookOpen, CreditCard, Headphones, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { usePublicLandingPage } from "../features/public/hooks";
import { pickLocalized } from "../utils/cmsLocale";
import { useSeo } from "../utils/seo";

type FaqItem = { id?: string; question?: unknown; answer?: unknown };

function normalizeFaqContent(raw: unknown, lang: string): { id: string; question: string; answer: string }[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : [];
  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const question = pickLocalized(o.question, lang);
      const answer = pickLocalized(o.answer, lang);
      const id = typeof o.id === "string" ? o.id : String(question).slice(0, 40);
      if (!question && !answer) return null;
      return { id, question, answer };
    })
    .filter(Boolean) as { id: string; question: string; answer: string }[];
}

export default function FaqPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const { data, isLoading, isError } = usePublicLandingPage();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useSeo({
    title: t("publicFaq.title"),
    description: t("publicFaq.subtitle"),
    path: "/faq",
  });

  const fallbackItems = useMemo(
    () => ["q1", "q2", "q3", "q4", "q5", "q6"].map((key) => ({
      id: key,
      question: t(`publicFaq.items.${key}.question`),
      answer: t(`publicFaq.items.${key}.answer`),
    })),
    [t]
  );

  const items = useMemo(() => {
    const sections = data?.sections ?? [];
    const faq = sections.find((s) => s.key === "FAQ");
    const parsed = normalizeFaqContent(faq?.content, lang);
    // CMS is the only editable source — never append hardcoded translation fallbacks on top.
    if (parsed.length > 0) return parsed.slice(0, 20);
    return fallbackItems;
  }, [data?.sections, fallbackItems, lang]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(lang);
    if (!query) return items;
    return items.filter((item) => `${item.question} ${item.answer}`.toLocaleLowerCase(lang).includes(query));
  }, [items, lang, search]);

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-28 pt-16 text-white md:pb-32 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)", backgroundSize: "64px 64px" }} aria-hidden />

        <div className="relative mx-auto max-w-[1180px] px-4 md:px-6">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link>
            <span>/</span>
            <span className="text-white">{isRtl ? "مركز المساعدة" : "Help Center"}</span>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.12fr_.88fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {isRtl ? "مركز مساعدة Yaser USMLE" : "Yaser USMLE Help Center"}
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.5rem]">
                {t("publicFaq.pageTitlePrefix", { defaultValue: isRtl ? "إجابات واضحة" : "Clear answers" })}{" "}
                <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  {t("publicFaq.pageTitleAccent", { defaultValue: isRtl ? "قبل أن تبدأ" : "before you begin" })}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base">
                {t("publicFaq.pageSubtitle", { defaultValue: t("publicFaq.subtitle") })}
              </p>

              <div className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[.08] p-2 shadow-2xl backdrop-blur-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" aria-hidden />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("publicFaq.searchPlaceholder", { defaultValue: isRtl ? "ابحث عن سؤالك…" : "Search for your question…" })}
                    className="h-14 w-full rounded-xl border-0 bg-white pe-5 ps-12 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { Icon: BookOpen, title: isRtl ? "الدورات والتعلم" : "Courses & learning", body: isRtl ? "المحتوى، طريقة الدراسة، والوصول." : "Content, study format, and access." },
                { Icon: CreditCard, title: isRtl ? "الباقات والدفع" : "Bundles & payment", body: isRtl ? "الأسعار، الدفع، وتفعيل التسجيل." : "Pricing, payment, and activation." },
                { Icon: Headphones, title: isRtl ? "الدعم والحساب" : "Support & account", body: isRtl ? "الحساب والمساعدة التقنية." : "Account and technical assistance." },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="flex items-center gap-4 rounded-[1.35rem] border border-white/10 bg-white/[.055] p-4 backdrop-blur-sm">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-300 text-[#071a38]"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div><p className="text-sm font-black">{title}</p><p className="mt-1 text-[11px] font-medium text-slate-400">{body}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-12 grid max-w-[1180px] gap-7 px-4 md:px-6 lg:grid-cols-[.65fr_1.35fr]">
        <aside className="h-fit rounded-[1.75rem] bg-gradient-to-br from-blue-700 to-[#0a2d5f] p-7 text-white shadow-[0_22px_55px_rgba(37,99,235,.18)] lg:sticky lg:top-28">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200"><MessageCircle className="h-5 w-5" aria-hidden /></span>
          <h2 className="mt-6 text-2xl font-black">{isRtl ? "تحتاج مساعدة إضافية؟" : "Need more help?"}</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-blue-100/75">{isRtl ? "إذا لم تجد إجابتك، تواصل مع فريق المنصة وسنساعدك في أقرب وقت." : "If you cannot find your answer, contact our team and we will help as soon as possible."}</p>
          <Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-800 transition hover:bg-cyan-50">
            {isRtl ? "تواصل مع الدعم" : "Contact support"}<Arrow className="h-4 w-4" aria-hidden />
          </Link>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">{isRtl ? "روابط سريعة" : "QUICK LINKS"}</p>
            <div className="mt-4 space-y-2">
              <Link to="/explore" className="flex items-center justify-between rounded-xl bg-white/[.07] px-4 py-3 text-xs font-bold transition hover:bg-white/[.12]"><span>{t("publicFaq.ctaExplore")}</span><Arrow className="h-3.5 w-3.5" /></Link>
              <Link to="/packages" className="flex items-center justify-between rounded-xl bg-white/[.07] px-4 py-3 text-xs font-bold transition hover:bg-white/[.12]"><span>{isRtl ? "استعرض الباقات" : "Browse bundles"}</span><Arrow className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </aside>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,.08)] sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4 px-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">{isRtl ? "الأسئلة الأكثر شيوعاً" : "COMMON QUESTIONS"}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{isRtl ? "اختر سؤالك لمعرفة التفاصيل" : "Choose a question for details"}</h2>
            </div>
            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">{filteredItems.length}</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div>
          ) : null}

          {isError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">{t("publicFaq.loadError")}</div> : null}

          {!isLoading && filteredItems.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center">
              <HelpCircle className="h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-4 text-sm font-bold text-slate-500">{search ? (isRtl ? "لا توجد إجابة مطابقة لبحثك." : "No answers match your search.") : t("publicFaq.empty")}</p>
              {search ? <button type="button" onClick={() => setSearch("")} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-blue-700"><RotateCcw className="h-3.5 w-3.5" />{isRtl ? "مسح البحث" : "Clear search"}</button> : null}
            </div>
          ) : null}

          <div className="space-y-3">
            {!isLoading && filteredItems.map((item, index) => {
              const id = item.id || item.question || "";
              const open = openId === id;
              return (
                <div key={id} className={`overflow-hidden rounded-[1.35rem] border transition-all duration-300 ${open ? "border-blue-200 shadow-[0_14px_35px_rgba(37,99,235,.08)]" : "border-slate-200 hover:border-blue-200"}`}>
                  <button type="button" onClick={() => setOpenId(open ? null : id)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-5 text-start rtl:text-right sm:px-6">
                    <span className={`text-xl font-black tracking-[-.08em] ${open ? "text-blue-600" : "text-slate-200"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-sm font-black leading-6 text-slate-900 sm:text-base">{item.question}</span>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${open ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"}`}><ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden /></span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}>
                        <div className="mx-5 border-t border-slate-100 py-5 ps-10 text-sm font-medium leading-7 text-slate-600 sm:mx-6 sm:ps-12">{item.answer}</div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
