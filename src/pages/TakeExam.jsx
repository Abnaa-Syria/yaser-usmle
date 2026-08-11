import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useStartStudentExam, useStudentExam, useSubmitStudentExam } from "../features/student/exams/hooks";
import { useStartTrialExam, useSubmitTrialExam, useTrialExam } from "../features/trial/hooks";
import { useLearningPanelMode } from "../hooks/useLearningPanelMode";
import { getErrorMessage } from "../api/error";

function formatTime(secs) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function normalizeMcqChoices(raw) {
  if (raw == null) return [];
  let v = raw;
  if (typeof raw === "string") {
    try {
      v = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return [];
    if (typeof v[0] === "string") {
      return v.map((s) => ({ value: String(s), label: String(s) }));
    }
    return v.map((o, i) => {
      if (o != null && typeof o === "object") {
        const label =
          o.text != null ? String(o.text) : o.label != null ? String(o.label) : String(o.id ?? `${i + 1}`);
        const value = o.text != null ? String(o.text) : o.id != null ? String(o.id) : label;
        return { value, label };
      }
      return { value: String(o), label: String(o) };
    });
  }
  if (typeof v === "object") {
    return Object.entries(v).map(([, val]) => ({
      value: String(val),
      label: String(val),
    }));
  }
  return [];
}

function isQuestionAnswered(q, answers) {
  const v = answers[q.id];
  if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
    return v != null && String(v).trim() !== "";
  }
  if (q.type === "SHORT_ANSWER" || q.type === "ESSAY") {
    return typeof v === "string" && v.trim().length > 0;
  }
  return v != null && String(v).trim() !== "";
}

function allQuestionsAnswered(sortedQuestions, answers) {
  if (!sortedQuestions.length) return false;
  return sortedQuestions.every((q) => isQuestionAnswered(q, answers));
}

function OptionRow({ label, selected, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-start transition-all ${
        selected ? "border-yu-blue-700 bg-yu-blue-100" : "border-slate-200 bg-white hover:border-yu-blue-700/40 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-yu-blue-700 bg-yu-blue-700" : "border-slate-300"
        }`}
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      <span className={`text-sm font-medium leading-snug ${selected ? "text-yu-blue-950" : "text-slate-700"}`}>{label}</span>
    </button>
  );
}

export default function TakeExam() {
  const { t } = useTranslation();
  const { id: examId } = useParams();
  const { isTrial, examsBase } = useLearningPanelMode();
  const studentExamQuery = useStudentExam(examId, { enabled: !isTrial });
  const trialExamQuery = useTrialExam(examId, { enabled: isTrial });
  const { data: exam, isLoading, isError, error, refetch } = isTrial ? trialExamQuery : studentExamQuery;
  const startStudent = useStartStudentExam();
  const startTrial = useStartTrialExam();
  const submitStudent = useSubmitStudentExam();
  const submitTrial = useSubmitTrialExam();
  const startExam = isTrial ? startTrial : startStudent;
  const submitExam = isTrial ? submitTrial : submitStudent;

  const [phase, setPhase] = useState("loading");
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [localErr, setLocalErr] = useState("");

  const answersRef = useRef(answers);
  const examRef = useRef(exam);
  const submissionRef = useRef(submission);
  const submitOnceRef = useRef(false);
  const timeUpHandledRef = useRef(false);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    examRef.current = exam;
  }, [exam]);
  useEffect(() => {
    submissionRef.current = submission;
  }, [submission]);

  const questions = useMemo(() => {
    const qs = exam?.questions || [];
    return [...qs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [exam]);

  const total = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((q) => isQuestionAnswered(q, answers)).length,
    [questions, answers]
  );
  const flaggedCount = useMemo(
    () => questions.filter((q) => flagged[q.id]).length,
    [questions, flagged]
  );

  const runSubmit = useCallback(async () => {
    if (!examId || submitOnceRef.current) return;
    const ex = examRef.current;
    const qs = (ex?.questions || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const map = answersRef.current;

    if (!qs.length) {
      setLocalErr(t("takeExam.noQuestions"));
      return;
    }

    if (!allQuestionsAnswered(qs, map)) {
      if (timeUpHandledRef.current) {
        setPhase("expiredIncomplete");
      } else {
        setLocalErr(t("takeExam.validation.incomplete"));
        setPhase("review");
      }
      return;
    }

    const payload = qs.map((q) => ({
      questionId: q.id,
      answerText: map[q.id] != null && map[q.id] !== "" ? String(map[q.id]) : null,
    }));

    submitOnceRef.current = true;
    setLocalErr("");
    try {
      const data = await submitExam.mutateAsync({ examId, answers: payload });
      setResult(data);
      setPhase("done");
    } catch (e) {
      submitOnceRef.current = false;
      setLocalErr(getErrorMessage(e, t("takeExam.errors.submit")));
    }
  }, [examId, submitExam, t]);

  useEffect(() => {
    if (isLoading) setPhase("loading");
    else if (isError) setPhase("error");
    else if (exam) setPhase("intro");
  }, [isLoading, isError, exam]);

  useEffect(() => {
    if ((phase !== "active" && phase !== "review") || !submission?.startedAt || !exam?.durationMinutes) {
      return undefined;
    }
    const tick = () => {
      const started = new Date(submission.startedAt).getTime();
      const allowedSec = exam.durationMinutes * 60 + 120;
      const elapsed = (Date.now() - started) / 1000;
      const left = Math.max(0, Math.floor(allowedSec - elapsed));
      setTimeLeft(left);
      if (left <= 0 && !submitOnceRef.current && !timeUpHandledRef.current) {
        timeUpHandledRef.current = true;
        void runSubmit();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, submission, exam, runSubmit]);

  useEffect(() => {
    if (phase !== "active" && phase !== "review") return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const begin = async () => {
    if (!examId) return;
    submitOnceRef.current = false;
    timeUpHandledRef.current = false;
    setLocalErr("");
    setFlagged({});
    setAnswers({});
    try {
      const sub = await startExam.mutateAsync(examId);
      setSubmission(sub);
      if (sub?.submittedAt) {
        setResult(sub);
        setPhase("done");
        return;
      }
      setPhase("active");
      setCurrentIdx(0);
    } catch (e) {
      setLocalErr(getErrorMessage(e, t("takeExam.errors.start")));
    }
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const current = questions[currentIdx];
  const isLow = timeLeft < 300 && (phase === "active" || phase === "review");
  const isLast = currentIdx >= total - 1;
  const isFirst = currentIdx === 0;

  const TimerStrip = (
    <div className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold leading-tight text-slate-900">{exam?.title}</p>
            <p className="text-xs text-slate-500">
              {t("takeExam.strip.questionOf", { n: Math.min(currentIdx + 1, total || 1), total })}
              {" · "}
              {answeredCount}/{total} {t("takeExam.answered", { defaultValue: "answered" })}
              {flaggedCount > 0 ? ` · ${flaggedCount} ${t("takeExam.flagged", { defaultValue: "flagged" })}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold tabular-nums transition ${
                isLow ? "animate-pulse border-yu-blue-700 bg-yu-blue-100 text-yu-blue-700" : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <Clock3 className="h-4 w-4 shrink-0" />
              {formatTime(timeLeft)}
            </div>
            {phase === "active" ? (
              <button
                type="button"
                onClick={() => setPhase("review")}
                className="rounded-xl bg-yu-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-yu-blue-600"
              >
                {t("takeExam.strip.review", { defaultValue: "Review" })}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="h-1.5 w-full bg-slate-100">
        <motion.div
          className="h-full bg-yu-blue-700"
          animate={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );

  const Navigator = (
    <div className="mb-6 flex flex-wrap gap-2">
      {questions.map((q, idx) => {
        const answered = isQuestionAnswered(q, answers);
        const isFlagged = !!flagged[q.id];
        const isCurrent = idx === currentIdx && phase === "active";
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setCurrentIdx(idx);
              setPhase("active");
            }}
            title={isFlagged ? t("takeExam.flagged", { defaultValue: "Flagged" }) : undefined}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition ${
              isCurrent
                ? "bg-yu-blue-700 text-white"
                : answered
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {idx + 1}
            {isFlagged ? (
              <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
            ) : null}
          </button>
        );
      })}
    </div>
  );

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        {t("takeExam.loading", { defaultValue: "Loading exam…" })}
      </div>
    );
  }

  if (phase === "error" || !exam) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-red-600">{getErrorMessage(error, t("takeExam.errors.load"))}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 text-yu-blue-700 hover:underline">
          {t("takeExam.retry", { defaultValue: "Retry" })}
        </button>
        <Link to={examsBase} className="mt-6 block text-sm text-slate-500 hover:text-yu-blue-700">
          {t("takeExam.backExams")}
        </Link>
      </div>
    );
  }

  if (phase === "expiredIncomplete") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("takeExam.expiredIncomplete.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("takeExam.expiredIncomplete.body")}</p>
        <Link to={examsBase} className="mt-8 inline-block rounded-xl bg-yu-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-yu-blue-600">
          {t("takeExam.backExams")}
        </Link>
      </div>
    );
  }

  if (phase === "intro") {
    const canStart = exam.status === "AVAILABLE";
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-lg px-4">
          <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{exam.description || ""}</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>
              {t("takeExam.meta.duration")}: {exam.durationMinutes} {t("takeExam.meta.minutes")}
            </li>
            <li>
              {t("takeExam.meta.passing")}: {exam.passingScore} / {exam.totalPoints}
            </li>
            <li>
              {t("takeExam.meta.questions")}: {total}
            </li>
          </ul>
          {localErr ? <p className="mt-4 text-sm text-red-600">{localErr}</p> : null}
          {!canStart ? <p className="mt-4 text-sm text-amber-700">{t("takeExam.notAvailable", { status: exam.status })}</p> : null}
          <button
            type="button"
            disabled={!canStart || startExam.isPending}
            onClick={() => void begin()}
            className="mt-8 w-full rounded-xl bg-yu-blue-700 py-3 text-sm font-bold text-white hover:bg-yu-blue-600 disabled:opacity-50"
          >
            {startExam.isPending ? t("takeExam.starting") : t("takeExam.begin")}
          </button>
          <Link to={`${examsBase}/${examId}`} className="mt-4 block text-center text-sm text-slate-500 hover:text-yu-blue-700">
            {t("takeExam.backDetail")}
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    const passed = !!result.isPassed;
    const scoreVal = result.totalScore ?? 0;
    const maxPts = exam.totalPoints || 1;
    const pct = Math.round((scoreVal / maxPts) * 100);
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${passed ? "bg-green-100" : "bg-[var(--yu-blue-700)]/10"}`}>
            {passed ? <CheckCircle2 className="h-10 w-10 text-green-500" /> : <AlertCircle className="h-10 w-10 text-yu-blue-700" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{passed ? t("takeExam.result.passed") : t("takeExam.result.failed")}</h1>
          <p className="mt-2 text-slate-500">{exam.title}</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-900">
                {scoreVal}/{maxPts}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{t("takeExam.result.score")}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-900">{pct}%</p>
              <p className="mt-0.5 text-xs text-slate-500">{t("takeExam.result.percent")}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-900">{exam.passingScore}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t("takeExam.result.passing")}</p>
            </div>
          </div>
          {result.xp?.amount ? (
            <p className="mt-4 text-sm font-bold text-[var(--yu-blue-700)]">
              {t("student.gamification.examXpToast", {
                amount: result.xp.amount,
                defaultValue: "You earned {{amount}} XP for this exam",
              })}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {result.id ? (
              <Link
                to={`${examsBase}/${examId}/results/${result.id}`}
                className="rounded-xl bg-yu-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-yu-blue-600"
              >
                {t("takeExam.result.viewDetails", { defaultValue: "View detailed results" })}
              </Link>
            ) : null}
            <Link to={examsBase} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-yu-blue-700 hover:text-yu-blue-700">
              {t("takeExam.result.backToExams")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "review") {
    const unanswered = questions.filter((q) => !isQuestionAnswered(q, answers));
    const flaggedList = questions.filter((q) => flagged[q.id]);
    return (
      <div className="min-h-screen bg-slate-50">
        {TimerStrip}
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
          <h2 className="text-xl font-bold text-slate-900">{t("takeExam.review.title", { defaultValue: "Review before submit" })}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("takeExam.review.summary", {
              defaultValue: "{{answered}} of {{total}} answered · {{flagged}} flagged · {{unanswered}} unanswered",
              answered: answeredCount,
              total,
              flagged: flaggedCount,
              unanswered: unanswered.length,
            })}
          </p>
          {localErr ? <p className="mt-4 text-sm text-red-600">{localErr}</p> : null}
          <div className="mt-6">{Navigator}</div>
          <div className="mt-4 space-y-3">
            {unanswered.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-bold">{t("takeExam.review.unanswered", { defaultValue: "Unanswered" })}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unanswered.map((q) => {
                    const idx = questions.findIndex((x) => x.id === q.id);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(idx);
                          setPhase("active");
                        }}
                        className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-amber-800"
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {flaggedList.length > 0 ? (
              <div className="rounded-xl border border-yu-blue-100 bg-yu-blue-50 p-4 text-sm text-yu-blue-900">
                <p className="font-bold">{t("takeExam.review.flagged", { defaultValue: "Flagged for review" })}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flaggedList.map((q) => {
                    const idx = questions.findIndex((x) => x.id === q.id);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(idx);
                          setPhase("active");
                        }}
                        className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-yu-blue-700"
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPhase("active")}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:border-yu-blue-700 hover:text-yu-blue-700"
            >
              {t("takeExam.review.back", { defaultValue: "Back to questions" })}
            </button>
            <button
              type="button"
              disabled={submitExam.isPending || unanswered.length > 0}
              onClick={() => void runSubmit()}
              className="rounded-xl bg-yu-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-yu-blue-600 disabled:opacity-50"
            >
              {submitExam.isPending
                ? t("takeExam.starting", { defaultValue: "Submitting…" })
                : t("takeExam.warn.confirm", { defaultValue: "Submit exam" })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="p-8 text-center text-slate-600">
        {t("takeExam.noQuestions", { defaultValue: "This exam has no questions yet." })}
      </div>
    );
  }

  const mcqChoices = normalizeMcqChoices(current.options);
  const isFlagged = !!flagged[current.id];

  return (
    <div className="min-h-screen bg-slate-50">
      {TimerStrip}

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {localErr ? <p className="mb-4 text-center text-sm text-red-600">{localErr}</p> : null}
        {Navigator}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-3 md:px-8">
              <h2 className="text-lg font-bold text-slate-900 md:text-xl">{t("takeExam.question.label", { n: currentIdx + 1 })}</h2>
              <button
                type="button"
                onClick={() => toggleFlag(current.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  isFlagged
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-700"
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${isFlagged ? "fill-amber-500" : ""}`} />
                {isFlagged
                  ? t("takeExam.unflag", { defaultValue: "Unflag" })
                  : t("takeExam.flag", { defaultValue: "Flag" })}
              </button>
            </div>
            <div className="p-6 md:p-8">
              {current.imageUrl ? (
                <img src={current.imageUrl} alt="" className="mb-4 max-h-72 w-full rounded-xl object-contain" />
              ) : null}
              <p className="text-sm leading-relaxed text-slate-600">{current.questionText}</p>

              {(current.type === "MULTIPLE_CHOICE" || current.type === "TRUE_FALSE") && (
                <div className="mt-6 space-y-3">
                  {current.type === "TRUE_FALSE" ? (
                    <>
                      <OptionRow
                        label={t("takeExam.true")}
                        selected={answers[current.id] === "true"}
                        onPick={() => setAnswers((p) => ({ ...p, [current.id]: "true" }))}
                      />
                      <OptionRow
                        label={t("takeExam.false")}
                        selected={answers[current.id] === "false"}
                        onPick={() => setAnswers((p) => ({ ...p, [current.id]: "false" }))}
                      />
                    </>
                  ) : mcqChoices.length > 0 ? (
                    mcqChoices.map((opt, oidx) => (
                      <OptionRow
                        key={`${current.id}-mcq-${oidx}`}
                        label={opt.label}
                        selected={answers[current.id] === opt.value}
                        onPick={() => setAnswers((p) => ({ ...p, [current.id]: opt.value }))}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-amber-700">{t("takeExam.noMcqOptions")}</p>
                  )}
                </div>
              )}

              {(current.type === "SHORT_ANSWER" || current.type === "ESSAY") && (
                <textarea
                  value={answers[current.id] || ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, [current.id]: e.target.value }))}
                  rows={current.type === "ESSAY" ? 10 : 4}
                  className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-yu-blue-700 focus:ring-2 focus:ring-yu-blue-100"
                  placeholder={t("takeExam.shortAnswerPlaceholder")}
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 md:px-8">
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={isFirst}
                className={`flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-sm font-semibold ${
                  isFirst ? "cursor-not-allowed border-slate-100 text-slate-300" : "border-slate-200 text-slate-600 hover:border-yu-blue-700 hover:text-yu-blue-700"
                }`}
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {t("takeExam.nav.prev")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLast) setPhase("review");
                  else setCurrentIdx((i) => i + 1);
                }}
                className="flex items-center gap-2 rounded-xl bg-yu-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-yu-blue-600"
              >
                {isLast ? t("takeExam.strip.review", { defaultValue: "Review" }) : t("takeExam.nav.next")}
                {!isLast ? <ArrowRight className="h-4 w-4 rtl:rotate-180" /> : null}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
