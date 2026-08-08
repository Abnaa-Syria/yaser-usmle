import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock3, FileText, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/dashboard/PageHeader";
import EmptyState from "../components/dashboard/EmptyState";
import { StudentSurface, StudentBadge, studentBtnPrimary, studentBtnGhost } from "../components/student/ui";
import { useStudentExam } from "../features/student/exams/hooks";
import { useTrialExam } from "../features/trial/hooks";
import { useLearningPanelMode } from "../hooks/useLearningPanelMode";

function examTypeLabelKey(type) {
  const k = String(type || "STANDALONE").toUpperCase();
  if (["FINAL", "UNIT", "LESSON", "STANDALONE"].includes(k)) return `exams.type.${k}`;
  return "exams.type.STANDALONE";
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--yu-blue-50)] dark:bg-[var(--yu-blue-700)]/15">
        <Icon className="h-5 w-5 text-[var(--yu-blue-700)]" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function ExamDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isTrial, examsBase } = useLearningPanelMode();
  const studentQuery = useStudentExam(id, { enabled: !isTrial });
  const trialQuery = useTrialExam(id, { enabled: isTrial });
  const { data: exam, isLoading, isError, error, refetch } = isTrial ? trialQuery : studentQuery;

  if (isLoading) {
    return (
      <StudentSurface>
        <p className="text-center text-sm text-slate-500">{t("dashboard.common.loading")}</p>
      </StudentSurface>
    );
  }

  if (isError || !exam) {
    return (
      <EmptyState
        title={t("examDetails.loadError", { defaultValue: "Exam not found" })}
        message={error?.response?.data?.message || t("examDetails.loadError", { defaultValue: "Exam not found." })}
        icon={AlertCircle}
        action={
          <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => void refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry")}
            </button>
            <Link to={examsBase} className={studentBtnGhost}>
              {t("examDetails.backToExams")}
            </Link>
          </div>
        }
      />
    );
  }

  const qCount = exam.questions?.length ?? 0;
  const typeKey = examTypeLabelKey(exam.type);
  const sub = exam.mySubmission;
  const finished = Boolean(sub?.submittedAt);

  return (
    <div className="space-y-6">
      <Link
        to={examsBase}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--yu-blue-700)]"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("examDetails.backToExams")}
      </Link>

      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={exam.title}
        subtitle={exam.description || t("examDetails.noDescription", { defaultValue: "No description provided." })}
      />

      <StudentSurface padded={false}>
        <div className="border-b border-slate-100 bg-gradient-to-r from-[var(--yu-blue-50)]/80 to-white px-6 py-6 dark:border-white/8 dark:from-[var(--yu-blue-700)]/10 dark:to-[#0F1E38] md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MetaItem icon={ClipboardList} label={t("examDetails.meta.examType")} value={t(typeKey)} />
            <MetaItem icon={Clock3} label={t("examDetails.meta.timeDuration")} value={`${exam.durationMinutes} ${t("takeExam.meta.minutes")}`} />
            <MetaItem icon={Target} label={t("examDetails.meta.passingScore")} value={`${exam.passingScore} / ${exam.totalPoints}`} />
            <MetaItem icon={FileText} label={t("examDetails.summary.questions")} value={String(qCount)} />
            <MetaItem icon={CalendarDays} label={t("examDetails.meta.status")} value={exam.status} />
          </div>
        </div>

        <div className="grid gap-8 px-6 py-8 md:grid-cols-2 md:px-8">
          <section>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t("examDetails.about.title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{exam.description || "—"}</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t("examDetails.instructions.title", { defaultValue: "Instructions" })}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {t("examDetails.ins.timer")}
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {t("examDetails.ins.graded")}
              </li>
            </ul>
          </section>
        </div>

        <div className="border-t border-slate-100 px-6 py-6 dark:border-white/8 md:px-8">
          {finished && sub?.id ? (
            <div className="space-y-4">
              <StudentBadge tone="emerald">{t("examDetails.alreadySubmitted", { defaultValue: "You have submitted this exam." })}</StudentBadge>
              <Link to={`${examsBase}/${exam.id}/results/${sub.id}`} className={studentBtnGhost}>
                {t("exams.actions.viewResults", { defaultValue: "View Results" })}
              </Link>
            </div>
          ) : exam.status === "AVAILABLE" ? (
            <Link to={`${examsBase}/${exam.id}/take`} className={studentBtnPrimary}>
              <BookOpen className="h-4 w-4" />
              {sub && !sub.submittedAt ? t("exams.continue", { defaultValue: "Continue exam" }) : t("examDetails.startExam", { defaultValue: "Start exam" })}
            </Link>
          ) : (
            <StudentBadge tone="amber">{t("examDetails.notAvailable", { status: exam.status })}</StudentBadge>
          )}
        </div>
      </StudentSurface>
    </div>
  );
}
