import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, ArrowLeft, HelpCircle, MessageCircle, Sparkles } from "lucide-react";

import { pickLocalized } from "../utils/cmsLocale";

function normalizeFaqContent(raw, lang) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = pickLocalized(item.question, lang);
      const answer = pickLocalized(item.answer, lang);
      const id = typeof item.id === "string" ? item.id : String(question).slice(0, 40);
      if (!question && !answer) return null;
      return { id, question, answer };
    })
    .filter(Boolean);
}

export default function FaqSection({ rawContent }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [openId, setOpenId] = useState(null);

  const fallbackItems = useMemo(
    () => [
      {
        id: "q1",
        question: t("publicFaq.items.q1.question"),
        answer: t("publicFaq.items.q1.answer"),
      },
      {
        id: "q2",
        question: t("publicFaq.items.q2.question"),
        answer: t("publicFaq.items.q2.answer"),
      },
      {
        id: "q3",
        question: t("publicFaq.items.q3.question"),
        answer: t("publicFaq.items.q3.answer"),
      },
      {
        id: "q4",
        question: t("publicFaq.items.q4.question"),
        answer: t("publicFaq.items.q4.answer"),
      },
    ],
    [t]
  );

  const faqItems = useMemo(() => {
    const parsed = normalizeFaqContent(rawContent, i18n.language);
    if (parsed.length >= 3) return parsed;
    const parsedQuestions = new Set(parsed.map((item) => item.question));
    return [...parsed, ...fallbackItems.filter((item) => !parsedQuestions.has(item.question))].slice(0, 4);
  }, [rawContent, fallbackItems, i18n.language]);

  const schemaMarkup = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    }),
    [faqItems]
  );

  if (!faqItems.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#f4f8fd] py-20 md:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <div className="pointer-events-none absolute -start-40 top-0 h-96 w-96 rounded-full bg-blue-200/35 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -end-40 bottom-0 h-96 w-96 rounded-full bg-cyan-200/25 blur-[110px]" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[.78fr_1.22fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] bg-[#071a38] p-6 text-white shadow-[0_25px_65px_rgba(7,26,56,.18)] sm:p-8 lg:self-start lg:p-9"
          >
            <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  {isRtl ? "إجابات تساعدك على البدء" : "Answers to help you begin"}
                </span>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-300 text-[#071a38] shadow-lg shadow-blue-500/20">
                  <HelpCircle className="h-6 w-6" aria-hidden />
                </div>
              </div>

              <h2 className="mt-8 max-w-md text-3xl font-black leading-[1.35] tracking-[-0.04em] text-white sm:text-4xl">
                {t("publicFaq.title")}
              </h2>
              <p className="mt-4 max-w-md text-sm font-medium leading-7 text-slate-300 sm:text-base">
                {t("publicFaq.subtitle")}
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200">
                    <MessageCircle className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400">{isRtl ? "لم تجد الإجابة التي تبحث عنها؟" : "Still have a question?"}</p>
                    <Link to="/contact" className="mt-1 inline-flex items-center gap-2 text-sm font-black text-white transition hover:text-cyan-200">
                      {isRtl ? "تحدث مع فريق الدعم" : "Talk to our support team"}
                      <Arrow className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col justify-center">
            <div className="space-y-3">
              {faqItems.map((item, index) => {
                const id = item.id || item.question;
                const isOpen = openId === id;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: isRtl ? -18 : 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`overflow-hidden rounded-[1.35rem] border bg-white transition-all duration-300 ${
                      isOpen ? "border-blue-200 shadow-[0_16px_40px_rgba(30,64,175,.09)]" : "border-slate-200/80 hover:border-blue-200 hover:shadow-lg"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 px-5 py-5 text-start rtl:text-right sm:px-6 sm:py-6"
                    >
                      <span className={`text-2xl font-black tracking-[-0.08em] transition-colors ${isOpen ? "text-blue-600" : "text-slate-200"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-sm font-black leading-6 text-slate-900 sm:text-base">{item.question}</span>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${isOpen ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                        >
                          <div className="mx-5 border-t border-slate-100 py-5 ps-12 text-sm font-medium leading-7 text-slate-600 sm:mx-6 sm:ps-14">
                            {item.answer}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <Link
              to="/faq"
              className="mt-7 inline-flex w-fit items-center gap-2 text-xs font-black text-blue-700 transition hover:text-blue-900"
            >
              {t("publicFaq.viewAll", { defaultValue: isRtl ? "عرض كل الأسئلة" : "View all questions" })}
              <Arrow className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
