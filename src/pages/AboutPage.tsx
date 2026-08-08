import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Target, Sparkles, Users, ArrowLeft, ArrowRight, Brain, BookOpenCheck, ChartNoAxesCombined, Quote, ShieldCheck } from "lucide-react";
import { usePublicLandingPage } from "../features/public/hooks";
import { pickLocalized } from "../utils/cmsLocale";
import { useSeo } from "../utils/seo";

type AboutContent = {
  mission?: unknown;
  vision?: unknown;
  description?: unknown;
  teamPhoto?: string;
};

function parseAbout(raw: unknown): AboutContent | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as AboutContent;
}

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const { data, isLoading, isError } = usePublicLandingPage();

  useSeo({
    title: t("publicAbout.title"),
    description: t("publicAbout.subtitle"),
    path: "/about",
  });

  const about = useMemo(() => {
    const sections = data?.sections ?? [];
    const row = sections.find((s) => s.key === "ABOUT_US");
    return parseAbout(row?.content);
  }, [data?.sections]);

  const mission = pickLocalized(about?.mission, lang);
  const vision = pickLocalized(about?.vision, lang);
  const description = pickLocalized(about?.description, lang);
  const teamPhoto = about?.teamPhoto || "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=85&w=1400&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-24 pt-16 text-white md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)", backgroundSize: "64px 64px" }} aria-hidden />

        <div className="relative mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link>
            <span>/</span>
            <span className="text-white">{t("publicAbout.title")}</span>
          </nav>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {t("publicAbout.eyebrow", { defaultValue: isRtl ? "تعليم طبي يبدأ بالفهم" : "Medical learning that starts with understanding" })}
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.6rem]">
                {t("publicAbout.heroPrefix", { defaultValue: isRtl ? "نبني الفهم الذي يقود إلى" : "Building understanding that leads to" })}{" "}
                <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  {t("publicAbout.heroAccent", { defaultValue: isRtl ? "الثقة" : "confidence" })}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{t("publicAbout.subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/explore" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">
                  {t("publicAbout.cta")}<Arrow className="h-4 w-4" aria-hidden />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/[.1]">
                  {isRtl ? "تواصل معنا" : "Contact us"}
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] p-2 shadow-2xl">
                <img
                  src={teamPhoto}
                  alt={t("publicAbout.title")}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=85&w=1400&auto=format&fit=crop";
                  }}
                  className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-[1.55rem] object-cover"
                />
                <div className="absolute inset-2 rounded-[1.55rem] bg-gradient-to-t from-[#06152f]/90 via-[#06152f]/15 to-transparent" />
                <div className="absolute inset-x-8 bottom-8">
                  <Quote className="h-7 w-7 text-cyan-300" aria-hidden />
                  <p className="mt-3 max-w-md text-lg font-black leading-8 text-white">{t("publicAbout.heroQuote", { defaultValue: isRtl ? "لا نريدك أن تحفظ المعلومة فقط؛ نريدك أن تفهم لماذا هي صحيحة." : "We do not want you to only memorize the answer—we want you to understand why it is right." })}</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -start-5 rounded-2xl border border-white/10 bg-blue-600 p-4 text-white shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-100">YASER USMLE</p>
                <p className="mt-1 text-sm font-black">{isRtl ? "فهم أعمق. استعداد أوضح." : "Deeper understanding. Clearer preparation."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-8 max-w-[1240px] px-4 md:px-6 lg:px-8">
        {isLoading ? <div className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" /> : null}
        {isError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">{t("publicAbout.loadError")}</div> : null}

        <section className="mt-12 grid items-center gap-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,.07)] md:p-10 lg:grid-cols-[.72fr_1.28fr]">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-blue-700 to-cyan-600 p-8 text-white">
            <span className="text-[6rem] font-black leading-none text-white/[.12]">01</span>
            <p className="mt-12 text-[10px] font-black uppercase tracking-[.2em] text-cyan-100">{t("publicAbout.storyTitle")}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">{isRtl ? "منصة بُنيت حول احتياجات طالب Step 1" : "A platform built around the Step 1 learner"}</h2>
          </div>
          <div>
            <p className="text-lg font-bold leading-9 text-slate-700 sm:text-xl">
              {description || t("publicAbout.fallbackStory")}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <article className="rounded-[1.35rem] border border-blue-100 bg-blue-50/60 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm"><Target className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-4 text-sm font-black text-slate-950">{t("publicAbout.mission")}</h3>
                <p className="mt-2 text-xs font-medium leading-6 text-slate-600">{mission || t("publicAbout.missionFallback")}</p>
              </article>
              <article className="rounded-[1.35rem] border border-cyan-100 bg-cyan-50/60 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm"><Sparkles className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-4 text-sm font-black text-slate-950">{t("publicAbout.vision")}</h3>
                <p className="mt-2 text-xs font-medium leading-6 text-slate-600">{vision || t("publicAbout.visionFallback")}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-700">{isRtl ? "منهجنا في التعليم" : "HOW WE TEACH"}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{isRtl ? "كل جزء في المنصة يخدم هدفاً تعليمياً واضحاً" : "Every part of the platform serves a clear learning goal"}</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-500">{isRtl ? "من طريقة شرح المفاهيم إلى التدريب وقياس التقدم، صممنا التجربة لتساعدك على بناء معرفة قابلة للتطبيق." : "From concept teaching to practice and progress tracking, the experience is built to create knowledge you can apply."}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { Icon: Brain, number: "01", title: isRtl ? "الفهم قبل الحفظ" : "Understand before memorizing", body: isRtl ? "نشرح الآليات والعلاقات حتى تصبح المعلومة منطقية وأسهل في الاسترجاع." : "We explain mechanisms and relationships so knowledge becomes logical and easier to recall." },
              { Icon: BookOpenCheck, number: "02", title: isRtl ? "تعلم منظم حسب الأنظمة" : "Systems-based structure", body: isRtl ? "نرتب المحتوى في مسارات واضحة تربط العلوم الأساسية بالسياق السريري." : "Content follows clear paths connecting foundational science with clinical context." },
              { Icon: ChartNoAxesCombined, number: "03", title: isRtl ? "تقدم يمكن قياسه" : "Progress you can measure", body: isRtl ? "الاختبارات والفلاش كاردز وخطة المذاكرة تساعدك على معرفة موقعك والخطوة التالية." : "Quizzes, flashcards, and study planning show where you stand and what comes next." },
            ].map(({ Icon, number, title, body }) => (
              <article key={title} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_12px_35px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <span className="absolute -end-2 -top-5 text-[6rem] font-black leading-none text-blue-500/[.07]">{number}</span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a38] text-cyan-300"><Icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="relative mt-6 text-lg font-black text-slate-950">{title}</h3>
                <p className="relative mt-3 text-sm font-medium leading-7 text-slate-500">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] bg-[#071a38] text-white">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-5">
              <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 sm:flex"><Users className="h-6 w-6" aria-hidden /></span>
              <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">YASER USMLE</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{t("publicAbout.joinTitle")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-400">{isRtl ? "ابدأ بمسار يناسب مرحلتك، وتعلّم داخل تجربة تجمع المحتوى والتدريب والمتابعة." : "Start with a path that fits your stage and learn through one experience combining content, practice, and progress."}</p></div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">{t("header.actions.signUp")}<Arrow className="h-4 w-4" /></Link>
              <Link to="/faq" className="rounded-xl border border-white/15 px-5 py-3.5 text-sm font-black transition hover:bg-white/[.08]">{t("footer.community.faq")}</Link>
            </div>
          </div>
          <div id="policies" className="flex flex-col justify-between gap-3 border-t border-white/10 px-8 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:px-10">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" />{t("publicAbout.policiesBody")}</span>
            <Link to="/terms" className="shrink-0 font-black text-white hover:text-cyan-200">{t("footer.teaching.terms")}</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
