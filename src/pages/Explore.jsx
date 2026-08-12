import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Users,
  ChevronDown,
  SlidersHorizontal,
  Star,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  BookOpen,
  Brain,
  ClipboardCheck,
  RotateCcw,
  Folder,
  Layers,
  Atom,
  Activity,
  HeartPulse,
  Stethoscope,
  Pill,
  Microscope,
  Bone,
} from "lucide-react";
import { usePublicCategories, usePublicCourses } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { useToggleWishlist, useWishlist } from "../features/student/wishlist/hooks";
import { useSeo } from "../utils/seo";
import { stripHtml } from "../utils/htmlContent";
import { useCatalogHero } from "../hooks/useCatalogHero";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=85&w=1200&auto=format&fit=crop";

const CATEGORY_ICON_MAP = {
  Brain,
  BookOpen,
  Book: BookOpen,
  Folder,
  Layers,
  Atom,
  Activity,
  Heart,
  HeartPulse,
  Stethoscope,
  Pill,
  Microscope,
  Bone,
  ClipboardCheck,
  Sparkles,
};

function CategoryGlyph({ name, className = "h-4 w-4" }) {
  const Icon = CATEGORY_ICON_MAP[name] || Folder;
  return <Icon className={className} aria-hidden />;
}

function coursePrice(course) {
  const n = Number(course?.price);
  return Number.isNaN(n) ? null : n;
}

function formatLearnerCount(n) {
  const count = Number(n) || 0;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function categoryLabel(cat, isRtl) {
  if (!cat) return null;
  if (isRtl) return cat.nameAr || cat.name || cat.label;
  return cat.name || cat.nameAr || cat.label;
}

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
      <div className="aspect-[16/9] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-6">
        <div className="h-5 w-4/5 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function CourseCard({ course, isRtl, isWishlisted, onToggleWishlist, showWishlist }) {
  const { t } = useTranslation();
  const purchaseCount = Number(course._count?.purchases ?? 0);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const imageSrc =
    resolveMediaUrl(course.thumbnail) ||
    resolveMediaUrl(course.instructor?.avatar) ||
    FALLBACK_THUMB;
  const typeLabel = t("explore.categories.recorded", { defaultValue: isRtl ? "مسجّل تفاعلي" : "Recorded" });
  const catLabel = course.categoryLabel || categoryLabel(course.category, isRtl);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,.055)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_24px_55px_rgba(15,23,42,.11)]">
      <Link to={`/courses/${course.id}`} className="relative block aspect-[16/9] overflow-hidden bg-[#dce8f7]">
        {showWishlist ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist?.(course.id);
            }}
            className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/90 shadow-lg backdrop-blur-md transition hover:scale-105"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
          </button>
        ) : null}
        <img
          src={imageSrc}
          alt={course.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_THUMB;
          }}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06152f]/85 via-transparent to-transparent" />
        {catLabel ? (
          <span className="absolute start-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black text-blue-800 shadow-sm backdrop-blur-md">
            {catLabel}
          </span>
        ) : null}
        <span className="absolute bottom-4 start-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#071a38]/80 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md">
          <BookOpen className="h-3.5 w-3.5 text-cyan-300" />
          {typeLabel}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link to={`/courses/${course.id}`} className="line-clamp-2 text-lg font-black leading-7 tracking-tight text-slate-950 transition hover:text-blue-700">
          {isRtl ? course.titleAr || course.title : course.title}
        </Link>

        <p className="mt-2 text-xs font-bold text-slate-500">
          {t("recommendedCourses.withInstructor", { defaultValue: isRtl ? "مع" : "With" })}{" "}
          <span className="text-slate-800">{course.instructorName}</span>
        </p>

        {course.shortDescription || course.description ? (
          <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
            {isRtl
              ? course.shortDescriptionAr || course.shortDescription || stripHtml(course.descriptionAr || course.description)
              : course.shortDescription || stripHtml(course.description)}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-[11px] font-bold text-slate-500">
          {purchaseCount >= 3 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
              <Sparkles className="h-3 w-3" />
              {t("recommendedCourses.bestSeller", { defaultValue: isRtl ? "الأكثر مبيعاً" : "Best Seller" })}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            4.8
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatLearnerCount(purchaseCount)}{" "}
            {t("explore.enrollmentsLabel", { defaultValue: isRtl ? "متعلّم" : "learners" })}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-end gap-4 pt-5">
          <Link to={`/courses/${course.id}`} aria-label={t("explore.enroll")} className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a38] text-white transition group-hover:bg-blue-700">
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CourseGrid({ courses, isRtl, isStudent, wishlistIds, onToggleWishlist, dimmed }) {
  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${dimmed ? "opacity-70" : ""}`}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isRtl={isRtl}
          showWishlist={isStudent}
          isWishlisted={wishlistIds.has(course.id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}

export default function Explore() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const hero = useCatalogHero(
    "EXPLORE_HERO",
    {
      eyebrow: t("explore.eyebrow", { defaultValue: isRtl ? "مسارات تعليمية مصممة لـ Step 1" : "Learning paths built for Step 1" }),
      titlePrefix: t("explore.titlePrefix"),
      titleAccent: t("explore.titleAccent"),
      subtitle: t("explore.subtitle"),
      searchPlaceholder: t("explore.searchPlaceholder"),
      pillars: [
        { title: isRtl ? "فهم مترابط" : "Connected understanding", body: isRtl ? "شرح يربط العلوم الأساسية بالتطبيق السريري." : "Teaching that connects basic science to clinical reasoning." },
        { title: isRtl ? "مسارات منظمة" : "Structured paths", body: isRtl ? "محتوى مرتب حسب الأنظمة ومستوى التحضير." : "Content organized by systems and preparation stage." },
        { title: isRtl ? "تدريب عملي" : "Practice built in", body: isRtl ? "أسئلة وتمارين تدعم الاحتفاظ بالمعلومة." : "Questions and drills that reinforce retention." },
      ],
    },
    i18n.language
  );
  useSeo({
    title: t("explore.title", { defaultValue: "Courses" }),
    description: hero.subtitle || t("explore.subtitle", {
      defaultValue: "Browse Yaser USMLE courses and choose the right access option for your Step 1 preparation.",
    }),
    path: "/explore",
  });
  const user = useAuthStore((s) => s.user);
  const isStudent = normalizeRole(user?.role) === APP_ROLES.STUDENT;
  const { data: wishlist = [] } = useWishlist({ enabled: isStudent });
  const toggleWishlist = useToggleWishlist();
  const wishlistIds = useMemo(() => new Set(wishlist.map((w) => w.courseId || w.course?.id)), [wishlist]);

  const handleToggleWishlist = (courseId) => {
    if (!courseId) return;
    void toggleWishlist.mutateAsync({ courseId, isWishlisted: wishlistIds.has(courseId) });
  };

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeCategory]);

  const { data: categories = [], isLoading: categoriesLoading } = usePublicCategories();

  useEffect(() => {
    if (!categories.length) return;
    const stillValid = categories.some((cat) => cat.slug === activeCategory);
    if (!stillValid) setActiveCategory(categories[0].slug);
  }, [categories, activeCategory]);

  const { data, isLoading, isFetching } = usePublicCourses(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
      category: activeCategory || undefined,
    },
    { enabled: !!activeCategory }
  );
  const courses = data?.courses ?? [];
  const meta = data?.meta;

  const displayCourses = useMemo(() => {
    return courses.map((c) => ({
      ...c,
      categoryLabel: categoryLabel(c.category, isRtl),
      instructorName: c.instructor?.fullName || t("explore.instructorFallback"),
    }));
  }, [courses, t, isRtl]);

  const categoryTabs = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.slug,
        label: categoryLabel(cat, isRtl),
        icon: cat.icon || "Folder",
        count: cat.courseCount,
        description: isRtl ? cat.descriptionAr || cat.description : cat.description || cat.descriptionAr,
      })),
    [categories, isRtl]
  );

  const sorted = useMemo(() => {
    const list = [...displayCourses];
    if (sortBy === "price-low") {
      list.sort((a, b) => (coursePrice(a) ?? Infinity) - (coursePrice(b) ?? Infinity));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (coursePrice(b) ?? -1) - (coursePrice(a) ?? -1));
    } else {
      list.sort((a, b) => Number(b._count?.purchases ?? 0) - Number(a._count?.purchases ?? 0));
    }
    return list;
  }, [displayCourses, sortBy]);

  const activeTab = categoryTabs.find((tab) => tab.id === activeCategory);
  const defaultCategorySlug = categories[0]?.slug || "";
  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  return (
    <div className="min-h-screen bg-[#f4f8fd] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-24 pt-16 text-white md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -start-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "64px 64px" }} aria-hidden />

        <div className="relative mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {hero.eyebrow}
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.7rem]">
                {hero.titlePrefix}{" "}
                <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{hero.titleAccent}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base">
                {hero.subtitle}
              </p>

              <div className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[.08] p-2 shadow-2xl backdrop-blur-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" aria-hidden />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={hero.searchPlaceholder || t("explore.searchPlaceholder")}
                    className="h-14 w-full rounded-xl border-0 bg-white pe-5 ps-12 text-sm font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {hero.pillars.slice(0, 3).map((pillar, i) => {
                const Icon = [Brain, BookOpen, ClipboardCheck][i % 3];
                return (
                  <div key={pillar.key || pillar.title || i} className="flex items-center gap-4 rounded-[1.35rem] border border-white/10 bg-white/[.055] p-4 backdrop-blur-sm">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-300 text-[#071a38]"><Icon className="h-5 w-5" aria-hidden /></span>
                    <div><p className="text-sm font-black">{pillar.title}</p><p className="mt-1 text-[11px] font-medium leading-5 text-slate-400">{pillar.body}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-10 max-w-[1320px] px-4 md:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,.10)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">
                {t("explore.filterByCategory", { defaultValue: isRtl ? "تصفية حسب التصنيف" : "Filter by category" })}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {t("explore.filterHint", {
                  defaultValue: isRtl ? "اختر تصنيفاً لعرض الدورات الخاصة به." : "Pick a category to see its courses.",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    if (defaultCategorySlug) setActiveCategory(defaultCategorySlug);
                    setPage(1);
                  }}
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-500 transition hover:text-blue-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  {t("explore.clearFilters")}
                </button>
              ) : null}
              <div className="relative min-w-0 sm:w-52">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pe-10 ps-4 text-xs font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="popular">{t("explore.sort.popular")}</option>
                  <option value="price-low">{t("explore.sort.priceLow")}</option>
                  <option value="price-high">{t("explore.sort.priceHigh")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categoriesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-11 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100" />
              ))
            ) : (
              categoryTabs.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition ${
                      isActive
                        ? "bg-[#071a38] text-white shadow-md"
                        : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <CategoryGlyph name={tab.icon} className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          isActive ? "bg-white/15 text-cyan-100" : "bg-white text-slate-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mb-6 mt-10 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-700">{isRtl ? "كتالوج Yaser USMLE" : "YASER USMLE CATALOG"}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {activeTab?.label || (isRtl ? "دورات التصنيف" : "Category courses")}
            </h2>
            {activeTab?.description ? (
              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">{activeTab.description}</p>
            ) : null}
          </div>
          <p className="text-xs font-bold text-slate-500">
            {t("explore.showingPaged", { count: sorted.length, total: meta?.total ?? sorted.length, page: meta?.page ?? page })}
          </p>
        </div>

        {isLoading || !activeCategory ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)}
          </div>
        ) : sorted.length > 0 ? (
          <>
            <CourseGrid
              courses={sorted}
              isRtl={isRtl}
              isStudent={isStudent}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              dimmed={isFetching}
            />

            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
              <p className="px-2 text-sm font-bold text-slate-500">{t("explore.pagination.page", { page, totalPages })}</p>
              <div className="flex w-full gap-2 sm:w-auto">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-40 sm:flex-none">
                  {t("explore.pagination.prev")}
                </button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="flex-1 rounded-xl bg-[#071a38] px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-40 sm:flex-none">
                  {t("explore.pagination.next")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-96 flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><SlidersHorizontal className="h-7 w-7" aria-hidden /></span>
            <p className="mt-5 text-lg font-black text-slate-700">{t("explore.noResults")}</p>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                if (defaultCategorySlug) setActiveCategory(defaultCategorySlug);
                setPage(1);
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-blue-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />{t("explore.clearFilters")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
