import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarCheck, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  StudentSurface,
  StudentStat,
  StudentBadge,
  studentFieldClass,
  studentBtnPrimary,
  studentBtnGhost,
} from "../../components/student/ui";
import {
  useCreateStudyPlan,
  useCreateStudyPlanItem,
  useDeleteStudyPlanItem,
  useStudyPlans,
  useUpdateStudyPlanItem,
} from "../../features/student/studyPlans/hooks";
import { getErrorMessage } from "../../api/error";

export default function StudentStudyPlan() {
  const { t } = useTranslation();
  const [planTitle, setPlanTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const { data: plans = [], isLoading, isError, refetch } = useStudyPlans();
  const createPlan = useCreateStudyPlan();
  const createItem = useCreateStudyPlanItem();
  const updateItem = useUpdateStudyPlanItem();
  const deleteItem = useDeleteStudyPlanItem();

  const activePlan = useMemo(() => plans.find((plan) => !plan.isArchived) || plans[0] || null, [plans]);
  const items = useMemo(() => activePlan?.items || [], [activePlan]);
  const todayItems = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return items.filter((item) => item.scheduledAt && String(item.scheduledAt).slice(0, 10) === today);
  }, [items]);

  const ensurePlan = async () => {
    if (activePlan?.id) return activePlan;
    const title = planTitle.trim() || t("student.studyPlan.defaultTitle", { defaultValue: "My USMLE Study Plan" });
    return createPlan.mutateAsync({ title });
  };

  const handleCreatePlan = async () => {
    const title = planTitle.trim();
    if (!title) return;
    try {
      await createPlan.mutateAsync({ title });
      setPlanTitle("");
      toast.success(t("student.studyPlan.planCreated", { defaultValue: "Study plan created." }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("student.studyPlan.planCreateError", { defaultValue: "Could not create study plan." })));
    }
  };

  const handleCreateTask = async () => {
    const title = taskTitle.trim();
    if (!title) return;
    try {
      const plan = await ensurePlan();
      await createItem.mutateAsync({
        planId: plan.id,
        body: {
          title,
          scheduledAt: scheduledAt || undefined,
        },
      });
      setTaskTitle("");
      setScheduledAt("");
      toast.success(t("student.studyPlan.taskCreated", { defaultValue: "Task added." }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("student.studyPlan.taskCreateError", { defaultValue: "Could not add task." })));
    }
  };

  const toggleDone = async (item) => {
    if (!activePlan?.id) return;
    await updateItem.mutateAsync({
      planId: activePlan.id,
      itemId: item.id,
      body: { status: item.status === "DONE" ? "TODO" : "DONE" },
    });
  };

  const removeItem = async (item) => {
    if (!activePlan?.id) return;
    await deleteItem.mutateAsync({ planId: activePlan.id, itemId: item.id });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={t("student.studyPlan.title", { defaultValue: "My Study Plan" })}
        subtitle={t("student.studyPlan.subtitle", { defaultValue: "Create practical tasks, schedule them, and track completion." })}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StudentStat
          label={t("student.studyPlan.activePlan", { defaultValue: "Active plan" })}
          value={activePlan?.title || t("student.studyPlan.noPlan", { defaultValue: "No plan yet" })}
          icon={CalendarCheck}
          tone="blue"
        />
        <StudentStat label={t("student.studyPlan.today", { defaultValue: "Today" })} value={todayItems.length} icon={CalendarCheck} tone="amber" />
        <StudentStat
          label={t("student.studyPlan.completed", { defaultValue: "Completed" })}
          value={items.filter((item) => item.status === "DONE").length}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      {!activePlan ? (
        <StudentSurface>
          <label className="text-sm font-bold text-slate-900 dark:text-white">
            {t("student.studyPlan.createPlan", { defaultValue: "Create your plan" })}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              className={studentFieldClass}
              placeholder={t("student.studyPlan.planTitlePlaceholder")}
            />
            <button type="button" onClick={handleCreatePlan} className={studentBtnPrimary}>
              <Plus className="h-4 w-4" /> {t("common.create", { defaultValue: "Create" })}
            </button>
          </div>
        </StudentSurface>
      ) : null}

      <StudentSurface>
        <label className="text-sm font-bold text-slate-900 dark:text-white">
          {t("student.studyPlan.addTask", { defaultValue: "Add task" })}
        </label>
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_180px_auto]">
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className={studentFieldClass}
            placeholder={t("student.studyPlan.taskTitlePlaceholder")}
          />
          <input type="date" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={studentFieldClass} />
          <button type="button" disabled={createItem.isPending || createPlan.isPending} onClick={handleCreateTask} className={studentBtnPrimary}>
            {createItem.isPending || createPlan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t("student.studyPlan.add", { defaultValue: "Add" })}
          </button>
        </div>
      </StudentSurface>

      {isLoading ? (
        <StudentSurface>
          <p className="text-sm text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
        </StudentSurface>
      ) : null}

      {isError ? (
        <EmptyState
          title={t("student.studyPlan.retry", { defaultValue: "Could not load plan" })}
          message={t("student.studyPlan.retry", { defaultValue: "Could not load plan. Retry" })}
          icon={CalendarCheck}
          action={
            <button type="button" onClick={() => refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry", { defaultValue: "Retry" })}
            </button>
          }
        />
      ) : null}

      <StudentSurface padded={false}>
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-0 dark:border-white/8 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`font-semibold ${item.status === "DONE" ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"}`}>
                    {item.title}
                  </p>
                  {item.status === "DONE" ? <StudentBadge tone="emerald">{t("student.studyPlan.done", { defaultValue: "Done" })}</StudentBadge> : null}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : t("student.studyPlan.unscheduled", { defaultValue: "Unscheduled" })}
                  {item.course?.title ? ` · ${item.course.title}` : ""}
                  {item.lesson?.title ? ` · ${item.lesson.title}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => toggleDone(item)} className={studentBtnGhost}>
                  <CheckCircle2 className="h-4 w-4" />{" "}
                  {item.status === "DONE" ? t("student.studyPlan.undo", { defaultValue: "Undo" }) : t("student.studyPlan.done", { defaultValue: "Done" })}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/90 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 shadow-[var(--shadow-sm)] transition hover:bg-rose-50 dark:border-rose-900/40 dark:bg-white/5 dark:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" /> {t("common.delete", { defaultValue: "Delete" })}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">{t("student.studyPlan.empty", { defaultValue: "No tasks yet." })}</div>
        )}
      </StudentSurface>
    </div>
  );
}
