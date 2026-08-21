import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, Clock3, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/dashboard/PageHeader";
import BackToLessonBanner from "../components/student/BackToLessonBanner";
import { useStudentExams } from "../features/student/exams/hooks";
import { useTrialExams } from "../features/trial/hooks";
import { useLearningPanelMode } from "../hooks/useLearningPanelMode";

const STATUS_MAP = {
  UPCOMING: { label: "exams.status.upcoming", style: "bg-yu-blue-100 text-yu-blue-500-dark" },
  AVAILABLE: { label: "exams.status.available", style: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300" },
  COMPLETED: { label: "exams.status.completed", style: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" },
  EXPIRED: { label: "exams.status.expired", style: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400" },
};

function courseLabel(exam) {
  return exam.course?.title || exam.unit?.course?.title || exam.lesson?.section?.unit?.course?.title || exam.unit?.title || "—";
}

function examTypeLabelKey(type) {
  const k = String(type || "STANDALONE").toUpperCase();
  if (["FINAL", "UNIT", "LESSON", "STANDALONE"].includes(k)) return `exams.type.${k}`;
  return "exams.type.STANDALONE";
}

export default function Exams() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const { isTrial, examsBase } = useLearningPanelMode();
  const courseId = searchParams.get("courseId") || undefined;
  const lessonId = searchParams.get("lessonId") || undefined;
  const unitId = searchParams.get("unitId") || undefined;
  const examFilters = useMemo(
    () => ({ ...(courseId ? { courseId } : {}), ...(lessonId ? { lessonId } : {}), ...(unitId ? { unitId } : {}) }),
    [courseId, lessonId, unitId]
  );
  const studentQuery = useStudentExams(examFilters, { enabled: !isTrial });
  const trialQuery = useTrialExams(examFilters, { enabled: isTrial });
  const { data: exams = [], isLoading, isError, refetch } = isTrial ? trialQuery : studentQuery;
  const lessonReturnQs = useMemo(() => {
    const p = new URLSearchParams();
    if (courseId) p.set("courseId", courseId);
    if (lessonId) p.set("lessonId", lessonId);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [courseId, lessonId]);
  const lessonReturnQsWithAutostart = useMemo(() => {
    const p = new URLSearchParams({ autostart: "1" });
    if (courseId) p.set("courseId", courseId);
    if (lessonId) p.set("lessonId", lessonId);
    return `?${p.toString()}`;
  }, [courseId, lessonId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return exams;
    return exams.filter((e) => (e.title || "").toLowerCase().includes(s) || courseLabel(e).toLowerCase().includes(s));
  }, [exams, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={
          <>
            {t("exams.titlePrefix")}{" "}
            <span className="text-yu-blue-700">{t("exams.titleAccent")}</span>
          </>
        }
        subtitle={t("exams.subtitle")}
      />
      <p className="-mt-4 text-xs text-slate-500">
        {isTrial
          ? t("trial.examsHint", { defaultValue: "Exams included in your free trial courses on this device." })
          : t("exams.enrolledOnlyHint")}
      </p>

      {lessonId || courseId ? (
        <div className="space-y-3">
          <BackToLessonBanner courseId={courseId} lessonId={lessonId} />
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--yu-blue-100)] bg-[var(--yu-blue-50)]/60 px-4 py-3 text-sm text-[var(--yu-blue-900)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <span>
              {lessonId
                ? t("exams.filteredByLesson", { defaultValue: "Showing quizzes for this lecture." })
                : t("exams.filteredByCourse", { defaultValue: "Showing quizzes for this course." })}
            </span>
            <Link to={examsBase} className="font-bold underline-offset-2 hover:underline">
              {t("exams.clearFilters", { defaultValue: "Show all exams" })}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("exams.searchPlaceholder")}
          className="w-full rounded-xl border border-slate-200/90 bg-white/90 py-3 pe-4 ps-10 text-sm font-medium text-slate-900 outline-none shadow-[var(--shadow-sm)] transition focus:border-[var(--yu-blue-400)] focus:ring-4 focus:ring-[var(--yu-blue-500)]/10 dark:border-white/10 dark:bg-[#0F1E38] dark:text-white"
        />
      </div>

      {isLoading ? <p className="text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-red-600">
          {t("exams.loadError", { defaultValue: "Could not load exams." })}
          <button type="button" onClick={() => void refetch()} className="ms-3 text-sm font-semibold text-yu-blue-700 hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">{t("exams.empty", { defaultValue: "No exams found." })}</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {!isLoading && !isError
          ? filtered.map((exam) => {
              const sub = exam.mySubmission;
              const studentFinished = Boolean(sub?.submittedAt);
              const inProgress = Boolean(sub && !sub.submittedAt);
              const displayStatus = studentFinished ? "COMPLETED" : exam.status;
              const st = STATUS_MAP[displayStatus] || STATUS_MAP.UPCOMING;
              const typeKey = examTypeLabelKey(exam.type);
              const maxPts = Number(exam.totalPoints) || 1;
              const score = sub?.totalScore != null ? Number(sub.totalScore) : null;
              const scorePct = studentFinished && score != null ? Math.round((score / maxPts) * 100) : null;

              return (
                <article
                  key={exam.id}
                  className="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--yu-blue-200)] hover:shadow-[var(--shadow-md)] dark:border-white/8 dark:bg-[#0F1E38]"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">{exam.title}</h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {courseLabel(exam) !== "—" ? (
                            <p className="text-xs font-semibold text-[var(--yu-blue-700)]">{courseLabel(exam)}</p>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              {t("explore.free", { defaultValue: "FREE / مجاني" })}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t(typeKey)}</p>
                      </div>
                      <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${st.style}`}>{t(st.label)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                      {exam.scheduledAt ? (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(exam.scheduledAt).toLocaleString()}
                        </span>
                      ) : null}
                      {studentFinished && sub?.submittedAt ? (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {t("exams.completedOn")}: {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {exam.durationMinutes} {t("exams.minutesShort", { defaultValue: "min" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {studentFinished && score != null
                          ? t("exams.scoreLine", { score, max: maxPts, pct: scorePct })
                          : t("exams.pointsLine", { count: exam.totalPoints, defaultValue: "{{count}} pts" })}
                      </span>
                    </div>
                    {studentFinished && scorePct != null ? (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--yu-blue-700),var(--yu-blue-500))]" style={{ width: `${Math.min(100, scorePct)}%` }} />
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`${examsBase}/${exam.id}${lessonReturnQs}`}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[var(--yu-blue-300)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:text-slate-200"
                      >
                        {t("exams.actions.viewDetails", { defaultValue: "View Exam Details" })}
                      </Link>
                      {studentFinished && sub?.id ? (
                        <Link
                          to={`${examsBase}/${exam.id}/results/${sub.id}${lessonReturnQs}`}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[var(--yu-blue-300)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:text-slate-200"
                        >
                          {t("exams.actions.viewResults", { defaultValue: "View Results" })}
                        </Link>
                      ) : null}
                      {exam.status === "AVAILABLE" && !studentFinished ? (
                        <Link
                          to={`${examsBase}/${exam.id}/take${lessonReturnQsWithAutostart}`}
                          className="rounded-xl bg-[var(--yu-blue-700)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
                        >
                          {inProgress ? t("exams.continue", { defaultValue: "Continue exam" }) : t("exams.start", { defaultValue: "Start" })}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </div>
  );
}
