import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Layers, Pencil, Plus, RotateCcw, Shuffle, StepBack, StepForward, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import BackToLessonBanner from "../../components/student/BackToLessonBanner";
import {
  StudentSurface,
  StudentToolbar,
  studentSelectClass,
  studentFieldClass,
  studentBtnPrimary,
  studentBtnGhost,
} from "../../components/student/ui";
import {
  useCreateMyFlashcard,
  useDeleteMyFlashcard,
  useFlashcardIntervals,
  useMyFlashcards,
  useReviewMyFlashcard,
  useReviewStudentFlashcard,
  useStudentFlashcards,
  useUpdateMyFlashcard,
} from "../../features/student/flashcards/hooks";
import { useCourseUnits, useMyCourses } from "../../features/student/courses/hooks";
import { useTrialFlashcards, useTrialMe } from "../../features/trial/hooks";
import { useLearningPanelMode } from "../../hooks/useLearningPanelMode";
import { useFlashcardSessionXp } from "../../features/student/gamification/hooks";
import { getErrorMessage } from "../../api/error";

function titleFor(card, isRtl) {
  const lesson = card?.lesson;
  const unit = lesson?.section?.unit || card?.unit;
  const course = card?.course;
  return [
    course ? (isRtl ? course.titleAr || course.title : course.title) : null,
    unit ? (isRtl ? unit.titleAr || unit.title : unit.title) : null,
    lesson ? (isRtl ? lesson.titleAr || lesson.title : lesson.title) : null,
  ]
    .filter(Boolean)
    .join(" / ");
}

function DifficultyButtons({ onRate, disabled, intervals, t, isRtl }) {
  const items = [
    {
      key: "EASY",
      label: t("student.flashcards.easy", { defaultValue: isRtl ? "سهل" : "Easy" }),
      days: intervals?.EASY ?? 30,
      className: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
      key: "MEDIUM",
      label: t("student.flashcards.medium", { defaultValue: isRtl ? "متوسط" : "Medium" }),
      days: intervals?.MEDIUM ?? 7,
      className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-500/10 dark:text-amber-300",
    },
    {
      key: "HARD",
      label: t("student.flashcards.hard", { defaultValue: isRtl ? "صعب" : "Hard" }),
      days: intervals?.HARD ?? 3,
      className: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800/50 dark:bg-rose-500/10 dark:text-rose-300",
    },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          disabled={disabled}
          onClick={() => onRate(item.key)}
          className={`rounded-xl border px-3 py-3 text-sm font-bold transition disabled:opacity-50 ${item.className}`}
        >
          <span className="block">{item.label}</span>
          <span className="mt-1 block text-[11px] font-medium opacity-80">
            {t("student.flashcards.showsInDays", {
              defaultValue: isRtl ? `يظهر بعد ${item.days} يوم` : `Shows in ${item.days} days`,
              days: item.days,
            })}
          </span>
        </button>
      ))}
    </div>
  );
}

function StudyDeck({
  cards,
  isRtl,
  t,
  onRate,
  ratingPending,
  intervals,
  isTrial,
}) {
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const flashXp = useFlashcardSessionXp();
  const flipsRef = useRef(0);
  const awardedBuckets = useRef(new Set());

  const shuffled = useMemo(() => {
    const list = [...cards];
    if (!shuffleSeed) return list;
    return list
      .map((card, idx) => ({ card, key: Math.sin(shuffleSeed + idx * 9973) }))
      .sort((a, b) => a.key - b.key)
      .map((entry) => entry.card);
  }, [cards, shuffleSeed]);

  useEffect(() => {
    if (index >= shuffled.length) {
      setIndex(0);
      setShowBack(false);
    }
  }, [shuffled.length, index]);

  useEffect(() => {
    setIndex(0);
    setShowBack(false);
  }, [cards]);

  const card = shuffled[index] || null;

  const awardFlashXpIfNeeded = () => {
    if (isTrial) return;
    flipsRef.current += 1;
    if (flipsRef.current < 5) return;
    const bucket = Math.floor((flipsRef.current - 1) / 5);
    if (awardedBuckets.current.has(bucket)) return;
    awardedBuckets.current.add(bucket);
    void flashXp.mutateAsync(`review-${bucket}`).catch(() => {});
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA" || e.target?.tagName === "SELECT") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setShowBack((v) => !v);
        awardFlashXpIfNeeded();
      } else if (e.key === "ArrowRight") {
        setIndex((v) => Math.min(Math.max(shuffled.length - 1, 0), v + 1));
        setShowBack(false);
      } else if (e.key === "ArrowLeft") {
        setIndex((v) => Math.max(0, v - 1));
        setShowBack(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shuffled.length, isTrial]);

  if (!card) {
    return (
      <EmptyState
        title={t("student.flashcards.caughtUp", { defaultValue: isRtl ? "خلصت البطاقات المستحقة" : "You're caught up" })}
        message={t("student.flashcards.caughtUpHint", {
          defaultValue: isRtl
            ? "ما في بطاقات مستحقة الآن. رجّع لاحقاً حسب تقييمك السابق."
            : "No cards are due right now. Come back later based on your last ratings.",
        })}
        icon={Layers}
      />
    );
  }

  const progressPct = shuffled.length ? Math.round(((index + 1) / shuffled.length) * 100) : 0;
  const frontText = isRtl ? card.frontAr || card.front : card.front;
  const backText = isRtl ? card.backAr || card.back : card.back;
  const explText = isRtl ? card.explanationAr || card.explanation : card.explanation;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--yu-blue-700)]">
              {t("student.flashcards.studyMode", { defaultValue: isRtl ? "وضع المراجعة" : "Study session" })}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {titleFor(card, isRtl) || t("student.flashcards.myDeck", { defaultValue: isRtl ? "بطاقاتي" : "My Flashcards" })}
            </p>
          </div>
          <div className="text-end">
            <p className="text-lg font-black tabular-nums text-slate-900 dark:text-white">
              {index + 1}
              <span className="text-sm font-semibold text-slate-400"> / {shuffled.length}</span>
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              {t("student.flashcards.due", { defaultValue: isRtl ? "مستحق" : "due" })}
            </p>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--yu-blue-700)] to-[var(--yu-blue-400)] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="px-4 py-6 md:px-8">
          <button
            type="button"
            onClick={() => {
              setShowBack((v) => !v);
              awardFlashXpIfNeeded();
            }}
            className="group relative mx-auto flex min-h-[280px] w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-[linear-gradient(160deg,#F8FBFF_0%,#EEF4FC_55%,#F7FAFC_100%)] p-8 text-center shadow-inner transition hover:border-[var(--yu-blue-300)] dark:border-white/10 dark:bg-[linear-gradient(160deg,#0C1829_0%,#12233F_100%)]"
          >
            <span
              className={`absolute start-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                showBack
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                  : "bg-[var(--yu-blue-100)] text-[var(--yu-blue-800)] dark:bg-[var(--yu-blue-700)]/30 dark:text-[var(--yu-blue-100)]"
              }`}
            >
              {showBack
                ? t("student.flashcards.answer", { defaultValue: isRtl ? "الجواب" : "Answer" })
                : t("student.flashcards.question", { defaultValue: isRtl ? "السؤال" : "Question" })}
            </span>
            <p className="text-xl font-black leading-relaxed text-slate-900 md:text-2xl dark:text-white">
              {showBack ? backText : frontText}
            </p>
            {showBack && explText ? (
              <p className="mt-5 max-w-lg text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">{explText}</p>
            ) : null}
            <p className="mt-8 text-[11px] font-semibold text-slate-400 group-hover:text-[var(--yu-blue-600)]">
              {t("student.flashcards.tapToFlip", {
                defaultValue: isRtl ? "اضغط للقلب · Space / Enter" : "Tap to flip · Space / Enter",
              })}
            </p>
          </button>
        </div>
      </div>

      {!isTrial ? (
        <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("student.flashcards.ratePrompt", {
              defaultValue: isRtl ? "قيّم صعوبة البطاقة" : "How hard was this card?",
            })}
          </p>
          <DifficultyButtons
            onRate={async (difficulty) => {
              try {
                await onRate(card.id, difficulty);
                setShowBack(false);
                toast.success(t("student.flashcards.rated", { defaultValue: isRtl ? "تم التسجيل" : "Saved" }));
              } catch (error) {
                toast.error(getErrorMessage(error, t("student.flashcards.rateError", { defaultValue: "Could not save rating." })));
              }
            }}
            disabled={ratingPending}
            intervals={intervals}
            t={t}
            isRtl={isRtl}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIndex((v) => Math.max(0, v - 1));
            setShowBack(false);
          }}
          className={studentBtnGhost}
        >
          <StepBack className="h-4 w-4" /> {t("common.previous", { defaultValue: "Previous" })}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowBack((v) => !v);
            awardFlashXpIfNeeded();
          }}
          className={studentBtnGhost}
        >
          <RotateCcw className="h-4 w-4" /> {t("student.flashcards.flip", { defaultValue: "Flip" })}
        </button>
        <button type="button" onClick={() => setShuffleSeed(Date.now())} className={studentBtnGhost}>
          <Shuffle className="h-4 w-4" /> {t("student.flashcards.shuffle", { defaultValue: "Shuffle" })}
        </button>
        <button
          type="button"
          onClick={() => {
            setIndex((v) => Math.min(shuffled.length - 1, v + 1));
            setShowBack(false);
          }}
          className={studentBtnPrimary}
        >
          {t("common.next", { defaultValue: "Next" })} <StepForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MyFlashcardsManager({ courses, isRtl, t }) {
  const [mode, setMode] = useState("study");
  const [form, setForm] = useState({ front: "", back: "", explanation: "", courseId: "", unitId: "", lessonId: "" });
  const [editingId, setEditingId] = useState(null);

  const studyFilters = useMemo(() => ({ dueOnly: true }), []);
  const manageFilters = useMemo(() => ({}), []);
  const studyQuery = useMyFlashcards(studyFilters, { enabled: mode === "study" });
  const manageQuery = useMyFlashcards(manageFilters, { enabled: mode === "manage" });
  const { data: intervals } = useFlashcardIntervals();
  const review = useReviewMyFlashcard();
  const createCard = useCreateMyFlashcard();
  const updateCard = useUpdateMyFlashcard();
  const deleteCard = useDeleteMyFlashcard();
  const { data: units = [] } = useCourseUnits(form.courseId || undefined);

  const lessons = useMemo(() => {
    const unit = units.find((u) => u.id === form.unitId);
    return unit?.lessons || [];
  }, [units, form.unitId]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ front: "", back: "", explanation: "", courseId: "", unitId: "", lessonId: "" });
  };

  const handleSave = async () => {
    if (!form.front.trim() || !form.back.trim()) {
      toast.error(t("student.flashcards.frontBackRequired", { defaultValue: "Front and back are required." }));
      return;
    }
    const body = {
      front: form.front.trim(),
      back: form.back.trim(),
      explanation: form.explanation.trim() || null,
      courseId: form.courseId || null,
      unitId: form.unitId || null,
      lessonId: form.lessonId || null,
    };
    try {
      if (editingId) await updateCard.mutateAsync({ id: editingId, body });
      else await createCard.mutateAsync(body);
      resetForm();
      toast.success(t("student.flashcards.savedPrivate", { defaultValue: isRtl ? "تم حفظ البطاقة الخاصة" : "Private card saved" }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("student.flashcards.saveError", { defaultValue: "Could not save card." })));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode("study")} className={mode === "study" ? studentBtnPrimary : studentBtnGhost}>
          {t("student.flashcards.studyMine", { defaultValue: isRtl ? "مراجعة بطاقاتي" : "Study mine" })}
        </button>
        <button type="button" onClick={() => setMode("manage")} className={mode === "manage" ? studentBtnPrimary : studentBtnGhost}>
          <Plus className="h-4 w-4" />
          {t("student.flashcards.manageMine", { defaultValue: isRtl ? "إدارة بطاقاتي" : "Manage mine" })}
        </button>
      </div>

      {mode === "study" ? (
        studyQuery.isLoading ? (
          <StudentSurface>
            <p className="text-sm text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
          </StudentSurface>
        ) : (
          <StudyDeck
            cards={studyQuery.data || []}
            isRtl={isRtl}
            t={t}
            intervals={intervals}
            ratingPending={review.isPending}
            isTrial={false}
            onRate={(id, difficulty) => review.mutateAsync({ id, difficulty })}
          />
        )
      ) : (
        <div className="space-y-4">
          <StudentSurface className="space-y-3">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId
                ? t("student.flashcards.editPrivate", { defaultValue: isRtl ? "تعديل بطاقة خاصة" : "Edit private card" })
                : t("student.flashcards.addPrivate", { defaultValue: isRtl ? "إضافة بطاقة خاصة" : "Add private card" })}
            </p>
            <textarea
              value={form.front}
              onChange={(e) => setForm((p) => ({ ...p, front: e.target.value }))}
              placeholder={t("student.flashcards.front", { defaultValue: "Front" })}
              className={`${studentFieldClass} min-h-24`}
            />
            <textarea
              value={form.back}
              onChange={(e) => setForm((p) => ({ ...p, back: e.target.value }))}
              placeholder={t("student.flashcards.back", { defaultValue: "Back" })}
              className={`${studentFieldClass} min-h-24`}
            />
            <textarea
              value={form.explanation}
              onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
              placeholder={t("student.flashcards.explanationOptional", { defaultValue: "Explanation (optional)" })}
              className={`${studentFieldClass} min-h-20`}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={form.courseId}
                onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value, unitId: "", lessonId: "" }))}
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
                value={form.unitId}
                onChange={(e) => setForm((p) => ({ ...p, unitId: e.target.value, lessonId: "" }))}
                className={studentSelectClass}
                disabled={!form.courseId}
              >
                <option value="">{t("student.flashcards.optionalUnit", { defaultValue: "Unit (optional)" })}</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {isRtl ? unit.titleAr || unit.title : unit.title}
                  </option>
                ))}
              </select>
              <select
                value={form.lessonId}
                onChange={(e) => setForm((p) => ({ ...p, lessonId: e.target.value }))}
                className={studentSelectClass}
                disabled={!form.unitId}
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
              <button type="button" onClick={handleSave} disabled={createCard.isPending || updateCard.isPending} className={studentBtnPrimary}>
                {t("common.save", { defaultValue: "Save" })}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className={studentBtnGhost}>
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </button>
              ) : null}
            </div>
          </StudentSurface>

          {(manageQuery.data || []).length === 0 ? (
            <EmptyState
              title={t("student.flashcards.noPrivate", { defaultValue: isRtl ? "ما في بطاقات خاصة بعد" : "No private cards yet" })}
              message={t("student.flashcards.noPrivateHint", {
                defaultValue: isRtl ? "أضف بطاقات لنفسك فقط — منفصلة عن بطاقات المنصة." : "Add cards only you can see — separate from platform cards.",
              })}
              icon={Layers}
            />
          ) : (
            <div className="space-y-2">
              {(manageQuery.data || []).map((card) => (
                <StudentSurface key={card.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">{isRtl ? card.frontAr || card.front : card.front}</p>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{isRtl ? card.backAr || card.back : card.back}</p>
                    {titleFor(card, isRtl) ? <p className="mt-2 text-xs text-slate-400">{titleFor(card, isRtl)}</p> : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className={studentBtnGhost}
                      onClick={() => {
                        setEditingId(card.id);
                        setForm({
                          front: card.front || "",
                          back: card.back || "",
                          explanation: card.explanation || "",
                          courseId: card.courseId || "",
                          unitId: card.unitId || "",
                          lessonId: card.lessonId || "",
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={studentBtnGhost}
                      onClick={async () => {
                        try {
                          await deleteCard.mutateAsync(card.id);
                          toast.success(t("student.flashcards.deleted", { defaultValue: "Deleted" }));
                        } catch (error) {
                          toast.error(getErrorMessage(error, t("student.flashcards.deleteError", { defaultValue: "Could not delete." })));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </StudentSurface>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentFlashcards() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const { isTrial } = useLearningPanelMode();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("platform");
  const [courseId, setCourseId] = useState(searchParams.get("courseId") || "");
  const [unitId, setUnitId] = useState(searchParams.get("unitId") || "");
  const [lessonId, setLessonId] = useState(searchParams.get("lessonId") || "");

  const { data: studentCourses = [] } = useMyCourses({ enabled: !isTrial });
  const { data: trialMe } = useTrialMe(isTrial);
  const courses = isTrial ? trialMe?.courses || [] : studentCourses;
  const filters = useMemo(
    () => ({
      ...(courseId ? { courseId } : {}),
      ...(unitId ? { unitId } : {}),
      ...(lessonId ? { lessonId } : {}),
      dueOnly: !isTrial,
    }),
    [courseId, unitId, lessonId, isTrial]
  );
  const catalogFilters = useMemo(
    () => ({
      ...(courseId ? { courseId } : {}),
      dueOnly: false,
    }),
    [courseId]
  );

  const studentCards = useStudentFlashcards(filters, { enabled: !isTrial && tab === "platform" });
  const catalogCards = useStudentFlashcards(catalogFilters, { enabled: !isTrial && tab === "platform" });
  const trialCards = useTrialFlashcards(
    {
      ...(courseId ? { courseId } : {}),
      ...(unitId ? { unitId } : {}),
      ...(lessonId ? { lessonId } : {}),
    },
    { enabled: isTrial }
  );
  const { data: rawCards = [], isLoading, isError, refetch } = isTrial ? trialCards : studentCards;
  const { data: intervals } = useFlashcardIntervals({ enabled: !isTrial });
  const reviewPlatform = useReviewStudentFlashcard();

  const units = useMemo(() => {
    const source = isTrial ? rawCards : catalogCards.data || rawCards;
    const map = new Map();
    for (const card of source) {
      const unit = card?.lesson?.section?.unit;
      if (unit?.id) map.set(unit.id, unit);
    }
    return [...map.values()];
  }, [rawCards, catalogCards.data, isTrial]);

  const lessons = useMemo(() => {
    const source = isTrial ? rawCards : catalogCards.data || rawCards;
    const map = new Map();
    for (const card of source) {
      const unit = card?.lesson?.section?.unit;
      if (unitId && unit?.id !== unitId) continue;
      if (card?.lesson?.id) map.set(card.lesson.id, card.lesson);
    }
    return [...map.values()];
  }, [rawCards, catalogCards.data, unitId, isTrial]);

  const resetDeck = () => {};

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={t("student.flashcards.title", { defaultValue: "Flashcards" })}
        subtitle={
          isTrial
            ? t("trial.flashcardsSubtitle", {
                defaultValue: isRtl
                  ? "راجع بطاقات كورسات التجربة على هذا الجهاز — اقلب البطاقة واختبر نفسك."
                  : "Review flashcards from your trial courses on this device — flip and self-test.",
              })
            : t("student.flashcards.subtitleSrs", {
                defaultValue: isRtl
                  ? "راجع البطاقات المستحقة وقيّم صعوبتها. بطاقاتك الخاصة منفصلة عن بطاقات المنصة."
                  : "Review due cards and rate difficulty. Your private cards stay separate from platform cards.",
              })
        }
      />

      <BackToLessonBanner courseId={courseId} lessonId={lessonId} />

      {!isTrial ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("platform")} className={tab === "platform" ? studentBtnPrimary : studentBtnGhost}>
            {t("student.flashcards.platform", { defaultValue: isRtl ? "بطاقات المنصة" : "Platform cards" })}
          </button>
          <button type="button" onClick={() => setTab("mine")} className={tab === "mine" ? studentBtnPrimary : studentBtnGhost}>
            {t("student.flashcards.myFlashcards", { defaultValue: isRtl ? "بطاقاتي" : "My Flashcards" })}
          </button>
        </div>
      ) : null}

      {tab === "mine" && !isTrial ? (
        <MyFlashcardsManager courses={courses} isRtl={isRtl} t={t} />
      ) : (
        <>
          <StudentToolbar>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setUnitId("");
                setLessonId("");
                resetDeck();
              }}
              className={studentSelectClass}
            >
              <option value="">{t("student.flashcards.allCourses", { defaultValue: "All courses" })}</option>
              {courses.map((course) => (
                <option key={course.id || course.courseId} value={course.id || course.courseId}>
                  {course.title || course.course?.title}
                </option>
              ))}
            </select>
            <select
              value={unitId}
              onChange={(e) => {
                setUnitId(e.target.value);
                setLessonId("");
                resetDeck();
              }}
              className={studentSelectClass}
            >
              <option value="">{t("student.flashcards.allSystems", { defaultValue: "All systems" })}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {isRtl ? unit.titleAr || unit.title : unit.title}
                </option>
              ))}
            </select>
            <select
              value={lessonId}
              onChange={(e) => {
                setLessonId(e.target.value);
                resetDeck();
              }}
              className={studentSelectClass}
            >
              <option value="">{t("student.flashcards.allLectures", { defaultValue: "All lectures" })}</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {isRtl ? lesson.titleAr || lesson.title : lesson.title}
                </option>
              ))}
            </select>
          </StudentToolbar>

          {isLoading ? (
            <StudentSurface>
              <p className="text-sm text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
            </StudentSurface>
          ) : null}

          {isError ? (
            <EmptyState
              title={t("student.flashcards.retry", { defaultValue: "Could not load flashcards" })}
              message={t("student.flashcards.retry", { defaultValue: "Could not load flashcards. Retry" })}
              icon={Layers}
              action={
                <button type="button" onClick={() => refetch()} className={studentBtnPrimary}>
                  {t("takeExam.retry", { defaultValue: "Retry" })}
                </button>
              }
            />
          ) : null}

          {!isLoading && !isError ? (
            <StudyDeck
              cards={rawCards}
              isRtl={isRtl}
              t={t}
              intervals={intervals}
              ratingPending={reviewPlatform.isPending}
              isTrial={isTrial}
              onRate={(id, difficulty) => reviewPlatform.mutateAsync({ id, difficulty })}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
