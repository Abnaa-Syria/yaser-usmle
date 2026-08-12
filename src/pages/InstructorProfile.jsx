import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Star,
  GraduationCap,
  Briefcase,
  Award,
  ChevronRight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { formatSessionPrice } from "../components/student/PrivateSessionPayModal";
import PrivateSessionRequestForm from "../components/public/PrivateSessionRequestForm";
import { platformFeatures } from "../config/features";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";
import {
  usePublicInstructor,
  usePublicInstructorCourses,
} from "../features/public/instructors/hooks";

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function reviewName(review, t) {
  return (
    review?.displayName ||
    review?.student?.fullName ||
    t("student.qna.anonymous", { defaultValue: "Student" })
  );
}

export default function InstructorProfile() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const { id } = useParams();

  const { data: instructor, isLoading, isError, refetch } = usePublicInstructor(id);
  const { data: courses = [] } = usePublicInstructorCourses(id);

  const reviews = useMemo(() => instructor?.receivedReviews ?? [], [instructor]);
  const rating = instructor?.averageRating != null ? Number(instructor.averageRating).toFixed(1) : null;
  const showCatalogBack = platformFeatures.publicInstructorCatalog;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--yu-blue-700)]" />
        <span className="text-sm font-semibold">{t("dashboard.common.loading")}</span>
      </div>
    );
  }

  if (isError || !instructor) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <GraduationCap className="h-7 w-7" />
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200">
          {t("publicInstructors.profileNotFound", { defaultValue: "Doctor profile not found." })}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-xl bg-[var(--yu-blue-700)] px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[var(--yu-blue-600)]"
        >
          {t("takeExam.retry")}
        </button>
        <div className="pt-2">
          <Link to={showCatalogBack ? "/instructors" : "/"} className="text-sm text-slate-500 hover:underline">
            {showCatalogBack
              ? t("publicInstructors.backToList", { defaultValue: "All Instructors" })
              : t("header.nav.home", { defaultValue: isRtl ? "الرئيسية" : "Home" })}
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = resolveMediaUrl(instructor.avatar);

  return (
    <div className="bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_40%,#F1F5F9_100%)] pb-20 dark:bg-[#0F0F13]">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0A1628_0%,#153577_48%,#1B4FBF_100%)] px-4 py-14 text-white md:px-6 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(96,165,250,0.35), transparent 42%), radial-gradient(circle at 88% 12%, rgba(251,191,36,0.22), transparent 36%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl">
          <Link
            to={showCatalogBack ? "/instructors" : "/"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur-sm transition hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {showCatalogBack
              ? t("publicInstructors.backToList", { defaultValue: "All Instructors" })
              : t("header.nav.home", { defaultValue: isRtl ? "الرئيسية" : "Home" })}
          </Link>

          <div className="mt-8 flex flex-col items-center gap-6 text-center md:flex-row md:text-start">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] bg-slate-800 shadow-2xl ring-4 ring-white/15">
              {avatarUrl ? (
                <img src={avatarUrl} alt={instructor.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--yu-blue-600)] to-[var(--yu-blue-900)]">
                  <GraduationCap className="mb-1 h-9 w-9 opacity-80" />
                  <span className="text-2xl font-black tracking-wider text-white">{initials(instructor.fullName)}</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[var(--yu-amber-400)] backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isRtl ? "الدكتور" : "The Doctor"}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{instructor.fullName}</h1>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-blue-100/90 md:justify-start">
                {rating ? (
                  <span className="flex items-center gap-1 font-bold text-[var(--yu-amber-400)]">
                    <Star className="h-4 w-4 fill-[var(--yu-amber-400)] text-[var(--yu-amber-400)]" />
                    {rating}{" "}
                    <span className="text-xs font-normal text-blue-100/70">
                      ({reviews.length} {isRtl ? "تقييم" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-blue-100/70">
                    <Star className="h-4 w-4" />
                    {isRtl ? "لا توجد تقييمات بعد" : "No reviews yet"}
                  </span>
                )}

                {instructor.experience != null && instructor.experience > 0 ? (
                  <span className="flex items-center gap-1.5 border-s border-white/15 ps-4">
                    <Briefcase className="h-4 w-4 text-blue-200/80" />
                    {t("publicInstructors.yearsExp", {
                      n: instructor.experience,
                      defaultValue: `${instructor.experience}+ years experience`,
                    })}
                  </span>
                ) : null}

                <span className="flex items-center gap-1.5 border-s border-white/15 ps-4">
                  <BookOpen className="h-4 w-4 text-blue-200/80" />
                  {courses.length} {courses.length === 1 ? (isRtl ? "كورس" : "Course") : isRtl ? "كورسات" : "Courses"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="space-y-4 rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <Award className="h-5 w-5 text-[var(--yu-blue-700)]" />
              {isRtl ? "النبذة التعريفية" : "About the Doctor"}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {instructor.bio?.trim() ||
                t("publicInstructors.noBio", { defaultValue: "No bio available for this doctor yet." })}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-[var(--yu-blue-700)]" />
              {t("publicInstructors.coursesTitle", { defaultValue: isRtl ? "كورسات هذا الدكتور" : "Courses by this doctor" })}
            </h2>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-white/10">
                {isRtl ? "لا توجد كورسات منشورة بعد." : "No published courses yet."}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((c) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="group flex flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--yu-blue-700)]/30 hover:shadow-md dark:border-white/8 dark:bg-[#0F1E38]"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-[var(--yu-blue-700)] to-[var(--yu-amber-400)] opacity-80 transition group-hover:opacity-100" />
                    <div className="flex flex-1 flex-col space-y-3 p-5">
                      <span className="w-fit rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                        {isRtl ? "مسجل" : "Recorded"}
                      </span>
                      <h3 className="line-clamp-2 flex-1 text-sm font-bold text-slate-850 transition group-hover:text-[var(--yu-blue-700)] dark:text-white">
                        {isRtl ? c.titleAr || c.title : c.title}
                      </h3>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-white/8">
                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                          {t("header.nav.explore", { defaultValue: isRtl ? "الكورسات" : "Courses" })}
                          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                        </span>
                        {c.price != null ? (
                          <span className="text-sm font-black text-[var(--yu-blue-700)]">
                            {formatSessionPrice(c.price, isRtl)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <UserCheck className="h-5 w-5 text-[var(--yu-blue-700)]" />
              {t("publicInstructors.reviewsTitle", { defaultValue: isRtl ? "تقييمات الطلاب" : "Student reviews" })}
            </h2>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-white/10">
                {isRtl ? "لا توجد تقييمات بعد." : "No reviews yet."}
              </div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="space-y-3 rounded-[1.35rem] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--yu-blue-700)]/10 text-xs font-bold text-[var(--yu-blue-700)]">
                          {initials(reviewName(r, t))}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{reviewName(r, t)}</p>
                          <p className="text-[10px] text-slate-400">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US") : ""}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {r.rating}
                      </span>
                    </div>
                    {r.comment ? (
                      <p className="rounded-xl bg-slate-50/80 p-3 text-xs leading-relaxed text-slate-600 dark:bg-white/5 dark:text-slate-300">
                        {r.comment}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {platformFeatures.privateBooking ? (
          <aside id="book" className="lg:col-span-1">
            <div className="sticky top-24 rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-brand)] dark:border-white/8 dark:bg-[#0F1E38]">
              <PrivateSessionRequestForm instructorId={instructor.id} instructorName={instructor.fullName} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
