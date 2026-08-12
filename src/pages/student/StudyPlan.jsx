import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Archive,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  StudentSurface,
  StudentStat,
  StudentBadge,
  studentFieldClass,
  studentSelectClass,
  studentBtnPrimary,
  studentBtnGhost,
} from "../../components/student/ui";
import {
  useCreateStudyPlan,
  useCreateStudyPlanItem,
  useDeleteStudyPlan,
  useDeleteStudyPlanItem,
  useStudyPlans,
  useUpdateStudyPlan,
  useUpdateStudyPlanItem,
} from "../../features/student/studyPlans/hooks";
import { useCourseUnits, useMyCourses } from "../../features/student/courses/hooks";
import { getErrorMessage } from "../../api/error";

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function ymd(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toIsoDate(dateStr) {
  if (!dateStr) return undefined;
  return `${dateStr}T12:00:00.000Z`;
}

const emptyTaskForm = {
  title: "",
  notes: "",
  scheduledAt: "",
  priority: "0",
  courseId: "",
  unitId: "",
  lessonId: "",
};

export default function StudentStudyPlan() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => ymd(new Date()));
  const [planEditorMode, setPlanEditorMode] = useState(null); // null | "create" | "edit"
  const [planForm, setPlanForm] = useState({ title: "", goal: "", targetDate: "" });
  const [taskForm, setTaskForm] = useState(() => ({ ...emptyTaskForm, scheduledAt: ymd(new Date()) }));
  const [editingItemId, setEditingItemId] = useState(null);

  const { data: plans = [], isLoading, isError, refetch } = useStudyPlans();
  const { data: courses = [] } = useMyCourses();
  const createPlan = useCreateStudyPlan();
  const updatePlan = useUpdateStudyPlan();
  const deletePlanMut = useDeleteStudyPlan();
  const createItem = useCreateStudyPlanItem();
  const updateItem = useUpdateStudyPlanItem();
  const deleteItem = useDeleteStudyPlanItem();

  const activePlans = useMemo(() => plans.filter((p) => !p.isArchived), [plans]);
  const archivedPlans = useMemo(() => plans.filter((p) => p.isArchived), [plans]);

  useEffect(() => {
    if (!selectedPlanId && activePlans[0]?.id) setSelectedPlanId(activePlans[0].id);
    else if (selectedPlanId && !plans.some((p) => p.id === selectedPlanId) && activePlans[0]?.id) {
      setSelectedPlanId(activePlans[0].id);
    }
  }, [activePlans, plans, selectedPlanId]);

  const activePlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || activePlans[0] || null,
    [plans, selectedPlanId, activePlans]
  );
  const items = useMemo(() => activePlan?.items || [], [activePlan]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekAnchor, i)), [weekAnchor]);

  const itemsByDay = useMemo(() => {
    const map = new Map();
    for (const day of weekDays) map.set(ymd(day), []);
    for (const item of items) {
      if (!item.scheduledAt) continue;
      const key = String(item.scheduledAt).slice(0, 10);
      if (map.has(key)) map.get(key).push(item);
    }
    return map;
  }, [items, weekDays]);

  const todayKey = ymd(new Date());
  const todayItems = useMemo(
    () => items.filter((item) => item.scheduledAt && String(item.scheduledAt).slice(0, 10) === todayKey),
    [items, todayKey]
  );
  const weekItems = useMemo(() => {
    const keys = new Set(weekDays.map(ymd));
    return items.filter((item) => item.scheduledAt && keys.has(String(item.scheduledAt).slice(0, 10)));
  }, [items, weekDays]);
  const weekDone = weekItems.filter((i) => i.status === "DONE").length;
  const openItems = items.filter((i) => i.status !== "DONE" && i.status !== "SKIPPED");
  const selectedDayItems = itemsByDay.get(selectedDay) || [];
  const unscheduled = items.filter((i) => !i.scheduledAt);

  const { data: units = [] } = useCourseUnits(taskForm.courseId || undefined);
  const lessons = useMemo(() => {
    const unit = units.find((u) => u.id === taskForm.unitId);
    return unit?.lessons || [];
  }, [units, taskForm.unitId]);

  useEffect(() => {
    if (!editingItemId) {
      setTaskForm((prev) => ({ ...prev, scheduledAt: selectedDay }));
    }
  }, [selectedDay, editingItemId]);

  const ensurePlan = async () => {
    if (activePlan?.id) return activePlan;
    const created = await createPlan.mutateAsync({
      title: t("student.studyPlan.defaultTitle", { defaultValue: "My USMLE Study Plan" }),
    });
    if (created?.id) setSelectedPlanId(created.id);
    return created;
  };

  const handleSavePlan = async () => {
    const title = planForm.title.trim();
    if (!title) return;
    try {
      if (planEditorMode === "edit" && activePlan?.id) {
        await updatePlan.mutateAsync({
          planId: activePlan.id,
          body: {
            title,
            goal: planForm.goal.trim() || null,
            targetDate: planForm.targetDate ? toIsoDate(planForm.targetDate) : null,
          },
        });
        toast.success(t("student.studyPlan.planUpdated", { defaultValue: isRtl ? "تم تحديث الخطة" : "Plan updated." }));
      } else {
        const created = await createPlan.mutateAsync({
          title,
          goal: planForm.goal.trim() || undefined,
          targetDate: planForm.targetDate ? toIsoDate(planForm.targetDate) : undefined,
        });
        if (created?.id) setSelectedPlanId(created.id);
        toast.success(t("student.studyPlan.planCreated", { defaultValue: "Study plan created." }));
      }
      setPlanEditorMode(null);
      setPlanForm({ title: "", goal: "", targetDate: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, t("student.studyPlan.planCreateError", { defaultValue: "Could not save plan." })));
    }
  };

  const resetTaskForm = (day = selectedDay) => {
    setEditingItemId(null);
    setTaskForm({ ...emptyTaskForm, scheduledAt: day });
  };

  const handleSaveTask = async () => {
    const title = taskForm.title.trim();
    if (!title) return;
    try {
      const plan = await ensurePlan();
      const body = {
        title,
        notes: taskForm.notes.trim() || undefined,
        scheduledAt: taskForm.scheduledAt ? toIsoDate(taskForm.scheduledAt) : undefined,
        priority: Number(taskForm.priority) || 0,
        courseId: taskForm.courseId || undefined,
        unitId: taskForm.unitId || undefined,
        lessonId: taskForm.lessonId || undefined,
      };
      if (editingItemId) {
        await updateItem.mutateAsync({ planId: plan.id, itemId: editingItemId, body });
      } else {
        await createItem.mutateAsync({ planId: plan.id, body });
      }
      resetTaskForm(taskForm.scheduledAt || selectedDay);
      toast.success(t("student.studyPlan.taskCreated", { defaultValue: "Task saved." }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("student.studyPlan.taskCreateError", { defaultValue: "Could not save task." })));
    }
  };

  const toggleDone = async (item) => {
    if (!activePlan?.id) return;
    try {
      await updateItem.mutateAsync({
        planId: activePlan.id,
        itemId: item.id,
        body: { status: item.status === "DONE" ? "TODO" : "DONE" },
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const removeItem = async (item) => {
    if (!activePlan?.id) return;
    try {
      await deleteItem.mutateAsync({ planId: activePlan.id, itemId: item.id });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setTaskForm({
      title: item.title || "",
      notes: item.notes || "",
      scheduledAt: item.scheduledAt ? String(item.scheduledAt).slice(0, 10) : selectedDay,
      priority: String(item.priority ?? 0),
      courseId: item.courseId || "",
      unitId: item.unitId || "",
      lessonId: item.lessonId || "",
    });
    if (item.scheduledAt) setSelectedDay(String(item.scheduledAt).slice(0, 10));
  };

  const locale = isRtl ? "ar-EG" : undefined;
  const weekLabel = `${weekDays[0].toLocaleDateString(locale, { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const renderTaskRow = (item) => (
    <div
      key={item.id}
      className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-0 dark:border-white/8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-semibold ${item.status === "DONE" ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"}`}>{item.title}</p>
          {item.status === "DONE" ? <StudentBadge tone="emerald">{t("student.studyPlan.done", { defaultValue: "Done" })}</StudentBadge> : null}
          {item.priority > 0 ? <StudentBadge tone="amber">P{item.priority}</StudentBadge> : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {item.scheduledAt
            ? new Date(item.scheduledAt).toLocaleDateString(locale)
            : t("student.studyPlan.unscheduled", { defaultValue: "Unscheduled" })}
          {item.course?.title ? ` · ${isRtl ? item.course.titleAr || item.course.title : item.course.title}` : ""}
          {item.unit?.title ? ` · ${isRtl ? item.unit.titleAr || item.unit.title : item.unit.title}` : ""}
          {item.lesson?.title ? ` · ${isRtl ? item.lesson.titleAr || item.lesson.title : item.lesson.title}` : ""}
        </p>
        {item.notes ? <p className="mt-1 text-xs text-slate-400">{item.notes}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => startEditItem(item)} className={studentBtnGhost}>
          <Pencil className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => toggleDone(item)} className={studentBtnGhost}>
          <CheckCircle2 className="h-4 w-4" />{" "}
          {item.status === "DONE" ? t("student.studyPlan.undo", { defaultValue: "Undo" }) : t("student.studyPlan.done", { defaultValue: "Done" })}
        </button>
        <button
          type="button"
          onClick={() => removeItem(item)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/90 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 shadow-[var(--shadow-sm)] transition hover:bg-rose-50 dark:border-rose-900/40 dark:bg-white/5 dark:text-rose-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={t("student.studyPlan.title", { defaultValue: "My Study Plan" })}
        subtitle={t("student.studyPlan.subtitleFull", {
          defaultValue: isRtl
            ? "خطتك الأسبوعية: أضف مهام على الأيام، اربطها بكورساتك، وتابع إنجازك."
            : "Your weekly plan: schedule tasks by day, link courses, and track completion.",
        })}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StudentStat
          label={t("student.studyPlan.activePlan", { defaultValue: "Active plan" })}
          value={activePlan?.title || t("student.studyPlan.noPlan", { defaultValue: "No plan yet" })}
          icon={CalendarCheck}
          tone="blue"
        />
        <StudentStat label={t("student.studyPlan.today", { defaultValue: "Today" })} value={todayItems.length} icon={CalendarCheck} tone="amber" />
        <StudentStat
          label={t("student.studyPlan.weekDone", { defaultValue: isRtl ? "إنجاز الأسبوع" : "Week done" })}
          value={`${weekDone}/${weekItems.length || 0}`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StudentStat
          label={t("student.studyPlan.openTasks", { defaultValue: isRtl ? "مهام مفتوحة" : "Open tasks" })}
          value={openItems.length}
          icon={CheckCircle2}
          tone="slate"
        />
      </div>

      <StudentSurface className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">{t("student.studyPlan.choosePlan", { defaultValue: "Plan" })}</label>
            <select value={activePlan?.id || ""} onChange={(e) => setSelectedPlanId(e.target.value)} className={studentSelectClass}>
              {activePlans.length === 0 ? <option value="">{t("student.studyPlan.noPlan", { defaultValue: "No plan yet" })}</option> : null}
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
              {archivedPlans.length ? (
                <optgroup label={t("student.studyPlan.archived", { defaultValue: "Archived" })}>
                  {archivedPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.title}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </div>
          <p className="self-end text-sm text-slate-500 line-clamp-2">
            {activePlan?.goal || t("student.studyPlan.goalHint", { defaultValue: isRtl ? "أضف هدف للخطة من تعديل الخطة." : "Add a goal via Edit plan." })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={studentBtnGhost}
            onClick={() => {
              setPlanForm({ title: "", goal: "", targetDate: "" });
              setPlanEditorMode("create");
            }}
          >
            <Plus className="h-4 w-4" /> {t("student.studyPlan.newPlan", { defaultValue: "New plan" })}
          </button>
          {activePlan ? (
            <>
              <button
                type="button"
                className={studentBtnGhost}
                onClick={() => {
                  setPlanForm({
                    title: activePlan.title || "",
                    goal: activePlan.goal || "",
                    targetDate: activePlan.targetDate ? String(activePlan.targetDate).slice(0, 10) : "",
                  });
                  setPlanEditorMode("edit");
                }}
              >
                {t("student.studyPlan.editPlan", { defaultValue: "Edit plan" })}
              </button>
              <button
                type="button"
                className={studentBtnGhost}
                onClick={async () => {
                  try {
                    await updatePlan.mutateAsync({ planId: activePlan.id, body: { isArchived: !activePlan.isArchived } });
                    toast.success(
                      activePlan.isArchived
                        ? t("student.studyPlan.restored", { defaultValue: "Plan restored" })
                        : t("student.studyPlan.archivedOk", { defaultValue: "Plan archived" })
                    );
                  } catch (error) {
                    toast.error(getErrorMessage(error));
                  }
                }}
              >
                <Archive className="h-4 w-4" />
                {activePlan.isArchived
                  ? t("student.studyPlan.restore", { defaultValue: "Restore" })
                  : t("student.studyPlan.archive", { defaultValue: "Archive" })}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/90 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 shadow-[var(--shadow-sm)] transition hover:bg-rose-50 dark:border-rose-900/40 dark:bg-white/5 dark:text-rose-400"
                onClick={async () => {
                  if (!window.confirm(t("student.studyPlan.deleteConfirm", { defaultValue: "Delete this plan and all tasks?" }))) return;
                  try {
                    await deletePlanMut.mutateAsync(activePlan.id);
                    setSelectedPlanId("");
                    toast.success(t("common.deleted", { defaultValue: "Deleted" }));
                  } catch (error) {
                    toast.error(getErrorMessage(error));
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
      </StudentSurface>

      {planEditorMode ? (
        <StudentSurface className="space-y-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {planEditorMode === "edit"
              ? t("student.studyPlan.editPlan", { defaultValue: "Edit plan" })
              : t("student.studyPlan.createPlan", { defaultValue: "Create your plan" })}
          </p>
          <input
            value={planForm.title}
            onChange={(e) => setPlanForm((p) => ({ ...p, title: e.target.value }))}
            className={studentFieldClass}
            placeholder={t("student.studyPlan.planTitlePlaceholder", { defaultValue: "Plan title" })}
          />
          <textarea
            value={planForm.goal}
            onChange={(e) => setPlanForm((p) => ({ ...p, goal: e.target.value }))}
            className={`${studentFieldClass} min-h-20`}
            placeholder={t("student.studyPlan.goalPlaceholder", { defaultValue: "Goal (optional)" })}
          />
          <input type="date" value={planForm.targetDate} onChange={(e) => setPlanForm((p) => ({ ...p, targetDate: e.target.value }))} className={studentFieldClass} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={studentBtnPrimary} disabled={createPlan.isPending || updatePlan.isPending} onClick={handleSavePlan}>
              {createPlan.isPending || updatePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("common.save", { defaultValue: "Save" })}
            </button>
            <button type="button" className={studentBtnGhost} onClick={() => setPlanEditorMode(null)}>
              {t("common.cancel", { defaultValue: "Cancel" })}
            </button>
          </div>
        </StudentSurface>
      ) : null}

      <StudentSurface>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{t("student.studyPlan.weekView", { defaultValue: isRtl ? "الأسبوع" : "This week" })}</p>
            <p className="text-xs text-slate-500">{weekLabel}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className={studentBtnGhost} onClick={() => setWeekAnchor((d) => addDays(d, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={studentBtnGhost}
              onClick={() => {
                const start = startOfWeek(new Date());
                setWeekAnchor(start);
                setSelectedDay(ymd(new Date()));
              }}
            >
              {t("student.studyPlan.today", { defaultValue: "Today" })}
            </button>
            <button type="button" className={studentBtnGhost} onClick={() => setWeekAnchor((d) => addDays(d, 7))}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {weekDays.map((day) => {
            const key = ymd(day);
            const dayItems = itemsByDay.get(key) || [];
            const doneCount = dayItems.filter((i) => i.status === "DONE").length;
            const selected = key === selectedDay;
            const isToday = key === todayKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDay(key);
                  if (!editingItemId) setTaskForm((p) => ({ ...p, scheduledAt: key }));
                }}
                className={`rounded-xl border p-3 text-start transition ${
                  selected
                    ? "border-[var(--yu-blue-500)] bg-[var(--yu-blue-50)] dark:bg-[var(--yu-blue-700)]/20"
                    : "border-slate-200/80 bg-slate-50/60 hover:border-[var(--yu-blue-300)] dark:border-white/10 dark:bg-[#0C1829]"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {day.toLocaleDateString(locale, { weekday: "short" })}
                  {isToday ? " · " + t("student.studyPlan.today", { defaultValue: "Today" }) : ""}
                </p>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{day.getDate()}</p>
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  {dayItems.length
                    ? t("student.studyPlan.daySummary", {
                        defaultValue: `${doneCount}/${dayItems.length}`,
                        done: doneCount,
                        total: dayItems.length,
                      })
                    : t("student.studyPlan.noTasks", { defaultValue: "—" })}
                </p>
              </button>
            );
          })}
        </div>
      </StudentSurface>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <StudentSurface className="space-y-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {editingItemId
              ? t("student.studyPlan.editTask", { defaultValue: isRtl ? "تعديل مهمة" : "Edit task" })
              : t("student.studyPlan.addTask", { defaultValue: "Add task" })}
            {" · "}
            <span className="font-medium text-slate-500">{selectedDay}</span>
          </p>
          <input
            value={taskForm.title}
            onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
            className={studentFieldClass}
            placeholder={t("student.studyPlan.taskTitlePlaceholder", { defaultValue: "Task title" })}
          />
          <textarea
            value={taskForm.notes}
            onChange={(e) => setTaskForm((p) => ({ ...p, notes: e.target.value }))}
            className={`${studentFieldClass} min-h-20`}
            placeholder={t("student.studyPlan.notesPlaceholder", { defaultValue: "Notes (optional)" })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" value={taskForm.scheduledAt} onChange={(e) => setTaskForm((p) => ({ ...p, scheduledAt: e.target.value }))} className={studentFieldClass} />
            <select value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))} className={studentSelectClass}>
              <option value="0">{t("student.studyPlan.priorityNormal", { defaultValue: "Priority: normal" })}</option>
              <option value="1">{t("student.studyPlan.priorityHigh", { defaultValue: "Priority: high" })}</option>
              <option value="2">{t("student.studyPlan.priorityUrgent", { defaultValue: "Priority: urgent" })}</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={taskForm.courseId}
              onChange={(e) => setTaskForm((p) => ({ ...p, courseId: e.target.value, unitId: "", lessonId: "" }))}
              className={studentSelectClass}
            >
              <option value="">{t("student.flashcards.optionalCourse", { defaultValue: "Course (optional)" })}</option>
              {courses.map((course) => (
                <option key={course.id || course.courseId} value={course.id || course.courseId}>
                  {course.title || course.course?.title}
                </option>
              ))}
            </select>
            <select
              value={taskForm.unitId}
              onChange={(e) => setTaskForm((p) => ({ ...p, unitId: e.target.value, lessonId: "" }))}
              className={studentSelectClass}
              disabled={!taskForm.courseId}
            >
              <option value="">{t("student.flashcards.optionalUnit", { defaultValue: "Unit (optional)" })}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {isRtl ? unit.titleAr || unit.title : unit.title}
                </option>
              ))}
            </select>
            <select
              value={taskForm.lessonId}
              onChange={(e) => setTaskForm((p) => ({ ...p, lessonId: e.target.value }))}
              className={studentSelectClass}
              disabled={!taskForm.unitId}
            >
              <option value="">{t("student.flashcards.optionalLesson", { defaultValue: "Lesson (optional)" })}</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {isRtl ? lesson.titleAr || lesson.title : lesson.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={createItem.isPending || updateItem.isPending} onClick={handleSaveTask} className={studentBtnPrimary}>
              {createItem.isPending || updateItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("common.save", { defaultValue: "Save" })}
            </button>
            {editingItemId ? (
              <button type="button" onClick={() => resetTaskForm()} className={studentBtnGhost}>
                {t("common.cancel", { defaultValue: "Cancel" })}
              </button>
            ) : null}
          </div>
        </StudentSurface>

        <StudentSurface padded={false}>
          <div className="border-b border-slate-100 px-4 py-3 dark:border-white/8">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {t("student.studyPlan.dayTasks", { defaultValue: isRtl ? "مهام اليوم المحدد" : "Selected day tasks" })}
            </p>
          </div>
          {selectedDayItems.length ? selectedDayItems.map(renderTaskRow) : <div className="p-8 text-center text-sm text-slate-500">{t("student.studyPlan.emptyDay", { defaultValue: "No tasks on this day." })}</div>}
        </StudentSurface>
      </div>

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
        <div className="border-b border-slate-100 px-4 py-3 dark:border-white/8">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {t("student.studyPlan.allOpen", { defaultValue: isRtl ? "كل المهام المفتوحة" : "All open tasks" })}
          </p>
        </div>
        {openItems.length ? openItems.map(renderTaskRow) : <div className="p-8 text-center text-sm text-slate-500">{t("student.studyPlan.empty", { defaultValue: "No tasks yet." })}</div>}
      </StudentSurface>

      {unscheduled.length ? (
        <StudentSurface padded={false}>
          <div className="border-b border-slate-100 px-4 py-3 dark:border-white/8">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {t("student.studyPlan.unscheduled", { defaultValue: "Unscheduled" })}
            </p>
          </div>
          {unscheduled.map(renderTaskRow)}
        </StudentSurface>
      ) : null}
    </div>
  );
}
