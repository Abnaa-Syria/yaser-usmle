import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  BookOpen,
  Brain,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Star,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { pickLocalized } from "../utils/cmsLocale";
import client from "../api/client";

const STATS_CONFIG = [
  {
    id: "students",
    labelAr: "طالب مسجّل",
    labelEn: "Enrolled Students",
    icon: Users,
    bg: "bg-yu-blue-50 dark:bg-yu-blue-700/10",
    textColor: "text-yu-blue-700 dark:text-yu-blue-300",
  },
  {
    id: "courses",
    labelAr: "دورة متخصصة",
    labelEn: "Specialized Courses",
    icon: BookOpen,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  {
    id: "instructors",
    labelAr: "محاضر خبير",
    labelEn: "Expert Instructors",
    icon: Brain,
    bg: "bg-violet-50 dark:bg-violet-500/10",
    textColor: "text-violet-700 dark:text-violet-400",
  },
  {
    id: "success",
    labelAr: "رضا الطلاب",
    labelEn: "Student Satisfaction",
    icon: CheckCircle,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    textColor: "text-amber-700 dark:text-amber-400",
  },
];

export default function Hero({ cmsContent, stats }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await client.get("/public/banners");
        const items = res?.data?.data?.banners || [];
        setBanners(items);
      } catch {
        // Banners are optional; silently ignore
      }
    }
    void fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const cmsHeadline = pickLocalized(cmsContent?.headline, lang).trim();
  const cmsSubheadline = pickLocalized(cmsContent?.subheadline, lang).trim();
  const useCmsCopy = Boolean(cmsHeadline || cmsSubheadline);

  const statsData = [
    { ...STATS_CONFIG[0], value: stats?.studentsFormatted || stats?.students || "1,500+" },
    { ...STATS_CONFIG[1], value: stats?.courses ? `${stats.courses}+` : "3+" },
    { ...STATS_CONFIG[2], value: stats?.instructors ? `${stats.instructors}+` : "3+" },
    { ...STATS_CONFIG[3], value: "100%" },
  ];

  const currentBanner = banners[currentBannerIndex];

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f7fc] px-3 py-5 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.12),transparent_26%),radial-gradient(circle_at_88%_80%,rgba(37,99,235,0.09),transparent_25%)]" aria-hidden />

      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.75rem] bg-[#071733] shadow-[0_30px_90px_rgba(7,23,51,0.22)] sm:rounded-[2.5rem]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)", backgroundSize: "56px 56px" }} aria-hidden />
        <div className="pointer-events-none absolute -end-32 -top-48 h-[34rem] w-[34rem] rounded-full bg-blue-500/25 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute -bottom-56 -start-20 h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-[100px]" aria-hidden />

        <div className="relative grid min-h-[660px] items-center gap-10 px-5 pb-8 pt-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-14 lg:pb-12 lg:pt-14 lg:[direction:ltr] xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="order-1 text-start lg:order-2"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-2 text-[11px] font-bold text-blue-100 backdrop-blur-md sm:px-4 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
              {t("hero.upperTag")}
            </div>

            <h1 className="max-w-3xl text-[2.35rem] font-black leading-[1.13] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.45rem] xl:text-[4rem]">
              {useCmsCopy && cmsHeadline ? (
                cmsHeadline
              ) : (
                <>
                  {t("hero.headline.start")}{" "}
                  <span className="bg-gradient-to-l from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    {t("hero.headline.highlight")}
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base lg:text-lg">
              {useCmsCopy && cmsSubheadline ? cmsSubheadline : t("hero.subheadline")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/explore" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-white px-7 text-sm font-extrabold text-[#0a234b] shadow-[0_14px_35px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:bg-blue-50">
                {t("hero.actions.startLearning")}
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => window.open("https://www.youtube.com/@YaserUSMLE", "_blank", "noopener,noreferrer")}
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-6 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                </span>
                {t("hero.actions.watchNow")}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-300">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />{isRtl ? "منهج منظم عالي العائد" : "High-yield structured curriculum"}</span>
              <span className="inline-flex items-center gap-2"><Stethoscope className="h-4 w-4 text-cyan-300" aria-hidden />{isRtl ? "شرح قائم على الفهم" : "Mechanism-first teaching"}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.08 }}
            className="order-2 lg:order-1"
          >
            <div className="relative mx-auto max-w-[620px] pb-8 pt-3">
              <div className="absolute -inset-3 rounded-[2.2rem] border border-white/10 bg-white/[0.04] backdrop-blur-sm" aria-hidden />
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-blue-950 to-blue-800 shadow-[0_35px_75px_rgba(0,0,0,.35)]">
                {currentBanner ? (
                  <img src={currentBanner.imageUrl} alt={currentBanner.title || t("hero.bannerAlt", { defaultValue: "Yaser USMLE course" })} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" loading="eager" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,.55),transparent_42%),linear-gradient(145deg,#0b2b61,#071733)] text-white">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-md"><Brain className="h-12 w-12 text-cyan-200" aria-hidden /></div>
                    <p className="mt-5 text-sm font-black tracking-[0.2em]">YASER USMLE</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#06142d]/80 to-transparent" aria-hidden />

                {banners.length > 1 && (
                  <div className="absolute end-4 top-4 z-20 flex gap-2">
                    <button type="button" onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#071733]/55 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-900" aria-label={isRtl ? "السابق" : "Previous"}><ArrowLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#071733]/55 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-900" aria-label={isRtl ? "التالي" : "Next"}><ArrowRight className="h-4 w-4" /></button>
                  </div>
                )}
              </div>

              <div className="absolute -bottom-1 start-3 z-20 min-w-[185px] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_18px_45px_rgba(4,18,43,.22)] backdrop-blur-xl sm:-start-5">
                <div className="flex items-center justify-between gap-5">
                  <div><p className="text-[10px] font-bold text-slate-500">{isRtl ? "تقدمك هذا الأسبوع" : "Weekly progress"}</p><p className="mt-1 text-2xl font-black text-slate-950">78%</p></div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><TrendingUp className="h-5 w-5" aria-hidden /></div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" /></div>
              </div>

              <div className="absolute -end-1 top-1/2 z-20 hidden -translate-y-1/2 rounded-2xl border border-white/15 bg-[#0b2349]/90 p-3.5 text-white shadow-2xl backdrop-blur-xl sm:block lg:-end-7">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300"><Star className="h-5 w-5 fill-current" /></div><div><p className="text-lg font-black">4.9/5</p><p className="text-[9px] font-semibold text-blue-200">{isRtl ? "تقييم الطلاب" : "Student rating"}</p></div></div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative border-t border-white/10 bg-white/[0.035] px-5 py-5 sm:px-8 lg:px-14 xl:px-20">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statsData.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + index * 0.07 }} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3.5 transition hover:-translate-y-0.5 hover:bg-white/[0.09] sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-200 ring-1 ring-inset ring-white/10"><Icon className="h-[18px] w-[18px]" aria-hidden /></div>
                  <div><div className="text-lg font-black text-white sm:text-xl">{item.value}</div><div className="mt-0.5 text-[9px] font-semibold text-slate-400 sm:text-[10px]">{isRtl ? item.labelAr : item.labelEn}</div></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
