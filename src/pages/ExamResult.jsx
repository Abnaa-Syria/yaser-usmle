import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/dashboard/PageHeader";
import EmptyState from "../components/dashboard/EmptyState";
import { StudentSurface, StudentBadge, studentBtnPrimary, studentBtnGhost } from "../components/student/ui";
import { useExamResult } from "../features/student/exams/hooks";
import { useTrialExamResult } from "../features/trial/hooks";
import { useLearningPanelMode } from "../hooks/useLearningPanelMode";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

function pickLocalized(primary, ar, isAr) {
  if (isAr && ar?.trim()) return ar.trim();
  return primary || "";
}

function QuestionReviewCard({ answer, index, isAr, t }) {
  const [open, setOpen] = useState(true);
  const q = answer.question || {};
  const questionText = pickLocalized(q.questionText, q.questionTextAr, isAr);
  const explanation = pickLocalized(q.explanation, q.explanationAr, isAr);
  const correct = !!answer.isCorrect;

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition ${
        correct
          ? "border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5"
          : "border-[var(--yu-blue-200)]/80 bg-[var(--yu-blue-50)]/20 dark:border-[var(--yu-blue-500)]/20 dark:bg-[var(--yu-blue-700)]/5"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-5 py-4 text-start"
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            correct ? "bg-emerald-100 text-emerald-700" : "bg-[var(--yu-blue-100)] text-[var(--yu-blue-700)]"
          }`}
        >
          {correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("examResult.questionLabel", { n: index + 1, defaultValue: "Question {{n}}" })}
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900 dark:text-white">{questionText || `Q${index + 1}`}</p>
          <p className="mt-2 text-xs font-semibold">
            <span className={correct ? "text-emerald-700" : "text-[var(--yu-blue-700)]"}>
              {correct ? t("examResult.correct") : t("examResult.incorrect")} · {answer.pointsEarned ?? 0} / {q.points ?? "—"}{" "}
              {t("examResult.pts")}
            </span>
          </p>
        </div>
        {open ? <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" /> : <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-slate-200/60 px-5 py-4 dark:border-white/8">
          {q.imageUrl ? (
            <img src={resolveMediaUrl(q.imageUrl)} alt="" className="max-h-56 w-full rounded-xl object-contain" />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/80 px-4 py-3 dark:bg-[#0C1829]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("examResult.yourAnswer")}</p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{answer.answerText || "—"}</p>
            </div>
            {q.correctAnswer != null && String(q.correctAnswer).length > 0 ? (
              <div className="rounded-xl bg-white/80 px-4 py-3 dark:bg-[#0C1829]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("examResult.correctAnswer")}</p>
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{q.correctAnswer}</p>
              </div>
            ) : null}
          </div>
          {explanation ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                <BookOpen className="h-4 w-4" />
                {t("examResult.explanation", { defaultValue: "Explanation" })}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-amber-950 dark:text-amber-100">{explanation}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function ExamResult() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { id: examId, submissionId } = useParams();
  const { isTrial, examsBase } = useLearningPanelMode();
  const studentQuery = useExamResult(examId, submissionId, { enabled: !isTrial });
  const trialQuery = useTrialExamResult(examId, submissionId, { enabled: isTrial });
  const { data: result, isLoading, isError, error, refetch } = isTrial ? trialQuery : studentQuery;

  const breakdown = useMemo(() => {
    const answers = result?.answers || [];
    const correctCount = answers.filter((a) => a.isCorrect).length;
    return { answers, correctCount, total: answers.length };
  }, [result]);

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
        <div
          className={`border-b px-6 py-8 md:px-8 ${
            passed
              ? "border-emerald-100 bg-gradient-to-r from-emerald-50 to-white dark:border-emerald-500/15 dark:from-emerald-500/10 dark:to-[#0F1E38]"
              : "border-slate-100 bg-gradient-to-r from-[var(--yu-blue-50)]/80 to-white dark:border-white/8 dark:from-[var(--yu-blue-700)]/10 dark:to-[#0F1E38]"
          }`}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] ${
                  passed ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-[var(--yu-blue-700)]/10"
                }`}
              >
                {passed ? <CheckCircle2 className="h-9 w-9 text-emerald-600" /> : <XCircle className="h-9 w-9 text-[var(--yu-blue-700)]" />}
              </div>
              <div>
                <StudentBadge tone={passed ? "emerald" : "amber"}>
                  {passed ? t("examResult.passed", { defaultValue: "Passed" }) : t("examResult.failed", { defaultValue: "Not passed" })}
                </StudentBadge>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                  {score}/{max} <span className="text-lg font-bold text-slate-500">({pct}%)</span>
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {t("examResult.passingLine", { passing: result.exam?.passingScore ?? "—" })}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {t("examResult.breakdown", {
                    correct: breakdown.correctCount,
                    total: breakdown.total,
                    defaultValue: "{{correct}} of {{total}} questions correct",
                  })}
                </p>
                {result.xp?.amount ? (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--yu-blue-200)] bg-[var(--yu-blue-50)] px-3 py-1.5 text-xs font-bold text-[var(--yu-blue-800)]">
                    <span className="rounded-md bg-[var(--yu-blue-700)] px-1.5 py-0.5 text-[10px] text-white">XP</span>
                    {t("student.gamification.examXpToast", {
                      amount: result.xp.amount,
                      defaultValue: "Platform points bonus: +{{amount}} XP (not your exam score)",
                    })}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 md:max-w-xs dark:bg-white/10" dir="ltr">
              <div
                className={`h-full rounded-full transition-all ${passed ? "bg-emerald-500" : "bg-[var(--yu-blue-700)]"}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6 md:px-8">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t("examResult.reviewTitle", { defaultValue: "Question review" })}
          </h2>
          {breakdown.answers.map((a, idx) => (
            <QuestionReviewCard key={a.questionId || idx} answer={a} index={idx} isAr={isAr} t={t} />
          ))}
        </div>
      </StudentSurface>
    </div>
  );
}
