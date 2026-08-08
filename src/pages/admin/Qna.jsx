import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle, CornerDownLeft, HelpCircle, Loader2, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import {
  useAdminQuestions,
  useAdminReplyToQuestion,
  useAdminToggleResolveQuestion,
} from "../../features/admin/qna/hooks";

export default function AdminQna() {
  const { t } = useTranslation();
  const [courseId, setCourseId] = useState("");
  const [statusFilter, setStatusFilter] = useState("unanswered");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState(null);

  const { data: coursesData } = useAdminCourses({ page: 1, limit: 100 });
  const courses = coursesData?.courses || [];

  const resolvedParam = useMemo(() => {
    if (statusFilter === "all") return undefined;
    return statusFilter === "answered" ? "true" : "false";
  }, [statusFilter]);

  const { data: questions = [], isLoading, error } = useAdminQuestions({
    courseId: courseId || undefined,
    resolved: resolvedParam,
    limit: 100,
  });

  const replyMutation = useAdminReplyToQuestion();
  const resolveMutation = useAdminToggleResolveQuestion();

  const courseOptions = useMemo(
    () => (Array.isArray(courses) ? courses : []).map((c) => ({ id: c.id, title: c.title })),
    [courses]
  );

  const activeQuestion = useMemo(() => {
    if (!selectedQuestionId) return questions[0] || null;
    return questions.find((q) => q.id === selectedQuestionId) || questions[0] || null;
  }, [questions, selectedQuestionId]);

  useEffect(() => {
    if (activeQuestion && activeQuestion.id !== selectedQuestionId) {
      setSelectedQuestionId(activeQuestion.id);
    }
  }, [activeQuestion, selectedQuestionId]);

  useEffect(() => {
    if (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, t("adminPages.qna.loadError")),
      });
    }
  }, [error, t]);

  const onReplySubmit = async (e) => {
    e.preventDefault();
    if (!activeQuestion || !replyText.trim()) return;
    setNotice(null);
    try {
      await replyMutation.mutateAsync({ questionId: activeQuestion.id, body: replyText.trim() });
      setReplyText("");
      setNotice({ type: "success", message: t("adminPages.qna.replySuccess") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("adminPages.qna.replyError")) });
    }
  };

  const onResolveToggle = async (questionId) => {
    setNotice(null);
    try {
      await resolveMutation.mutateAsync(questionId);
      setNotice({ type: "success", message: t("adminPages.qna.statusUpdated") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("adminPages.qna.statusError")) });
    }
  };

  const courseTitle = activeQuestion?.lesson?.section?.unit?.course?.title;
  const lessonTitle = activeQuestion?.lesson?.title;
  const instructorName = activeQuestion?.lesson?.section?.unit?.course?.instructor?.fullName;

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.qna.title")}
        subtitle={t("adminPages.qna.subtitle")}
        actions={
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setSelectedQuestionId(null);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
          >
            <option value="">{t("adminPages.qna.allCourses")}</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        }
      />

      <div className="flex w-fit rounded-xl border border-slate-200/50 bg-slate-100 p-1 dark:border-white/5 dark:bg-[#16161F]">
        {[
          { key: "unanswered", label: t("adminPages.qna.filterPending") },
          { key: "answered", label: t("adminPages.qna.filterResolved") },
          { key: "all", label: t("adminPages.qna.filterAll") },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setStatusFilter(tab.key);
              setSelectedQuestionId(null);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? "bg-[var(--yu-blue-700)] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Notice type={notice?.type} message={notice?.message} />

      <div className="grid h-[600px] grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#1A1A22] lg:col-span-5">
          <div className="border-b border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-[#1C1C26]">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <MessageSquare className="h-4 w-4 text-[var(--yu-blue-700)]" />
              {t("adminPages.qna.listTitle")}
              <span className="ms-auto rounded-full bg-[var(--yu-blue-700)]/10 px-2 py-0.5 text-[10px] font-extrabold text-[var(--yu-blue-700)]">
                {questions.length}
              </span>
            </h3>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-white/5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--yu-blue-700)]" />
                <span className="text-xs font-bold">{t("adminPages.qna.loading")}</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="space-y-2 py-20 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                <HelpCircle className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p>{t("adminPages.qna.empty")}</p>
              </div>
            ) : (
              questions.map((q) => {
                const isSelected = activeQuestion?.id === q.id;
                const snippet = q.body && q.body.length > 70 ? `${q.body.slice(0, 70)}...` : q.body;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`flex w-full flex-col gap-1.5 p-4 text-start transition-all focus:outline-none ${
                      isSelected
                        ? "border-s-4 border-s-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/5 dark:bg-[var(--yu-blue-700)]/10"
                        : "hover:bg-slate-50 dark:hover:bg-white/2"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="line-clamp-1 flex-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {q.title || t("adminPages.qna.questionFallback")}
                      </span>
                      <span
                        className={`ms-2 h-2 w-2 shrink-0 rounded-full ${
                          q.isResolved ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                    </div>
                    <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">{snippet}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-400">
                      <span>{q.student?.fullName || t("adminPages.qna.anonymous")}</span>
                      <span>·</span>
                      <span>{q.lesson?.section?.unit?.course?.title || "—"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#1A1A22] lg:col-span-7">
          {activeQuestion ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 dark:border-white/5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {[courseTitle, lessonTitle].filter(Boolean).join(" · ")}
                  </p>
                  <h2 className="mt-1 text-base font-black text-slate-900 dark:text-white">
                    {activeQuestion.title || t("adminPages.qna.questionFallback")}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {activeQuestion.student?.fullName}
                    {activeQuestion.student?.email ? ` · ${activeQuestion.student.email}` : ""}
                    {instructorName ? ` · ${t("adminPages.qna.instructor")}: ${instructorName}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      activeQuestion.isResolved
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}
                  >
                    {activeQuestion.isResolved ? t("adminPages.qna.resolved") : t("adminPages.qna.pending")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onResolveToggle(activeQuestion.id)}
                    disabled={resolveMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {activeQuestion.isResolved ? t("adminPages.qna.reopen") : t("adminPages.qna.markResolved")}
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800 dark:bg-white/5 dark:text-slate-200">
                  {activeQuestion.body}
                </div>
                {(activeQuestion.answers || []).map((ans) => {
                  const isStaff = ans.isInstructorReply;
                  return (
                    <div
                      key={ans.id}
                      className={`rounded-xl p-3 text-sm ${
                        isStaff
                          ? "border border-[var(--yu-blue-100)] bg-[var(--yu-blue-50)] text-slate-800 dark:border-[var(--yu-blue-800)] dark:bg-[var(--yu-blue-700)]/10 dark:text-slate-200"
                          : "bg-slate-50 text-slate-800 dark:bg-white/5 dark:text-slate-200"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                        {isStaff ? <Check className="h-3 w-3 text-[var(--yu-blue-700)]" /> : null}
                        <span>
                          {ans.user?.fullName ||
                            (isStaff ? t("adminPages.qna.staff") : t("adminPages.qna.anonymous"))}
                        </span>
                      </div>
                      <p>{ans.body}</p>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={onReplySubmit} className="border-t border-slate-100 p-4 dark:border-white/5">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder={t("adminPages.qna.replyPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#12121A] dark:text-white"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={replyMutation.isPending || !replyText.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--yu-blue-600)] disabled:opacity-50"
                  >
                    {replyMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CornerDownLeft className="h-3.5 w-3.5" />
                    )}
                    {t("adminPages.qna.reply")}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
              <HelpCircle className="h-8 w-8" />
              <p className="text-sm font-semibold">{t("adminPages.qna.selectPrompt")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
