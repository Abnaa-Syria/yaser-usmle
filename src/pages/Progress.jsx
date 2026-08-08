import { useTranslation } from "react-i18next";
import { BookOpen, CheckCircle2, Star, TrendingUp, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../api/error";
import PageHeader from "../components/dashboard/PageHeader";
import EmptyState from "../components/dashboard/EmptyState";
import { StudentSurface, StudentStat, StudentBadge } from "../components/student/ui";
import { useMyCourses } from "../features/student/courses/hooks";
import { useNotifications } from "../features/student/notifications/hooks";
import { fetchCourseProgressStats } from "../features/student/progress/api";

function courseKey(course) {
  return course.courseId ?? course.id;
}

function CourseProgress({ course }) {
  const { t } = useTranslation();
  const done = course.progress === 100;
  return (
    <StudentSurface>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{course.name}</h3>
          <p className="mt-0.5 text-xs font-semibold text-[var(--yu-blue-700)]">{course.teacher}</p>
        </div>
        {done ? <StudentBadge tone="emerald">{t("progress.completed")}</StudentBadge> : null}
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {course.lessons}/{course.total} {t("progress.lessons")}
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{course.progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-700 ${course.colour}`}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>
    </StudentSurface>
  );
}

export default function Progress() {
  const { t } = useTranslation();
  const { data: myCourses = [], isLoading, isError, error, refetch } = useMyCourses();
  const { data: notifications = [] } = useNotifications();

  const { data: progressStats = [] } = useQuery({
    queryKey: ["student", "progress", "courses", myCourses.map((c) => courseKey(c)).join(",")],
    enabled: myCourses.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        myCourses.map(async (course) => {
          const courseId = courseKey(course);
          if (!courseId) {
            return {
              courseId: "",
              completedLessons: 0,
              totalLessons: 0,
              percentage: 0,
              isCourseCompleted: false,
            };
          }
          try {
            const stat = await fetchCourseProgressStats(courseId);
            return {
              courseId,
              completedLessons: Number(stat?.completedLessons) || 0,
              totalLessons: Number(stat?.totalLessons) || 0,
              percentage: Number(stat?.percentage) || 0,
              isCourseCompleted: Boolean(stat?.isCourseCompleted),
            };
          } catch {
            return {
              courseId,
              completedLessons: Number(course.completedLessonsCount) || 0,
              totalLessons: 0,
              percentage: Number(course.progressPercentage) || 0,
              isCourseCompleted: Boolean(course.isCompleted),
            };
          }
        })
      );
      return results;
    },
    retry: false,
  });

  const courses = myCourses.map((course, idx) => {
    const id = courseKey(course);
    const stat = progressStats.find((s) => s.courseId === id) || {};
    const palette = ["bg-[var(--yu-blue-700)]", "bg-[var(--yu-blue-500)]", "bg-emerald-500", "bg-[var(--yu-blue-600)]"];
    const pct = Math.round(Number(stat.percentage ?? course.progressPercentage ?? 0));
    const completed = Number(stat.completedLessons ?? course.completedLessonsCount ?? 0);
    const total = Number(stat.totalLessons) || Math.max(completed, 1);
    return {
      key: id ?? String(idx),
      courseId: id,
      name: course.title,
      teacher: course?.instructor?.fullName || "Instructor",
      progress: pct,
      lessons: completed,
      total,
      isCourseCompleted: Boolean(stat.isCourseCompleted ?? course.isCompleted),
      colour: palette[idx % palette.length],
    };
  });

  const avgScore = courses.length ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0;
  const completedCourses = courses.filter((c) => c.isCourseCompleted).length;
  const lessonsCompleted = courses.reduce((acc, c) => acc + c.lessons, 0);

  const activity = (Array.isArray(notifications) ? notifications : []).slice(0, 5).map((n) => ({
    key: n.id,
    type: String(n.type || "alert").toLowerCase(),
    text: n.message ? `${n.title} — ${n.message}` : n.title,
    date: n.createdAt ? new Date(n.createdAt).toLocaleString() : "—",
  }));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={
          <>
            {t("progress.titlePrefix")}{" "}
            <span className="text-[var(--yu-blue-700)]">{t("progress.titleAccent")}</span>
          </>
        }
        subtitle={t("progress.subtitle")}
      />

      {isError ? (
        <EmptyState
          title={t("progress.loadError", { defaultValue: "Could not load progress" })}
          message={getErrorMessage(error, "Could not load your progress.")}
          icon={TrendingUp}
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

      {!isError ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StudentStat label={t("progress.stats.coursesEnrolled")} value={myCourses.length} icon={BookOpen} tone="blue" />
            <StudentStat label={t("progress.stats.lessonsCompleted")} value={lessonsCompleted} icon={Video} tone="blue" />
            <StudentStat label={t("progress.stats.coursesCompleted")} value={completedCourses} icon={CheckCircle2} tone="emerald" />
            <StudentStat label={t("progress.stats.avgScore")} value={`${avgScore}%`} icon={Star} tone="amber" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                {t("progress.myCourses")}
                <TrendingUp className="h-4 w-4 text-[var(--yu-blue-700)]" />
              </h2>
              {isLoading ? (
                <StudentSurface>
                  <p className="text-sm text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
                </StudentSurface>
              ) : courses.length === 0 ? (
                <EmptyState
                  title={t("progress.noCourses", { defaultValue: "No courses yet" })}
                  message={t("progress.noCourses", { defaultValue: "Enroll in a course to see progress here." })}
                  icon={BookOpen}
                />
              ) : (
                courses.map((c) => <CourseProgress key={c.key} course={c} />)
              )}
            </div>

            <div>
              <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">{t("progress.recentActivity")}</h2>
              <StudentSurface padded={false}>
                {activity.length ? (
                  activity.map((a, i) => (
                    <div
                      key={a.key}
                      className={`flex items-start gap-3 px-4 py-3.5 ${i < activity.length - 1 ? "border-b border-slate-100 dark:border-white/8" : ""}`}
                    >
                      <StudentBadge tone="blue">{a.type}</StudentBadge>
                      <div>
                        <p className="text-xs font-medium leading-snug text-slate-700 dark:text-slate-200">{a.text}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{a.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t("progress.noActivity", { defaultValue: "No recent activity yet." })}
                  </p>
                )}
              </StudentSurface>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
