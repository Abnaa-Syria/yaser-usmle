import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Star,
  Users,
  Sparkles,
  Brain,
  HeartPulse,
  Clock3,
  GraduationCap,
} from "lucide-react";
import { useRecommendedCourses } from "../features/public/hooks";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

function formatLearnerCount(n) {
  const count = Number(n) || 0;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-sm">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-6">
        <div className="h-6 w-4/5 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

const COVER_STYLES = [
  "from-[#071a3a] via-[#0d3a78] to-[#1671d9]",
  "from-[#13213f] via-[#303b80] to-[#6557d9]",
  "from-[#072d37] via-[#087b78] to-[#1bb59b]",
  "from-[#28133e] via-[#67276f] to-[#b3457e]",
];

function CourseCover({ course, index, typeLabel }) {
  const CoverIcon = index % 2 === 0 ? HeartPulse : Brain;
  const [broken, setBroken] = useState(false);
  const thumb = !broken ? resolveMediaUrl(course.thumbnail || course.coverImage || "") : "";

  if (thumb) {
    return (
      <div className="relative h-full overflow-hidden bg-slate-200">
        <img
          src={thumb}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setBroken(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06152f]/75 via-transparent to-[#06152f]/20" />
        <span className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-extrabold text-white backdrop-blur-md">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden />
          {typeLabel}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative h-full overflow-hidden bg-gradient-to-br ${COVER_STYLES[index % COVER_STYLES.length]}`}>
      <div className="absolute -end-14 -top-16 h-52 w-52 rounded-full border-[32px] border-white/[0.06]" aria-hidden />
      <div className="absolute -bottom-24 -start-16 h-64 w-64 rounded-full bg-white/[0.06] blur-2xl" aria-hidden />
      <svg className="absolute inset-x-0 bottom-3 h-20 w-full text-white/[0.10]" viewBox="0 0 600 100" fill="none" aria-hidden>
        <path d="M0 55h90l18-28 28 58 31-74 30 44h62l18-20 25 40 32-61 28 41h238" stroke="currentColor" strokeWidth="3" />
      </svg>
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold text-white backdrop-blur-md">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden />
            {typeLabel}
          </span>
          <span className="text-[10px] font-black tracking-[0.22em] text-white/55">STEP 1</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-lg">
            <CoverIcon className="h-8 w-8" strokeWidth={1.7} aria-hidden />
          </div>
          <p className="max-w-[55%] text-end text-[10px] font-bold uppercase leading-5 tracking-[0.13em] text-white/65">
            {course.category?.name || "Integrated Medical Science"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RecommendedCourseCard({ course, isRtl, index }) {
  const { t } = useTranslation();
  const typeLabel = t("recommendedCourses.type.recorded", {
    defaultValue: isRtl ? "مسجّل تفاعلي" : "Interactive Recorded",
  });

  const instructorName =
    course.instructor?.fullName ||
    t("recommendedCourses.instructorFallback", { defaultValue: isRtl ? "مدرّس معتمد" : "Certified Instructor" });

  const ratingDisplay =
    course.rating != null ? course.rating.toFixed(1) : "4.8";
  const learners = formatLearnerCount(
    course.purchaseCount > 0 ? course.purchaseCount : course.reviewCount * 12 + 48
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_28px_70px_rgba(22,57,120,0.15)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="h-full transition-transform duration-700 ease-out group-hover:scale-[1.035]">
          <CourseCover course={course} index={index} typeLabel={typeLabel} />
        </div>
        {course.isBestSeller ? (
          <span className="absolute bottom-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-[10px] font-black text-amber-950 shadow-lg">
            <Sparkles className="h-3 w-3" aria-hidden />
            {t("recommendedCourses.bestSeller", { defaultValue: isRtl ? "الأكثر مبيعاً" : "Best Seller" })}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {ratingDisplay}
            <span className="text-slate-300">/ 5</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Users className="h-3.5 w-3.5" />
            {learners} {t("recommendedCourses.learners", { defaultValue: isRtl ? "متعلّم" : "learners" })}
          </span>
        </div>

        <Link
          to={`/courses/${course.id}`}
          className="line-clamp-2 min-h-[3.5rem] text-lg font-black leading-7 tracking-tight text-slate-950 transition hover:text-blue-700"
        >
          {course.title}
        </Link>

        <p className="mt-2 text-xs font-semibold text-slate-500">
          {t("recommendedCourses.withInstructor", { defaultValue: isRtl ? "مع" : "With" })}{" "}
          <span className="text-slate-800">{instructorName}</span>
        </p>

        <div className="mt-5 flex items-center gap-2 border-y border-slate-100 py-3 text-[10px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-blue-600" aria-hidden />{isRtl ? "محتوى عالي العائد" : "High-yield content"}</span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-blue-600" aria-hidden />{isRtl ? "وصول مرن" : "Flexible access"}</span>
        </div>

        <div className="mt-auto flex items-end justify-end gap-4 pt-5">
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg transition duration-300 hover:scale-105 hover:bg-blue-700"
            aria-label={t("recommendedCourses.subscribeNow", { defaultValue: isRtl ? "اشترك الآن" : "Enroll Now" })}
          >
            {isRtl ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function RecommendedCourses() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [activeFilter, setActiveFilter] = useState("bestseller");

  const { data, isLoading, isError } = useRecommendedCourses(activeFilter, 8);

  const tabs = useMemo(() => {
    if (data?.tabs?.length) return data.tabs;
    return [
      {
        id: "bestseller",
        label: "Best Sellers",
        labelAr: "أكثر مبيعاً",
        courseCount: 0,
      },
      {
        id: "all",
        label: "All Courses",
        labelAr: "جميع الدورات",
        courseCount: 0,
      },
    ];
  }, [data?.tabs]);

  const courses = data?.courses ?? [];

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -start-40 top-20 h-96 w-96 rounded-full bg-blue-100/60 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -end-48 bottom-0 h-96 w-96 rounded-full bg-cyan-100/50 blur-[120px]" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
        <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3.5 py-2 text-[11px] font-extrabold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {isRtl ? "مسارات Step 1 المختارة" : "Curated Step 1 pathways"}
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
              {t("recommendedCourses.heroTitle", {
                defaultValue: isRtl ? "اكتشف دوراتنا التدريبية المختلفة" : "Discover Our Training Courses",
              })}
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
              {t("recommendedCourses.heroSubtitle", {
                defaultValue: isRtl
                  ? "اختر مسار المذاكرة الأنسب لك — دورات طبية منظمة يقدمها محاضرون خبراء في USMLE Step 1."
                  : "Choose the study path that fits you — structured medical courses led by experienced USMLE Step 1 educators.",
              })}
            </p>
          </div>
          <Link
            to="/explore"
            className="group hidden h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-extrabold text-slate-900 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow-md lg:inline-flex"
          >
            {t("recommendedCourses.viewCatalog", { defaultValue: isRtl ? "عرض كامل الكتالوج" : "View full catalog" })}
            {isRtl ? <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /> : <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
          </Link>
        </div>

        <div className="mt-10">
          <div
            className="scrollbar-hide flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50 p-1.5 shadow-inner"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {tabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              const label = isRtl ? tab.labelAr || tab.label : tab.label;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`relative shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-extrabold transition md:px-5 ${
                    isActive ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/70" : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 md:mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-6 py-14 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">
                {t("recommendedCourses.loadError", {
                  defaultValue: isRtl ? "تعذّر تحميل الدورات. حاول مرة أخرى لاحقاً." : "Could not load courses. Please try again later.",
                })}
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-500">
                {t("recommendedCourses.empty", {
                  defaultValue: isRtl ? "لا توجد دورات في هذا التصنيف حالياً." : "No courses in this category yet.",
                })}
              </p>
              <Link
                to="/explore"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--yu-blue-700)] hover:text-[var(--yu-blue-600)]"
              >
                {t("recommendedCourses.browseAll", { defaultValue: isRtl ? "تصفح كل الدورات" : "Browse all courses" })}
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {courses.map((course, index) => (
                  <RecommendedCourseCard key={course.id} course={course} isRtl={isRtl} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="mt-10 flex justify-center lg:hidden">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-blue-700"
          >
            {t("recommendedCourses.viewCatalog", { defaultValue: isRtl ? "عرض كامل الكتالوج" : "View full catalog" })}
            {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
      </div>
    </section>
  );
}
