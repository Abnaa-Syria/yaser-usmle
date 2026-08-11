import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, BookOpen, TrendingUp, User } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import EmptyState from "../components/dashboard/EmptyState";
import { useMyCourses } from "../features/student/courses/hooks";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

export default function MyClasses() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { data: rows = [], isLoading, isError, refetch } = useMyCourses();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: isAr ? "لوحة الطالب" : "Student panel" })}
        title={
          <>
            {t("myCohorts.titlePrefix")}{" "}
            <span className="text-[var(--yu-blue-700)]">{t("myCohorts.titleAccent")}</span>
          </>
        }
        subtitle={t("myCohorts.subtitle")}
        actions={
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition hover:bg-[var(--yu-blue-600)]"
          >
            {t("student.overview.exploreCta", { defaultValue: isAr ? "استكشف الكورسات" : "Explore courses" })}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-[1.35rem] bg-white/70 dark:bg-white/5" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <EmptyState
          title={t("myCohorts.loadError")}
          message={t("takeExam.retry", { defaultValue: "Retry" })}
          icon={BookOpen}
          action={
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white"
            >
              {t("takeExam.retry", { defaultValue: "Retry" })}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState
          title={t("myCohorts.empty")}
          message={t("student.overview.noCourses", { defaultValue: isAr ? "سجّل في كورس لتبدأ التعلم." : "Enroll in a course to start learning." })}
          icon={BookOpen}
          action={
            <Link
              to="/explore"
              className="inline-flex rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white"
            >
              {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
            </Link>
          }
        />
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => {
            const progress = Math.round(Number(c.progressPercentage || 0));
            return (
              <article
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:border-[var(--yu-blue-200)] hover:shadow-[var(--shadow-md)] dark:border-white/8 dark:bg-[#0F1E38]"
              >
                <div className="relative h-40 overflow-hidden bg-[linear-gradient(145deg,#0F2448,#1B4FBF)]">
                  {resolveMediaUrl(c.thumbnail) ? (
                    <img
                      src={resolveMediaUrl(c.thumbnail)}
                      alt=""
                      className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white/35" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/55 to-transparent" />
                  <span className="absolute start-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-[#0F1E38]/95 dark:text-slate-200">
                    {t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                  </span>
                  <span className="absolute bottom-3 end-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-black text-[var(--yu-blue-800)] shadow-sm">
                    {progress}%
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">{c.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {c.instructor?.fullName || "—"}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-[var(--yu-blue-700)]" />
                        {t("myCohorts.progress")}
                      </span>
                      <span className="tabular-nums text-slate-700 dark:text-slate-200">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--yu-blue-700),var(--yu-blue-500))]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-auto pt-5">
                    <Link
                      to={`/student/courses/${c.id}/learn`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] py-3 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
                    >
                      {t("myCohorts.continue")}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
