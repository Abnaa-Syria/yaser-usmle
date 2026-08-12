import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/error";
import { postStudentCourseCheckout } from "../features/student/financials/api";
import SocialShare from "../components/SocialShare";
import {
  BookOpen,
  Headphones,
  ChevronRight,
  FileText,
  Globe,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { usePublicCourse } from "../features/public/hooks";
import { useMyCourses } from "../features/student/courses/hooks";
import { fetchCourseReviews, computeAverageRating } from "../features/student/reviews/api";
import PublicCourseCurriculum from "../components/public/PublicCourseCurriculum";
import { absoluteUrl, useSeo } from "../utils/seo";
import { platformFeatures } from "../config/features";
import { sanitizeRichHtml } from "../utils/htmlContent";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

function Stars({ rating, max = 5, size = "h-4 w-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${size} text-slate-200`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} fill-amber-400 text-amber-400`} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatPrice(price) {
  const value = Math.round(Number(price) || 0);
  return `${value} USD`;
}

const INCLUSION_ICONS = [BookOpen, FileText, Headphones, Globe, ShieldCheck];
const FALLBACK_INCLUSION_KEYS = ["videoHours", "downloadable", "instructorSupport", "fullLifetime", "guarantee"];

export default function CourseDetails() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { id } = useParams();

  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);
  const isStudent = role === APP_ROLES.STUDENT;

  const [selectedTierId, setSelectedTierId] = useState("");
  const [enrollingFree, setEnrollingFree] = useState(false);
  const queryClient = useQueryClient();

  const { data: course, isLoading, isError, refetch } = usePublicCourse(id);

  const { data: reviewsData } = useQuery({
    queryKey: ["public", "course-reviews", id],
    queryFn: () => fetchCourseReviews(id, 1, 50),
    enabled: Boolean(id),
    retry: false,
  });

  const reviewStats = useMemo(() => {
    const reviews = reviewsData?.reviews ?? [];
    return computeAverageRating(reviews);
  }, [reviewsData]);

  const { data: myCourses = [], isLoading: enrollmentsLoading } = useMyCourses({
    enabled: Boolean(hydrated && isAuth && isStudent),
  });

  const enrolledCourseIds = useMemo(() => {
    const set = new Set();
    for (const row of myCourses) {
      if (row?.id) set.add(row.id);
      if (row?.courseId) set.add(row.courseId);
    }
    return set;
  }, [myCourses]);

  const isEnrolled = Boolean(isStudent && course?.id && enrolledCourseIds.has(course.id));
  const showAuthHydrating = Boolean(course?.id && !hydrated);
  const showEnrollmentSpinner = Boolean(course?.id && hydrated && isAuth && isStudent && enrollmentsLoading);

  const coursePath = course?.id ? `/courses/${course.id}` : `/courses/${id ?? ""}`;
  const displayTitle = course ? (isRtl ? course.titleAr || course.title : course.title) : "";
  const seoTitle = course ? displayTitle : t("courses.detailTitle", { defaultValue: "Course details" });
  const seoDescription = course
    ? (isRtl
        ? course.shortDescriptionAr || course.descriptionAr || course.description
        : course.shortDescription || course.description) ||
      t("courses.detailDescription", { defaultValue: "Explore Yaser USMLE course content, access options, and learning resources." })
    : t("courses.detailDescription", { defaultValue: "Explore Yaser USMLE course content, access options, and learning resources." });

  const loginHref = useMemo(() => {
    const redirect = encodeURIComponent(coursePath);
    return `/login?redirect=${redirect}`;
  }, [coursePath]);

  const pricingTiers = course?.pricingTiers || [];

  useEffect(() => {
    if (pricingTiers.length > 0 && !selectedTierId) {
      setSelectedTierId(pricingTiers[0].id);
    }
  }, [pricingTiers, selectedTierId]);

  const selectedTier = useMemo(() => pricingTiers.find((tier) => tier.id === selectedTierId), [pricingTiers, selectedTierId]);

  const hasPricingTiers = pricingTiers.length > 0;

  // Base course.price is always sellable when there are no tiers.
  // With tiers, base price only applies if lifetime purchase is enabled.
  const displayPrice = useMemo(() => {
    if (selectedTier) return Number(selectedTier.price);
    if (!course) return null;
    const base = Number(course.price);
    if (!Number.isFinite(base)) return null;
    if (!hasPricingTiers) return base;
    if (course.isLifetimePurchasable) return base;
    return null;
  }, [course, selectedTier, hasPricingTiers]);

  const canBuyWithBasePrice = Boolean(
    course && !hasPricingTiers
      ? Number.isFinite(Number(course.price))
      : course?.isLifetimePurchasable && Number.isFinite(Number(course.price))
  );

  useSeo({
    title: seoTitle,
    description: seoDescription,
    path: coursePath,
    image: resolveMediaUrl(course?.coverImage || course?.thumbnail) || undefined,
    jsonLd: course
      ? {
          "@context": "https://schema.org",
          "@type": "Course",
          name: seoTitle,
          description: seoDescription,
          url: absoluteUrl(coursePath),
          provider: {
            "@type": "EducationalOrganization",
            name: "Yaser USMLE",
            sameAs: absoluteUrl("/"),
          },
          offers:
            displayPrice !== null
              ? {
                  "@type": "Offer",
                  price: Number(displayPrice || 0),
                  priceCurrency: selectedTier?.currency || "USD",
                }
              : undefined,
        }
      : undefined,
  });

  const checkoutHref = useMemo(() => {
    if (!course?.id) return "/student/checkout";
    let url = `/student/checkout?courseId=${encodeURIComponent(course.id)}`;
    if (selectedTierId) url += `&pricingTierId=${encodeURIComponent(selectedTierId)}`;
    return url;
  }, [course, selectedTierId]);

  const continueLearningHref = course?.id ? `/student/courses/${course.id}/learn` : "/student/classes";

  const handleFreeEnroll = async () => {
    if (!course?.id) return;
    setEnrollingFree(true);
    try {
      const payload = {
        paymentMethod: "FREE",
        receiptUrl: "INSTANT_FREE_ENROLLMENT",
        amount: 0,
      };
      if (selectedTierId) payload.pricingTierId = selectedTierId;
      await postStudentCourseCheckout(course.id, payload);
      toast.success(isRtl ? "تم الاشتراك في الكورس بنجاح!" : "Enrolled in course successfully!");
      void queryClient.invalidateQueries({ queryKey: ["student", "courses"] });
      window.location.href = continueLearningHref;
    } catch (e) {
      toast.error(getErrorMessage(e, isRtl ? "فشل التسجيل في الكورس" : "Failed to enroll in course."));
    } finally {
      setEnrollingFree(false);
    }
  };

  const instructorForCard = course?.instructor;
  const displayRating = reviewStats.count > 0 ? Math.round(reviewStats.average * 10) / 10 : 0;
  const reviewCount = reviewStats.count;
  const purchaseCount = course?._count?.purchases ?? 0;

  const inclusionItems = useMemo(() => {
    const fromDb = isRtl ? course?.includesAr : course?.includesEn;
    if (Array.isArray(fromDb) && fromDb.length) {
      return fromDb.map((text, idx) => ({
        key: `db-${idx}`,
        text: String(text),
        Icon: INCLUSION_ICONS[idx % INCLUSION_ICONS.length],
      }));
    }
    return FALLBACK_INCLUSION_KEYS.map((key, idx) => ({
      key,
      text: t(`courseDetails.inclusions.${key}`),
      Icon: INCLUSION_ICONS[idx % INCLUSION_ICONS.length],
    }));
  }, [course?.includesAr, course?.includesEn, isRtl, t]);

  const bodyHtml = isRtl
    ? course?.descriptionAr || course?.description
    : course?.description || course?.descriptionAr;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center text-slate-600">
        {t("courseDetails.loading", { defaultValue: "Loading course…" })}
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <p className="text-red-600">{t("courseDetails.loadError", { defaultValue: "Course not found." })}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 text-[var(--yu-blue-700)] hover:underline">
          {t("courseDetails.retry", { defaultValue: "Retry" })}
        </button>
        <div className="mt-6">
          <Link to="/explore" className="text-sm font-semibold text-[var(--yu-blue-700)]">
            {t("courseDetails.breadcrumb.explore")}
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = resolveMediaUrl(instructorForCard?.avatar);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_38%,#F1F5F9_100%)] pb-16">
      <section className="relative overflow-hidden border-b border-[var(--yu-blue-800)]/15 bg-[linear-gradient(135deg,#0A1628_0%,#153577_52%,#1B4FBF_100%)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 14% 20%, rgba(96,165,250,0.35), transparent 42%), radial-gradient(circle at 88% 18%, rgba(251,191,36,0.2), transparent 36%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14 lg:px-8">
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-blue-100/80">
            <Link to="/explore" className="transition hover:text-white">
              {t("courseDetails.breadcrumb.explore")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <span className="max-w-xs truncate font-medium text-white">{displayTitle}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div className="space-y-4">
              {course.category?.name ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-100 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--yu-amber-400)]" />
                  {isRtl ? course.category.nameAr || course.category.name : course.category.name}
                </span>
              ) : null}
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.75rem]">{displayTitle}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100/90">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
                  {t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {purchaseCount} {t("courseDetails.students")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {reviewCount > 0 ? (
                    <>
                      <Stars rating={displayRating} />
                      <span className="font-bold text-[var(--yu-amber-400)]">{displayRating}</span>
                      <span className="text-blue-100/70">
                        ({reviewCount} {t("courseDetails.reviews")})
                      </span>
                    </>
                  ) : (
                    <span>{t("courseDetails.noReviewsYet", { defaultValue: "No reviews yet" })}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[var(--shadow-brand)] backdrop-blur-md">
              <div className="relative" style={{ paddingTop: "56.25%" }}>
                {resolveMediaUrl(course.thumbnail || course.coverImage) ? (
                  <img
                    src={resolveMediaUrl(course.thumbnail || course.coverImage)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--yu-blue-900)] to-[var(--yu-blue-600)]" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[var(--yu-blue-800)] shadow-lg">
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                </div>
                <span className="absolute end-3 top-3 rounded-lg bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                  {t("courseDetails.card.previewVideo")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <main className="space-y-8 lg:col-span-2">
            <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-sm)] md:p-8">
              {bodyHtml ? (
                <div
                  className="course-rich-html space-y-3 text-base leading-relaxed text-slate-600 [&_a]:font-semibold [&_a]:text-[var(--yu-blue-700)] [&_a]:underline [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_p]:mb-2 [&_strong]:text-slate-800"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(bodyHtml) }}
                />
              ) : (
                <p className="text-base leading-relaxed text-slate-500">—</p>
              )}
            </section>

            <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-sm)] md:p-8">
              <h2 className="mb-4 text-xl font-black text-slate-900">{t("courseDetails.curriculum.title")}</h2>
              <PublicCourseCurriculum units={course.units ?? []} exams={course.exams ?? []} />
            </section>

            {instructorForCard ? (
              <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-sm)] md:p-8">
                <h2 className="mb-5 text-xl font-black text-slate-900">{t("courseDetails.instructor.title")}</h2>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--yu-blue-700)] text-xl font-extrabold text-white shadow-lg ring-4 ring-[var(--yu-blue-700)]/15">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={instructorForCard.fullName} className="h-full w-full object-cover" />
                    ) : (
                      initials(instructorForCard.fullName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black text-slate-900">{instructorForCard.fullName}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                      {instructorForCard.bio || t("courseDetails.instructor.noBio", { defaultValue: "Bio coming soon." })}
                    </p>
                    {instructorForCard.id ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {platformFeatures.publicInstructorCatalog || platformFeatures.privateBooking ? (
                          <Link
                            to={`/instructors/${instructorForCard.id}`}
                            className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[var(--yu-blue-700)] hover:text-[var(--yu-blue-700)]"
                          >
                            {t("courseDetails.instructor.viewProfile", { defaultValue: "View profile" })}
                          </Link>
                        ) : null}
                        {platformFeatures.privateBooking ? (
                          <Link
                            to={`/instructors/${instructorForCard.id}#book`}
                            className="inline-flex items-center rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
                          >
                            {t("courseDetails.instructor.bookSession", {
                              defaultValue: isRtl ? "طلب جلسة فردية" : "Request a private session",
                            })}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[var(--shadow-brand)]">
              <div className="space-y-5 p-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t("courseDetails.card.priceLabel", { defaultValue: "Course price" })}
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">
                    {displayPrice != null ? formatPrice(displayPrice) : "—"}
                  </p>
                </div>

                {pricingTiers.length > 0 ? (
                  <div className="space-y-2">
                    {pricingTiers.map((tier) => {
                      const label = isRtl ? tier.nameAr || tier.name : tier.name;
                      const active = selectedTierId === tier.id;
                      return (
                        <label
                          key={tier.id}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${
                            active
                              ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/5"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="pricingTier"
                              checked={active}
                              onChange={() => setSelectedTierId(tier.id)}
                              className="accent-[var(--yu-blue-700)]"
                            />
                            {label}
                          </span>
                          <span className="font-black tabular-nums text-slate-900">{formatPrice(tier.price)}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {showAuthHydrating || showEnrollmentSpinner ? (
                  <button type="button" disabled className="w-full rounded-xl bg-slate-200 py-3 text-sm font-bold text-slate-500">
                    {t("courseDetails.card.checkingEnrollment")}
                  </button>
                ) : isEnrolled ? (
                  <Link
                    to={continueLearningHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("courseDetails.card.continueLearning")}
                  </Link>
                ) : !isAuth ? (
                  <Link
                    to={loginHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
                  >
                    {t("courseDetails.card.logInToEnroll")}
                  </Link>
                ) : displayPrice === 0 ? (
                  <button
                    type="button"
                    disabled={enrollingFree}
                    onClick={handleFreeEnroll}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <BookOpen className="h-4 w-4" />
                    {enrollingFree ? t("dashboard.common.loading") : isRtl ? "سجل مجاناً الآن" : "Enroll Instantly for Free"}
                  </button>
                ) : canBuyWithBasePrice || selectedTierId ? (
                  <Link
                    to={checkoutHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("courseDetails.card.enrollWithPrice", {
                      price: displayPrice != null ? formatPrice(displayPrice) : "—",
                    })}
                  </Link>
                ) : null}

                <p className="text-center text-xs text-slate-400">{t("courseDetails.card.guarantee")}</p>

                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-3 text-sm font-black text-slate-800">{t("courseDetails.card.includes")}</p>
                  <ul className="space-y-2.5">
                    {inclusionItems.map(({ Icon, key, text }) => (
                      <li key={key} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--yu-blue-700)]" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <SocialShare url={window.location.href} title={displayTitle} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
