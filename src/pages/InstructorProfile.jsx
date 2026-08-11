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
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <GraduationCap className="h-7 w-7" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-bold">
          {t("publicInstructors.profileNotFound", { defaultValue: "Instructor not found." })}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-xl bg-[var(--yu-blue-700)] px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-orange-600 transition"
        >
          {t("takeExam.retry")}
        </button>
        <div className="pt-2">
          <Link to={showCatalogBack ? "/instructors" : "/"} className="text-sm text-slate-650 hover:underline">
            {showCatalogBack
              ? t("publicInstructors.backToList", { defaultValue: "All Instructors" })
              : t("header.nav.home", { defaultValue: isRtl ? "الرئيسية" : "Home" })}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 dark:bg-[#0F0F13] pb-20">
      <section className="relative overflow-hidden bg-slate-900 px-4 py-16 text-white md:px-6 lg:py-20">
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="profile-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#profile-grid)" />
          </svg>
        </div>
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[var(--yu-blue-700)]/10 blur-3xl" />
        <div className="absolute right-12 bottom-0 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            to={showCatalogBack ? "/instructors" : "/"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {showCatalogBack
              ? t("publicInstructors.backToList", { defaultValue: "All Instructors" })
              : t("header.nav.home", { defaultValue: isRtl ? "الرئيسية" : "Home" })}
          </Link>

          <div className="mt-8 flex flex-col items-center gap-6 text-center md:flex-row md:text-start">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-800 ring-4 ring-[var(--yu-blue-700)]/30 shadow-2xl">
              {resolveMediaUrl(instructor.avatar) ? (
                <img src={resolveMediaUrl(instructor.avatar)} alt={instructor.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600">
                  <GraduationCap className="h-9 w-9 opacity-80 mb-1" />
                  <span className="text-2xl font-black tracking-wider text-white">{initials(instructor.fullName)}</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-0.5 text-xs font-bold text-[var(--yu-blue-700)]">
                  {isRtl ? "المحاضر الرئيسي" : "Lead instructor"}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{instructor.fullName}</h1>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300 md:justify-start">
                {rating ? (
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {rating}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      ({reviews.length} {isRtl ? "تقييم" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400 text-xs">
                    <Star className="h-4 w-4" />
                    {isRtl ? "لا توجد تقييمات بعد" : "No reviews yet"}
                  </span>
                )}

                {instructor.experience != null && instructor.experience > 0 && (
                  <span className="flex items-center gap-1.5 border-s border-slate-700 ps-4">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    {t("publicInstructors.yearsExp", {
                      n: instructor.experience,
                      defaultValue: `${instructor.experience}+ Years Experience`,
                    })}
                  </span>
                )}

                <span className="flex items-center gap-1.5 border-s border-slate-700 ps-4">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  {courses.length} {courses.length === 1 ? (isRtl ? "كورس" : "Course") : isRtl ? "كورسات" : "Courses"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-[var(--yu-blue-700)]" />
              {isRtl ? "النبذة التعريفية" : "About the Instructor"}
            </h2>
            <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-350 whitespace-pre-line">
              {instructor.bio?.trim() || t("publicInstructors.noBio", { defaultValue: "No bio available for this instructor." })}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--yu-blue-700)]" />
              {t("publicInstructors.coursesTitle", { defaultValue: "Courses Offered" })}
            </h2>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-450">
                {isRtl ? "لم يقم المحاضر بنشر أي دورات بعد." : "This instructor has not published any courses yet."}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((c) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition shadow-sm hover:border-[var(--yu-blue-700)]/30 hover:shadow-md dark:border-slate-800 dark:bg-[#1E293B]"
                  >
                    <div className="h-2 bg-gradient-to-r from-orange-400 to-[var(--yu-blue-700)] opacity-70 group-hover:opacity-100 transition" />
                    <div className="flex flex-1 flex-col p-5 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-850 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {isRtl ? "مسجل" : "Recorded"}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-850 dark:text-white text-sm line-clamp-2 group-hover:text-[var(--yu-blue-700)] transition flex-1">
                        {c.title}
                      </h3>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                        <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          {isRtl ? "استكشاف" : "Explore"}
                          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                        </span>
                        {c.price != null && (
                          <span className="font-black text-[var(--yu-blue-700)] text-sm">{formatSessionPrice(c.price, isRtl)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[var(--yu-blue-700)]" />
              {t("publicInstructors.reviewsTitle", { defaultValue: "Student Reviews & Ratings" })}
            </h2>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-450">
                {isRtl ? "لا توجد تقييمات لهذا المحاضر بعد." : "No student reviews available yet."}
              </div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-[#1E293B]/70 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20 text-[var(--yu-blue-700)] font-bold text-xs">
                          {initials(r.student?.fullName || "Student")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {r.student?.fullName || t("student.qna.anonymous", { defaultValue: "Student" })}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US") : ""}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {r.rating}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl">
                        {r.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {platformFeatures.privateBooking ? (
          <aside id="book" className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-[#1E293B]">
              <PrivateSessionRequestForm instructorId={instructor.id} instructorName={instructor.fullName} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
