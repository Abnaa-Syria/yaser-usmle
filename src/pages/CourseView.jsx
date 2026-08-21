import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Layers,
  Loader2,
  Menu,
  Moon,
  Play,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCourseUnits, useMyCourses } from "../features/student/courses/hooks";
import { accessBadgeClass, formatAccessRemaining } from "../utils/accessRemaining";
import {
  useCompletedLessonIds,
  useCourseProgressStats,
  useCourseResume,
  useMarkLessonComplete,
  useTrackLessonAccess,
} from "../features/student/progress/hooks";
import { useLessonResources } from "../features/student/resources/hooks";
import LessonQna from "../components/student/LessonQna";
import LessonVideoPlayer, { lessonHasPlayableVideo } from "../components/student/LessonVideoPlayer";
import { useStudentExams } from "../features/student/exams/hooks";
import { useClaimCertificate, useDownloadStudentCertificate, useMyCertificates } from "../features/student/certificates/hooks";
import { getErrorMessage } from "../api/error";
import { downloadBlob } from "../utils/certificate";
import { sanitizeRichHtml } from "../utils/htmlContent";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";
import toast from "react-hot-toast";

function ProgressRing({ value, size = 56, stroke = 5 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200 dark:text-white/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[var(--yu-blue-600)] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black tabular-nums text-slate-800 dark:text-white">
        {Math.round(value)}%
      </span>
    </div>
  );
}

function LessonRow({ lesson, active, done, onSelect, index }) {
  const hasVideo = lessonHasPlayableVideo(lesson);
  return (
    <button
      type="button"
      onClick={() => onSelect?.(lesson)}
      className={[
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all",
        active
          ? "bg-[var(--yu-blue-700)] text-white shadow-[var(--shadow-cta)]"
          : "text-slate-600 hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-white/5",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black tabular-nums",
          active ? "bg-white/20 text-white" : done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-white/5",
        ].join(" ")}
      >
        {done && !active ? <Check className="h-3.5 w-3.5" /> : index}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-xs font-bold ${active ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>{lesson.title}</span>
        <span className={`mt-0.5 block text-[10px] font-medium ${active ? "text-white/70" : "text-slate-400"}`}>
          {hasVideo ? "Video" : "Lesson"}
        </span>
      </span>
      {hasVideo && !active ? <Play className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[var(--yu-blue-600)]" /> : null}
    </button>
  );
}

function UnitBlock({ unit, activeId, doneSet, onSelect, defaultOpen = false, lessonIndexMap }) {
  const lessons = unit.lessons || [];
  const sections = (unit.sections || []).filter((s) => (s.lessons || []).length > 0);
  const hasSections = sections.length > 0;
  const containsActive = lessons.some((l) => l.id === activeId) || sections.some((s) => (s.lessons || []).some((l) => l.id === activeId));
  const [open, setOpen] = useState(defaultOpen || containsActive);
  const doneInUnit = lessons.filter((l) => doneSet.has(l.id)).length;

  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive, activeId, unit.id]);

  const renderLesson = (lesson) => (
    <LessonRow
      key={lesson.id}
      lesson={lesson}
      index={(lessonIndexMap?.get(lesson.id) ?? 0) + 1}
      active={lesson.id === activeId}
      done={doneSet.has(lesson.id)}
      onSelect={onSelect}
    />
  );

  return (
    <div className="border-b border-slate-100/80 last:border-0 dark:border-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-start transition-colors hover:bg-white/60 dark:hover:bg-white/[0.03]"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{unit.title}</span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {doneInUnit}/{lessons.length || 0}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-1 px-3 pb-3">
              {hasSections
                ? sections.map((section) => (
                    <div key={section.id} className="pt-1">
                      {sections.length > 1 || section.title ? (
                        <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{section.title}</p>
                      ) : null}
                      {(section.lessons || []).map((lesson) => renderLesson(lesson))}
                    </div>
                  ))
                : lessons.map((lesson) => renderLesson(lesson))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ToolTile({ to, icon: Icon, title, hint, tone = "blue", disabled }) {
  const tones = {
    blue: "from-[var(--yu-blue-700)]/12 via-[var(--yu-blue-500)]/5 to-transparent text-[var(--yu-blue-700)]",
    amber: "from-amber-500/15 via-amber-400/5 to-transparent text-amber-700",
    emerald: "from-emerald-500/12 via-emerald-400/5 to-transparent text-emerald-700",
  };
  const className = [
    "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-start shadow-[var(--shadow-sm)] transition duration-300",
    "hover:-translate-y-0.5 hover:border-[var(--yu-blue-200)] hover:shadow-[var(--shadow-md)]",
    "dark:border-white/8 dark:bg-[#0F1E38]/90",
    disabled ? "pointer-events-none opacity-55" : "",
  ].join(" ");

  const body = (
    <>
      <div className={`absolute -end-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-80 blur-2xl ${tones[tone]}`} aria-hidden />
      <div className={`relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="relative text-sm font-black text-slate-900 dark:text-white">{title}</p>
      <p className="relative mt-1 text-xs font-medium leading-5 text-slate-500">{hint}</p>
      <span className="relative mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--yu-blue-700)] opacity-0 transition group-hover:opacity-100">
        Open <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
      </span>
    </>
  );

  if (disabled) return <div className={className}>{body}</div>;
  return (
    <Link to={to} className={className}>
      {body}
    </Link>
  );
}

function CertificatePanel({
  t,
  hasCertificate,
  existingCert,
  certClaimErr,
  claimingCert,
  downloadingCert,
  onClaim,
  onDownload,
}) {
  return (
    <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-[var(--yu-blue-200)] bg-gradient-to-br from-[var(--yu-blue-50)] to-white p-4 dark:border-[var(--yu-blue-800)] dark:from-[var(--yu-blue-700)]/20 dark:to-[#0C1829]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--yu-blue-700)] text-white shadow-[var(--shadow-cta)]">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[var(--yu-blue-800)] dark:text-[var(--yu-blue-200)]">
            {t("courseView.certificate.completeTitle", { defaultValue: "Course completed!" })}
          </p>
          {hasCertificate ? (
            <p className="mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {t("courseView.certificate.issued", { defaultValue: "Certificate issued" })}
              {existingCert?.issuedAt ? ` · ${new Date(existingCert.issuedAt).toLocaleDateString()}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {t("courseView.certificate.ready", { defaultValue: "Claim your certificate of completion." })}
            </p>
          )}
          {certClaimErr ? <p className="mt-1 text-[11px] text-red-600">{certClaimErr}</p> : null}
          {!hasCertificate ? (
            <button
              type="button"
              disabled={claimingCert}
              onClick={onClaim}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-3 py-2.5 text-xs font-bold text-white shadow-[var(--shadow-cta)] hover:bg-[var(--yu-blue-600)] disabled:opacity-50"
            >
              {claimingCert ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {t("courseView.certificate.claim", { defaultValue: "Claim certificate" })}
            </button>
          ) : (
            <div className="mt-3 space-y-2">
              <button
                type="button"
                disabled={downloadingCert}
                onClick={onDownload}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-3 py-2.5 text-xs font-bold text-white shadow-[var(--shadow-cta)] hover:bg-[var(--yu-blue-600)] disabled:opacity-50"
              >
                {downloadingCert ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                {t("courseView.certificate.download", { defaultValue: "Download certificate" })}
              </button>
              {existingCert?.links?.verifyUrl ? (
                <Link to={existingCert.links.verifyUrl} className="block text-center text-[11px] font-semibold text-[var(--yu-blue-700)] hover:underline">
                  {t("courseView.certificate.verifyLink", { defaultValue: "Verification link" })}
                </Link>
              ) : null}
              <Link to="/student/certificates" className="block text-center text-[11px] font-semibold text-slate-500 hover:underline">
                {t("courseView.certificate.viewAll", { defaultValue: "View all certificates" })}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseView() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const { id: courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const lessonIdFromUrl = searchParams.get("lessonId");

  const {
    data: units = [],
    isLoading: unitsLoading,
    isError: unitsError,
    refetch: refetchUnits,
  } = useCourseUnits(courseId);
  const { data: myCourses = [] } = useMyCourses();
  const courseAccess = useMemo(() => {
    const row = myCourses.find((c) => String(c.id) === String(courseId) || String(c.courseId) === String(courseId));
    return formatAccessRemaining(row?.expiresAt, { isAr: isRtl });
  }, [myCourses, courseId, isRtl]);
  const { data: stats } = useCourseProgressStats(courseId || undefined);
  const { data: resume } = useCourseResume(courseId || undefined);
  const { data: completedIds = [], refetch: refetchCompleted } = useCompletedLessonIds(courseId || undefined);
  const doneSet = useMemo(() => new Set(completedIds), [completedIds]);

  const markComplete = useMarkLessonComplete();
  const { mutate: trackLessonAccess } = useTrackLessonAccess();

  const flatLessons = useMemo(
    () =>
      (units || []).flatMap((u) =>
        (u.sections || []).flatMap((section) =>
          (section.lessons || []).map((l) => ({
            ...l,
            unitTitle: u.title,
            unitId: u.id,
            sectionTitle: section.title || null,
          }))
        )
      ),
    [units]
  );

  const lessonIndexMap = useMemo(() => {
    const map = new Map();
    flatLessons.forEach((l, i) => map.set(l.id, i));
    return map;
  }, [flatLessons]);

  const hasLessons = flatLessons.length > 0;

  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const lessonNav = useMemo(() => {
    if (!activeLesson?.id || flatLessons.length === 0) return { prev: null, next: null, index: 0 };
    const idx = flatLessons.findIndex((l) => l.id === activeLesson.id);
    if (idx < 0) return { prev: null, next: null, index: 0 };
    return {
      prev: idx > 0 ? flatLessons[idx - 1] : null,
      next: idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null,
      index: idx,
    };
  }, [activeLesson?.id, flatLessons]);

  useEffect(() => {
    if (!courseId || flatLessons.length === 0) return;
    if (activeLesson && flatLessons.some((l) => l.id === activeLesson.id)) {
      if (lessonIdFromUrl && lessonIdFromUrl !== activeLesson.id) {
        const fromUrl = flatLessons.find((l) => l.id === lessonIdFromUrl);
        if (fromUrl) setActiveLesson(fromUrl);
      }
      return;
    }
    const fromUrl = lessonIdFromUrl ? flatLessons.find((l) => l.id === lessonIdFromUrl) : null;
    const rid = resume?.lessonId;
    const pick = fromUrl || (rid ? flatLessons.find((l) => l.id === rid) : null) || flatLessons[0];
    if (pick) setActiveLesson(pick);
  }, [courseId, flatLessons, resume, activeLesson, lessonIdFromUrl]);

  useEffect(() => {
    if (!activeLesson?.id) return;
    setSearchParams(
      (prev) => {
        if (prev.get("lessonId") === activeLesson.id) return prev;
        const next = new URLSearchParams(prev);
        next.set("lessonId", activeLesson.id);
        return next;
      },
      { replace: true }
    );
  }, [activeLesson?.id, setSearchParams]);

  useEffect(() => {
    if (!courseId || !activeLesson?.id) return;
    trackLessonAccess({ lessonId: activeLesson.id, courseId, watchPercentage: 0, timeSpentDelta: 0 });
  }, [courseId, activeLesson?.id, trackLessonAccess]);

  const handleVideoProgress = (progress) => {
    if (!courseId || !activeLesson?.id) return;
    trackLessonAccess({
      lessonId: activeLesson.id,
      courseId,
      watchPercentage: progress.percent,
      lastWatchedPosition: Math.floor(progress.currentTime || 0),
      timeSpentDelta: progress.timeSpentDelta || 0,
    });
    if (progress.percent >= 90) {
      void refetchCompleted();
    }
  };

  const handleVideoEnded = () => {
    if (!courseId || !activeLesson?.id) return;
    void markComplete.mutateAsync({ lessonId: activeLesson.id, courseId }).then(() => refetchCompleted());
  };

  useEffect(() => {
    if (activeLesson?.id) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeLesson?.id]);

  const { data: resourcesData } = useLessonResources(activeLesson?.id);
  const resources = Array.isArray(resourcesData) && resourcesData.length ? resourcesData : activeLesson?.resources || [];
  const { data: lessonExams = [] } = useStudentExams({
    courseId,
    unitId: activeLesson?.unitId,
    lessonId: activeLesson?.id,
  });
  const lessonQuizLink = useMemo(() => {
    if (!activeLesson?.id || lessonExams.length === 0) return null;
    const qs = `courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(activeLesson.id)}`;
    if (lessonExams.length === 1) return `/student/exams/${lessonExams[0].id}?${qs}`;
    return `/student/exams?${qs}`;
  }, [activeLesson?.id, courseId, lessonExams]);
  const lessonFlashcardCount = activeLesson?.flashcards?.length || 0;
  const { data: certificates = [] } = useMyCertificates();
  const claimCertificate = useClaimCertificate();
  const downloadCertificate = useDownloadStudentCertificate();
  const [certClaimErr, setCertClaimErr] = useState("");
  const [claimingCert, setClaimingCert] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const pct = stats?.percentage != null ? Math.round(Number(stats.percentage)) : 0;
  const completedCount = stats?.completedLessons ?? doneSet.size;
  const isCourseComplete = Boolean(stats?.isCourseCompleted) || pct >= 100;
  const hasCertificate = certificates.some((c) => c.courseId === courseId);
  const existingCert = certificates.find((c) => c.courseId === courseId);
  const lessonDone = activeLesson ? doneSet.has(activeLesson.id) : false;
  const hasVideo = activeLesson ? lessonHasPlayableVideo(activeLesson) : false;

  const handleClaimCertificate = async () => {
    if (!courseId) return;
    setCertClaimErr("");
    setClaimingCert(true);
    try {
      const blob = await claimCertificate.mutateAsync(courseId);
      downloadBlob(blob, `certificate-${courseId}.pdf`);
    } catch (e) {
      setCertClaimErr(getErrorMessage(e, t("courseView.certificate.claimError", { defaultValue: "Could not claim certificate." })));
    } finally {
      setClaimingCert(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!existingCert?.id) return;
    setCertClaimErr("");
    setDownloadingCert(true);
    try {
      const blob = await downloadCertificate.mutateAsync(existingCert.id);
      downloadBlob(blob, `certificate-${existingCert.serialNumber}.pdf`);
    } catch (e) {
      setCertClaimErr(getErrorMessage(e, t("courseView.certificate.downloadError", { defaultValue: "Could not download certificate." })));
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleMarkDone = async () => {
    if (!courseId || !activeLesson) return;
    try {
      const data = await markComplete.mutateAsync({ lessonId: activeLesson.id, courseId });
      await refetchCompleted();
      const xpAmount = data?.xp?.awarded ? data.xp.amount : data?.xp?.amount;
      if (data?.xp?.awarded && xpAmount) {
        toast.success(
          t("student.gamification.lessonXpToast", {
            amount: xpAmount,
            defaultValue: "+{{amount}} XP for completing this lesson",
          })
        );
      }
    } catch {
      /* ignore */
    }
  };

  const curriculum = (
    <>
      <div className="border-b border-slate-100/80 p-5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <ProgressRing value={pct} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t("courseView.sidebarTitle")}
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
              {completedCount}/{flatLessons.length || 0}{" "}
              <span className="font-semibold text-slate-500">{t("courseView.lessonsCompleted")}</span>
            </p>
          </div>
        </div>
      </div>
      {isCourseComplete ? (
        <CertificatePanel
          t={t}
          hasCertificate={hasCertificate}
          existingCert={existingCert}
          certClaimErr={certClaimErr}
          claimingCert={claimingCert}
          downloadingCert={downloadingCert}
          onClaim={() => void handleClaimCertificate()}
          onDownload={() => void handleDownloadCertificate()}
        />
      ) : null}
      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pb-4">
        {units.map((u, idx) => (
          <UnitBlock
            key={u.id}
            unit={u}
            activeId={activeLesson?.id}
            doneSet={doneSet}
            defaultOpen={idx === 0}
            lessonIndexMap={lessonIndexMap}
            onSelect={(l) => setActiveLesson(l)}
          />
        ))}
      </div>
    </>
  );

  if (!courseId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("courseView.needCohort.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("courseView.needCohort.body")}</p>
        <Link to="/student/classes" className="mt-6 inline-block rounded-xl bg-[var(--yu-blue-700)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--yu-blue-600)]">
          {t("courseView.needCohort.cta")}
        </Link>
      </div>
    );
  }

  if (unitsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--yu-blue-700)]" />
        {t("dashboard.common.loading", { defaultValue: "Loading…" })}
      </div>
    );
  }

  if (unitsError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("courseView.loadErrorTitle", { defaultValue: "Could not load this course" })}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("courseView.loadErrorBody", { defaultValue: "Check your connection and try again." })}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => void refetchUnits()} className="rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--yu-blue-600)]">
            {t("takeExam.retry", { defaultValue: "Retry" })}
          </button>
          <Link to="/student/classes" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
            {t("courseView.needCohort.cta")}
          </Link>
        </div>
      </div>
    );
  }

  if (!units.length || !hasLessons) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("courseView.emptyCurriculumTitle", { defaultValue: "No lessons yet" })}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("courseView.emptyCurriculumBody", { defaultValue: "This course has no published curriculum, or you may need to refresh." })}</p>
        <Link to="/student/classes" className="mt-6 inline-block rounded-xl bg-[var(--yu-blue-700)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--yu-blue-600)]">
          {t("courseView.needCohort.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#F7F9FC_0%,#EEF3FA_45%,#F8FAFC_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,#07111F_0%,#0B1730_50%,#0A1424_100%)] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_60%)]" aria-hidden />

      <header className="relative z-10 border-b border-white/60 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-white/5 dark:bg-[#0B1730]/70 md:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
          <Link
            to="/student/classes"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[var(--yu-blue-200)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {t("courseView.backToClasses")}
          </Link>
          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-[var(--yu-blue-600)]" />
            {lessonNav.index + 1} / {flatLessons.length}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accessBadgeClass(courseAccess.tone)}`}>
              {courseAccess.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[var(--yu-blue-200)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              aria-label={t("common.toggleTheme", { defaultValue: "Toggle theme" })}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
              {t("courseView.sidebarTitle")}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-[1400px] gap-0 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="hidden w-[300px] shrink-0 overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white/80 shadow-[var(--shadow-sm)] backdrop-blur-xl dark:border-white/8 dark:bg-[#0F1E38]/85 lg:block">
          {curriculum}
        </aside>

        <AnimatePresence>
          {sidebarOpen ? (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
                aria-label="close"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: isRtl ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? "100%" : "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="relative z-50 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl dark:bg-[#0F1E38]"
              >
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/8">
                  <span className="text-sm font-black">{t("courseView.sidebarTitle")}</span>
                  <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-white/5">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {units.map((u, idx) => (
                    <UnitBlock
                      key={u.id}
                      unit={u}
                      activeId={activeLesson?.id}
                      doneSet={doneSet}
                      defaultOpen={idx === 0}
                      lessonIndexMap={lessonIndexMap}
                      onSelect={(l) => {
                        setActiveLesson(l);
                        setSidebarOpen(false);
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        <main className="min-w-0 flex-1 px-4 py-5 lg:px-0 lg:py-0">
          {activeLesson ? (
            <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              {/* Cinema player */}
              <section
                className={[
                  "relative overflow-hidden rounded-[1.6rem] border border-slate-200/80 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)]",
                  hasVideo ? "border-slate-900/20 bg-slate-950" : "bg-white dark:border-white/8 dark:bg-[#0F1E38]",
                ].join(" ")}
              >
                {hasVideo ? (
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <LessonVideoPlayer
                      lessonId={activeLesson.id}
                      title={activeLesson.title}
                      videoUrl={activeLesson.videoUrl}
                      vdoCipherVideoId={activeLesson.vdoCipherVideoId}
                      onProgress={handleVideoProgress}
                      onEnded={handleVideoEnded}
                    />
                  </div>
                ) : (
                  <div className="relative flex min-h-[240px] flex-col items-center justify-center gap-4 overflow-hidden px-6 py-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.12),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_40%)]" aria-hidden />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[var(--yu-blue-200)] bg-[var(--yu-blue-50)] shadow-inner"
                    >
                      <BookOpen className="h-7 w-7 text-[var(--yu-blue-700)]" />
                    </motion.div>
                    <div className="relative text-center">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {t("courseView.readingLesson", { defaultValue: isRtl ? "درس قراءة" : "Reading lesson" })}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {t("courseView.videoPlaceholder", { defaultValue: "No video for this lesson." })}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Lesson command bar */}
              <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-[var(--shadow-sm)] backdrop-blur-xl dark:border-white/8 dark:bg-[#0F1E38]/90">
                <div className="border-b border-slate-100/80 px-5 py-5 dark:border-white/5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {lessonDone ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("courseView.markedDone")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--yu-blue-50)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--yu-blue-800)] dark:bg-[var(--yu-blue-700)]/20 dark:text-[var(--yu-blue-200)]">
                            <Sparkles className="h-3 w-3" />
                            {t("courseView.inProgress", { defaultValue: isRtl ? "قيد الدراسة" : "In progress" })}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {lessonNav.index + 1} / {flatLessons.length}
                        </span>
                      </div>
                      <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">{activeLesson.title}</h1>
                      <p className="mt-1.5 text-sm font-medium text-slate-500">
                        {[activeLesson.unitTitle, activeLesson.sectionTitle].filter(Boolean).join(" · ")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {lessonNav.prev ? (
                        <button
                          type="button"
                          onClick={() => setActiveLesson(lessonNav.prev)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[var(--yu-blue-200)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                          {t("courseView.prev")}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={markComplete.isPending || lessonDone}
                        onClick={() => void handleMarkDone()}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-cta)] transition disabled:cursor-not-allowed disabled:opacity-55",
                          lessonDone
                            ? "bg-emerald-600 text-white"
                            : "bg-[var(--yu-blue-700)] text-white hover:bg-[var(--yu-blue-600)]",
                        ].join(" ")}
                      >
                        {markComplete.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : lessonDone ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        {lessonDone
                          ? t("courseView.markedDone")
                          : t("courseView.markComplete", { defaultValue: "Mark complete" })}
                      </button>
                      {lessonNav.next ? (
                        <button
                          type="button"
                          onClick={() => setActiveLesson(lessonNav.next)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--yu-blue-200)] bg-[var(--yu-blue-50)] px-3.5 py-2.5 text-sm font-bold text-[var(--yu-blue-800)] transition hover:bg-[var(--yu-blue-100)] dark:border-[var(--yu-blue-800)] dark:bg-[var(--yu-blue-700)]/20 dark:text-[var(--yu-blue-200)]"
                        >
                          {t("courseView.next")}
                          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">{t("courseView.lastLessonHint")}</span>
                      )}
                    </div>
                  </div>
                  {!lessonDone ? (
                    <p className="mt-3 text-[11px] font-semibold text-slate-400">
                      {t("student.gamification.lessonXpHint", { defaultValue: "+15 XP when you complete this lesson" })}
                    </p>
                  ) : null}
                </div>

                {(activeLesson.description || activeLesson.content) && (
                  <div className="space-y-3 border-b border-slate-100/80 px-5 py-5 text-sm leading-7 text-slate-600 dark:border-white/5 dark:text-slate-300 sm:px-6">
                    {activeLesson.description ? <p className="font-medium">{activeLesson.description}</p> : null}
                    {activeLesson.content ? (
                      <div
                        className="course-rich-html space-y-2 [&_a]:font-semibold [&_a]:text-[var(--yu-blue-700)] [&_a]:underline [&_img]:max-w-full [&_img]:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(activeLesson.content) }}
                      />
                    ) : null}
                  </div>
                )}

                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:px-6">
                  <ToolTile
                    to={`/student/flashcards?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(activeLesson.id)}`}
                    icon={Layers}
                    tone="blue"
                    title={t("courseView.lessonFlashcards", { defaultValue: "Lecture flashcards" })}
                    hint={
                      lessonFlashcardCount
                        ? t("courseView.lessonFlashcardsCount", { count: lessonFlashcardCount, defaultValue: "{{count}} cards" })
                        : t("courseView.lessonFlashcardsEmpty", { defaultValue: "Review key points for this lecture" })
                    }
                  />
                  <ToolTile
                    to={lessonQuizLink || "#"}
                    icon={ClipboardList}
                    tone="amber"
                    title={t("courseView.lessonQuiz", { defaultValue: "Lecture quiz" })}
                    hint={
                      lessonExams.length
                        ? t("courseView.lessonQuizCount", { count: lessonExams.length, defaultValue: "{{count}} available" })
                        : t("courseView.lessonQuizEmpty", { defaultValue: "No quiz linked yet" })
                    }
                    disabled={!lessonQuizLink}
                  />
                  <ToolTile
                    to="/student/study-plan"
                    icon={CalendarDays}
                    tone="emerald"
                    title={t("courseView.addToStudyPlan", { defaultValue: "Study plan" })}
                    hint={t("courseView.addToStudyPlanHint", { defaultValue: "Schedule this lecture in your week" })}
                  />
                </div>
              </section>

              {/* Materials */}
              <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-[var(--shadow-sm)] backdrop-blur-xl dark:border-white/8 dark:bg-[#0F1E38]/90">
                <div className="flex items-center justify-between border-b border-slate-100/80 px-5 py-4 dark:border-white/5 sm:px-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--yu-blue-700)]" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{t("courseView.tabs.materials")}</h3>
                  </div>
                  {resources.length ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/5">{resources.length}</span>
                  ) : null}
                </div>
                {resources.length === 0 ? (
                  <div className="px-5 py-10 text-center sm:px-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 dark:bg-white/5">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{t("courseView.noMaterials")}</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-white/5">
                    {resources.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--yu-blue-50)] text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/20">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{r.title}</span>
                        </div>
                        <a
                          href={resolveMediaUrl(r.fileUrl || r.externalUrl) || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[var(--yu-blue-700)] transition hover:bg-[var(--yu-blue-50)] dark:border-white/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t("courseView.download")}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {activeLesson?.id ? (
                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-[var(--shadow-sm)] backdrop-blur-xl dark:border-white/8 dark:bg-[#0F1E38]/90">
                  <LessonQna lessonId={activeLesson.id} />
                </div>
              ) : null}
            </motion.div>
          ) : (
            <p className="text-slate-500">{t("courseView.pickLesson")}</p>
          )}
        </main>
      </div>
    </div>
  );
}
