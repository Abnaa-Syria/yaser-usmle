import { useMemo, useState, useEffect } from "react";
import { Loader2, MessageSquare, HelpCircle, Check, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { StudentSurface, StudentBadge, studentFieldClass, studentBtnPrimary } from "../../components/student/ui";
import { getErrorMessage } from "../../api/error";
import { useMyQuestions, useCreateQuestionAnswer } from "../../features/student/qna/hooks";

function Qna() {
  const { t } = useTranslation();

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState(null);

  const { data: questions = [], isLoading, error, refetch } = useMyQuestions();
  const replyMutation = useCreateQuestionAnswer();

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
      setNotice({ type: "error", message: getErrorMessage(error, t("student.qna.loadError")) });
    }
  }, [error, t]);

  const onReplySubmit = async (e) => {
    e.preventDefault();
    if (!activeQuestion || !replyText.trim()) return;

    setNotice(null);
    try {
      await replyMutation.mutateAsync({
        questionId: activeQuestion.id,
        lessonId: activeQuestion.lessonId,
        body: { body: replyText.trim() },
      });
      setReplyText("");
      setNotice({
        type: "success",
        message: t("student.qna.replySuccess"),
      });
      void refetch();
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("student.qna.replyError")) });
    }
  };

  return (
    <section className="space-y-6 font-sans antialiased">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={t("student.qna.pageTitle")}
        subtitle={t("student.qna.pageSubtitle")}
      />

      <Notice type={notice?.type} message={notice?.message} />

      <div className="grid h-[600px] grid-cols-1 gap-6 lg:grid-cols-12">
        <StudentSurface padded={false} className="lg:col-span-5 flex h-full flex-col">
          <div className="border-b border-slate-100 bg-slate-50/50 p-4 dark:border-white/8 dark:bg-[#0C1829]/50">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <MessageSquare className="h-4 w-4 text-[var(--yu-blue-700)]" />
              {t("student.qna.listTitle")}
              <span className="ms-auto rounded-full bg-[var(--yu-blue-700)]/10 px-2 py-0.5 text-[10px] font-extrabold text-[var(--yu-blue-700)]">
                {questions.length}
              </span>
            </h3>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-white/8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--yu-blue-700)]" />
                <span className="text-xs font-bold">{t("student.qna.loading")}</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--yu-blue-50)] text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/15 dark:text-[var(--yu-blue-300)]">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {t("student.qna.emptyList")}
                </p>
              </div>
            ) : (
              questions.map((q) => {
                const isSelected = activeQuestion?.id === q.id;
                const snippet = q.body && q.body.length > 70 ? `${q.body.slice(0, 70)}...` : q.body;

                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`flex w-full flex-col gap-1.5 p-4 text-start transition-all focus:outline-none ${
                      isSelected
                        ? "border-s-4 border-s-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/5 dark:bg-[var(--yu-blue-700)]/10"
                        : "hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="line-clamp-1 flex-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {q.title || t("student.qna.questionFallback")}
                      </span>
                      <span className={`ms-2 h-2 w-2 shrink-0 rounded-full ${q.isResolved ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>

                    <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">{snippet}</p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StudentBadge tone="slate">{q.lesson?.section?.unit?.course?.title || t("student.qna.courseFallback")}</StudentBadge>
                      <span className="text-[9px] font-semibold text-slate-500">{q.lesson?.title}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </StudentSurface>

        <StudentSurface padded={false} className="lg:col-span-7 flex h-full flex-col">
          {activeQuestion ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-white/8 dark:bg-[#0C1829]/50">
                <div className="min-w-0">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[var(--yu-blue-700)]">
                    {activeQuestion.lesson?.section?.unit?.course?.title} &middot; {activeQuestion.lesson?.title}
                  </span>
                  <h2 className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{activeQuestion.title}</h2>
                </div>

                <StudentBadge tone={activeQuestion.isResolved ? "emerald" : "amber"}>
                  <Check className="me-1 inline h-3 w-3" />
                  {activeQuestion.isResolved ? t("student.qna.resolved") : t("student.qna.pending")}
                </StudentBadge>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/30 p-4 dark:bg-[#0C1829]/30">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--yu-blue-700)]/15 text-xs font-bold text-[var(--yu-blue-700)]">
                    S
                  </div>
                  <div className="max-w-[85%] rounded-[1.15rem] border border-slate-200/80 bg-white p-3 shadow-[var(--shadow-sm)] dark:border-white/10 dark:bg-[#0F1E38]">
                    <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-200">{activeQuestion.body}</p>
                    <span className="mt-1 block text-[9px] text-slate-400">{new Date(activeQuestion.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {(activeQuestion.answers || []).map((ans) => {
                  const isInstructor = ans.isInstructorReply || ans.user?.role === "INSTRUCTOR" || ans.user?.role === "ADMIN";

                  return (
                    <div key={ans.id} className={`flex items-start gap-3 ${isInstructor ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isInstructor
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-[var(--yu-blue-700)]/15 text-[var(--yu-blue-700)]"
                        }`}
                      >
                        {isInstructor ? "T" : "S"}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-[1.15rem] border p-3 shadow-[var(--shadow-sm)] ${
                          isInstructor
                            ? "border-emerald-100 bg-emerald-50/50 text-slate-800 dark:border-emerald-900/30 dark:bg-emerald-500/10 dark:text-slate-100"
                            : "border-slate-200/80 bg-white text-slate-700 dark:border-white/10 dark:bg-[#0F1E38] dark:text-slate-200"
                        }`}
                      >
                        <p className="text-xs font-semibold leading-relaxed">{ans.body}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-400">
                          <span>{ans.user?.fullName || (isInstructor ? t("student.qna.instructor") : t("student.qna.anonymous"))}</span>
                          <span>&middot;</span>
                          <span>{new Date(ans.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={onReplySubmit}
                className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/30 p-4 dark:border-white/8 dark:bg-[#0C1829]/50"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("student.qna.followUpPlaceholder")}
                  className={`${studentFieldClass} h-10 text-xs`}
                  required
                />
                <button type="submit" disabled={replyMutation.isPending || !replyText.trim()} className={`${studentBtnPrimary} h-10 px-4 text-xs`}>
                  {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>{t("student.qna.reply")}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-xs font-semibold text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-200 dark:text-slate-700" />
              <p>{t("student.qna.selectPrompt")}</p>
            </div>
          )}
        </StudentSurface>
      </div>
    </section>
  );
}

export default Qna;
