import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, RotateCcw, Shuffle, StepBack, StepForward } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  StudentSurface,
  StudentToolbar,
  studentSelectClass,
  studentBtnPrimary,
  studentBtnGhost,
} from "../../components/student/ui";
import { useStudentFlashcards } from "../../features/student/flashcards/hooks";
import { useMyCourses } from "../../features/student/courses/hooks";
import { useTrialFlashcards, useTrialMe } from "../../features/trial/hooks";
import { useLearningPanelMode } from "../../hooks/useLearningPanelMode";
import { useFlashcardSessionXp } from "../../features/student/gamification/hooks";

function titleFor(card, isRtl) {
  const lesson = card?.lesson;
  const unit = lesson?.section?.unit;
  return [unit ? (isRtl ? unit.titleAr || unit.title : unit.title) : null, lesson ? (isRtl ? lesson.titleAr || lesson.title : lesson.title) : null]
    .filter(Boolean)
    .join(" / ");
}

export default function StudentFlashcards() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const { isTrial } = useLearningPanelMode();
  const [searchParams] = useSearchParams();
  const [courseId, setCourseId] = useState(searchParams.get("courseId") || "");
  const [unitId, setUnitId] = useState(searchParams.get("unitId") || "");
  const [lessonId, setLessonId] = useState(searchParams.get("lessonId") || "");
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const { data: studentCourses = [] } = useMyCourses({ enabled: !isTrial });
  const { data: trialMe } = useTrialMe(isTrial);
  const courses = isTrial ? trialMe?.courses || [] : studentCourses;
  const filters = useMemo(
    () => ({
      ...(courseId ? { courseId } : {}),
      ...(unitId ? { unitId } : {}),
      ...(lessonId ? { lessonId } : {}),
    }),
    [courseId, unitId, lessonId]
  );
  const studentCards = useStudentFlashcards(filters, { enabled: !isTrial });
  const trialCards = useTrialFlashcards(filters, { enabled: isTrial });
  const { data: rawCards = [], isLoading, isError, refetch } = isTrial ? trialCards : studentCards;

  const cards = useMemo(() => {
    const list = [...rawCards];
    if (!shuffleSeed) return list;
    return list
      .map((card, idx) => ({ card, key: Math.sin(shuffleSeed + idx * 9973) }))
      .sort((a, b) => a.key - b.key)
      .map((entry) => entry.card);
  }, [rawCards, shuffleSeed]);

  const units = useMemo(() => {
    const map = new Map();
    for (const card of rawCards) {
      const unit = card?.lesson?.section?.unit;
      if (unit?.id) map.set(unit.id, unit);
    }
    return [...map.values()];
  }, [rawCards]);

  const lessons = useMemo(() => {
    const map = new Map();
    for (const card of rawCards) {
      const unit = card?.lesson?.section?.unit;
      if (unitId && unit?.id !== unitId) continue;
      if (card?.lesson?.id) map.set(card.lesson.id, card.lesson);
    }
    return [...map.values()];
  }, [rawCards, unitId]);

  const card = cards[index] || null;
  const flashXp = useFlashcardSessionXp();
  const flipsRef = useRef(0);
  const awardedBuckets = useRef(new Set());

  useEffect(() => {
    if (index >= cards.length) {
      setIndex(0);
      setShowBack(false);
    }
  }, [cards.length, index]);

  const awardFlashXpIfNeeded = () => {
    if (isTrial) return;
    flipsRef.current += 1;
    if (flipsRef.current < 5) return;
    const bucket = Math.floor((flipsRef.current - 1) / 5);
    if (awardedBuckets.current.has(bucket)) return;
    awardedBuckets.current.add(bucket);
    void flashXp.mutateAsync(`review-${bucket}`).catch(() => {});
  };

  const resetDeck = () => {
    setIndex(0);
    setShowBack(false);
  };

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
            : t("student.flashcards.subtitle", { defaultValue: "Review published cards from courses you currently have access to." })
        }
      />

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

      {!isLoading && !isError && !cards.length ? (
        <EmptyState
          title={t("student.flashcards.empty", { defaultValue: "No flashcards yet" })}
          message={t("student.flashcards.empty", { defaultValue: "No flashcards are available for this filter yet." })}
          icon={Layers}
        />
      ) : null}

      {card ? (
        <div className="space-y-4">
          <StudentSurface>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-slate-500">
              <span>{titleFor(card, isRtl)}</span>
              <span className="tabular-nums">
                {index + 1} / {cards.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowBack((v) => !v);
                awardFlashXpIfNeeded();
              }}
              className="mt-6 min-h-64 w-full rounded-[1.15rem] border border-slate-200/80 bg-slate-50/80 p-8 text-center text-xl font-bold text-slate-900 transition hover:border-[var(--yu-blue-400)] hover:shadow-[var(--shadow-sm)] dark:border-white/10 dark:bg-[#0C1829] dark:text-white"
            >
              {showBack ? (isRtl ? card.backAr || card.back : card.back) : isRtl ? card.frontAr || card.front : card.front}
              {showBack && card.explanation ? (
                <p className="mt-4 text-sm font-normal text-slate-500">{isRtl ? card.explanationAr || card.explanation : card.explanation}</p>
              ) : null}
            </button>
          </StudentSurface>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setIndex((v) => Math.max(0, v - 1))} className={studentBtnGhost}>
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
            <button type="button" onClick={() => setIndex((v) => Math.min(cards.length - 1, v + 1))} className={studentBtnPrimary}>
              {t("common.next", { defaultValue: "Next" })} <StepForward className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
