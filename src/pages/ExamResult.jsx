import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/dashboard/PageHeader";
import EmptyState from "../components/dashboard/EmptyState";
import { StudentSurface, StudentBadge, studentBtnPrimary, studentBtnGhost } from "../components/student/ui";
import { useExamResult } from "../features/student/exams/hooks";
import { useTrialExamResult } from "../features/trial/hooks";
import { useLearningPanelMode } from "../hooks/useLearningPanelMode";

export default function ExamResult() {
  const { t } = useTranslation();
  const { id: examId, submissionId } = useParams();
  const { isTrial, examsBase } = useLearningPanelMode();
  const studentQuery = useExamResult(examId, submissionId, { enabled: !isTrial });
  const trialQuery = useTrialExamResult(examId, submissionId, { enabled: isTrial });
  const { data: result, isLoading, isError, error, refetch } = isTrial ? trialQuery : studentQuery;

  if (isLoading) {
    return (
      <StudentSurface>
        <p className="text-center text-sm text-slate-500">{t("dashboard.common.loading")}</p>
      </StudentSurface>
    );
  }

  if (isError || !result) {
    return (
      <EmptyState
        title={t("examResult.loadError", { defaultValue: "Results unavailable" })}
        message={error?.response?.data?.message || t("examResult.loadError")}
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

  const passed = !!result.isPassed;
  const score = result.totalScore ?? 0;
  const max = result.exam?.totalPoints ?? 1;
  const pct = Math.round((score / max) * 100);

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
        title={result.exam?.title || t("examResult.title")}
        subtitle={t("examResult.scoreSummary", { score, max, pct })}
      />

      <StudentSurface padded={false}>
        <div className="border-b border-slate-100 bg-gradient-to-r from-[var(--yu-blue-50)]/80 to-white px-6 py-8 dark:border-white/8 dark:from-[var(--yu-blue-700)]/10 dark:to-[#0F1E38]">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.15rem] ${
                passed ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-[var(--yu-blue-700)]/10"
              }`}
            >
              {passed ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-[var(--yu-blue-700)]" />}
            </div>
            <div>
              <StudentBadge tone={passed ? "emerald" : "amber"}>
                {passed ? t("examResult.passed", { defaultValue: "Passed" }) : t("examResult.failed", { defaultValue: "Not passed" })}
              </StudentBadge>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t("examResult.passingLine", { passing: result.exam?.passingScore ?? "—" })}
              </p>
              {result.xp?.amount ? (
                <p className="mt-2 text-sm font-bold text-[var(--yu-blue-700)]">
                  {t("student.gamification.examXpToast", {
                    amount: result.xp.amount,
                    defaultValue: "You earned {{amount}} XP for this exam",
                  })}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-[var(--yu-blue-700)] transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        </div>

        <div className="divide-y divide-slate-100 px-6 py-6 dark:divide-white/8">
          {(result.answers || []).map((a, idx) => (
            <div key={a.questionId || idx} className="py-4 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.question?.questionText || `Q${idx + 1}`}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("examResult.yourAnswer")}: <span className="font-medium text-slate-700 dark:text-slate-300">{a.answerText || "—"}</span>
              </p>
              {a.question?.correctAnswer != null && String(a.question.correctAnswer).length > 0 ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("examResult.correctAnswer")}: <span className="font-medium text-slate-700 dark:text-slate-300">{a.question.correctAnswer}</span>
                </p>
              ) : null}
              {a.question?.imageUrl ? (
                <img src={a.question.imageUrl} alt="" className="mt-2 max-h-48 rounded-lg object-contain" />
              ) : null}
              {a.question?.explanation ? (
                <p className="mt-2 rounded-xl bg-slate-50/80 p-2 text-xs text-slate-600 dark:bg-[#0C1829] dark:text-slate-300">
                  {t("examResult.explanation", { defaultValue: "Explanation" })}: {a.question.explanation}
                </p>
              ) : null}
              <p className="mt-1 text-xs">
                <span className={a.isCorrect ? "font-semibold text-emerald-600" : "font-semibold text-[var(--yu-blue-700)]"}>
                  {a.isCorrect ? t("examResult.correct") : t("examResult.incorrect")} · {a.pointsEarned ?? 0} / {a.question?.points ?? "—"}{" "}
                  {t("examResult.pts")}
                </span>
              </p>
            </div>
          ))}
        </div>
      </StudentSurface>
    </div>
  );
}
