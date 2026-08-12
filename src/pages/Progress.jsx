import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Flame,
  Layers,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Video,
  Zap,
} from "lucide-react";
import { getErrorMessage } from "../api/error";
import EmptyState from "../components/dashboard/EmptyState";
import { StudentBadge, StudentSurface } from "../components/student/ui";
import { useMyCourses } from "../features/student/courses/hooks";
import { useMyCertificates } from "../features/student/certificates/hooks";
import { useStudentExams } from "../features/student/exams/hooks";
import { useStudentFlashcards, useMyFlashcards } from "../features/student/flashcards/hooks";
import { useMyGamification } from "../features/student/gamification/hooks";
import { useNotifications } from "../features/student/notifications/hooks";
import { fetchCourseProgressStats } from "../features/student/progress/api";
import { useStudyPlans } from "../features/student/studyPlans/hooks";

function courseKey(course) {
  return course.courseId ?? course.id;
}

function clampPct(n) {
  return Math.min(100, Math.max(0, Math.round(Number(n) || 0)));
}

function isItemDone(item) {
  return Boolean(item?.completedAt) || item?.status === "DONE" || item?.status === "COMPLETED";
}

function ProgressRing({ value, size = 104, stroke = 9, light = false }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const track = light ? "rgba(255,255,255,0.18)" : "rgba(148,163,184,0.25)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressPageGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressPageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${light ? "text-white" : "text-slate-900 dark:text-white"}`}
      >
        <span className="text-2xl font-black tabular-nums leading-none">{value}%</span>
      </div>
    </div>
  );
}

function MiniBar({ value, className = "bg-[var(--yu-blue-700)]" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-700 ${className}`}
        style={{ width: `${clampPct(value)}%` }}
      />
    </div>
  );
}

function DomainCard({ icon: Icon, title, value, hint, pct, href, tone = "blue" }) {
  const tones = {
    blue: "from-[var(--yu-blue-700)]/14 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)]",
    amber: "from-[var(--yu-amber-500)]/18 to-amber-400/5 text-[var(--yu-amber-600)]",
    emerald: "from-emerald-500/14 to-emerald-400/5 text-emerald-700 dark:text-emerald-400",
    rose: "from-rose-500/12 to-rose-400/5 text-rose-700 dark:text-rose-400",
    slate: "from-slate-500/12 to-slate-400/5 text-slate-700 dark:text-slate-300",
  };
  const body = (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]"
    >
      <div className={`absolute -end-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-70 blur-2xl ${tones[tone]}`} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {href ? (
          <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[var(--yu-blue-600)] dark:text-slate-600" />
        ) : null}
      </div>
      <p className="relative mt-4 text-2xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">{value}</p>
      <p className="relative mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">{title}</p>
      {hint ? <p className="relative mt-1 text-[11px] font-medium text-slate-400">{hint}</p> : null}
      {pct != null ? (
        <div className="relative mt-3 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-400">
            <span>{clampPct(pct)}%</span>
          </div>
          <MiniBar value={pct} />
        </div>
      ) : null}
    </motion.article>
  );
  return href ? (
    <Link to={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function SectionHead({ title, href, linkLabel }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
      {href ? (
        <Link
          to={href}
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--yu-blue-700)] hover:underline"
        >
          {linkLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Progress() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  const { data: myCourses = [], isLoading, isError, error, refetch } = useMyCourses();
  const { data: notifications = [] } = useNotifications();
  const { data: flashcardsAll = [] } = useStudentFlashcards({ dueOnly: false });
  const { data: flashcardsDue = [] } = useStudentFlashcards({ dueOnly: true });
  const { data: myFlashcardsAll = [] } = useMyFlashcards({});
  const { data: myFlashcardsDue = [] } = useMyFlashcards({ dueOnly: true });
  const { data: studyPlans = [] } = useStudyPlans();
  const { data: exams = [] } = useStudentExams();
  const { data: certificates = [] } = useMyCertificates();
  const { data: gami } = useMyGamification();

  const { data: progressStats = [] } = useQuery({
    queryKey: ["student", "progress", "courses", myCourses.map((c) => courseKey(c)).join(",")],
    enabled: myCourses.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        myCourses.map(async (course) => {
          const id = courseKey(course);
          if (!id) {
            return { courseId: "", completedLessons: 0, totalLessons: 0, percentage: 0, isCourseCompleted: false };
          }
          try {
            const stat = await fetchCourseProgressStats(id);
            return {
              courseId: id,
              completedLessons: Number(stat?.completedLessons) || 0,
              totalLessons: Number(stat?.totalLessons) || 0,
              percentage: Number(stat?.percentage) || 0,
              isCourseCompleted: Boolean(stat?.isCourseCompleted),
            };
          } catch {
            return {
              courseId: id,
              completedLessons: Number(course.completedLessonsCount) || 0,
              totalLessons: 0,
              percentage: Number(course.progressPercentage) || 0,
              isCourseCompleted: Boolean(course.isCompleted),
            };
          }
        })
      );
      return results;
    },
    retry: false,
  });

  const courses = useMemo(
    () =>
      myCourses.map((course, idx) => {
        const id = courseKey(course);
        const stat = progressStats.find((s) => s.courseId === id) || {};
        const palette = ["bg-[var(--yu-blue-700)]", "bg-[var(--yu-blue-500)]", "bg-emerald-500", "bg-[var(--yu-blue-600)]"];
        const pct = clampPct(stat.percentage ?? course.progressPercentage ?? 0);
        const completed = Number(stat.completedLessons ?? course.completedLessonsCount ?? 0);
        const total = Number(stat.totalLessons) || Math.max(completed, 1);
        return {
          key: id ?? String(idx),
          courseId: id,
          name: course.title,
          teacher: course?.instructor?.fullName || "Instructor",
          progress: pct,
          lessons: completed,
          total,
          isCourseCompleted: Boolean(stat.isCourseCompleted ?? course.isCompleted),
          colour: palette[idx % palette.length],
        };
      }),
    [myCourses, progressStats]
  );

  const courseAvg = courses.length ? clampPct(courses.reduce((a, c) => a + c.progress, 0) / courses.length) : 0;
  const completedCourses = courses.filter((c) => c.isCourseCompleted || c.progress >= 100).length;
  const lessonsCompleted = courses.reduce((a, c) => a + c.lessons, 0);

  const flashStats = useMemo(() => {
    const all = Array.isArray(flashcardsAll) ? flashcardsAll : [];
    const due = Array.isArray(flashcardsDue) ? flashcardsDue : [];
    const mine = Array.isArray(myFlashcardsAll) ? myFlashcardsAll : [];
    const mineDue = Array.isArray(myFlashcardsDue) ? myFlashcardsDue : [];
    const reviewed = all.filter((c) => c.lastReviewedAt).length;
    const easy = all.filter((c) => c.lastDifficulty === "EASY").length;
    const medium = all.filter((c) => c.lastDifficulty === "MEDIUM").length;
    const hard = all.filter((c) => c.lastDifficulty === "HARD").length;
    const total = all.length;
    const pct = total ? clampPct((reviewed / total) * 100) : 0;
    return {
      total,
      due: due.length,
      reviewed,
      easy,
      medium,
      hard,
      pct,
      myTotal: mine.length,
      myDue: mineDue.length,
    };
  }, [flashcardsAll, flashcardsDue, myFlashcardsAll, myFlashcardsDue]);

  const planStats = useMemo(() => {
    const plans = Array.isArray(studyPlans) ? studyPlans : [];
    const items = plans.flatMap((p) => (Array.isArray(p.items) ? p.items : []));
    const done = items.filter(isItemDone).length;
    const total = items.length;
    const open = total - done;
    return {
      plans: plans.length,
      total,
      done,
      open,
      pct: total ? clampPct((done / total) * 100) : 0,
      upcoming: items
        .filter((item) => !isItemDone(item))
        .sort((a, b) => new Date(a.scheduledAt || a.dueDate || 0) - new Date(b.scheduledAt || b.dueDate || 0))
        .slice(0, 4),
    };
  }, [studyPlans]);

  const examStats = useMemo(() => {
    const list = Array.isArray(exams) ? exams : [];
    const submitted = list.filter((e) => Boolean(e.mySubmission?.submittedAt));
    const passed = submitted.filter((e) => e.mySubmission?.isPassed).length;
    const scores = submitted
      .map((e) => {
        const score = Number(e.mySubmission?.totalScore);
        const max = Number(e.totalPoints || e.passingScore || 0);
        if (!Number.isFinite(score)) return null;
        if (max > 0) return (score / max) * 100;
        return score;
      })
      .filter((n) => n != null);
    const avgScore = scores.length ? clampPct(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const available = list.filter((e) => e.status === "AVAILABLE" && !e.mySubmission?.submittedAt).length;
    return {
      total: list.length,
      submitted: submitted.length,
      passed,
      available,
      avgScore,
      pct: list.length ? clampPct((submitted.length / list.length) * 100) : 0,
      recent: submitted.slice(0, 4),
    };
  }, [exams]);

  const certCount = Array.isArray(certificates) ? certificates.length : 0;

  const overallPct = useMemo(() => {
    const parts = [];
    if (courses.length) parts.push(courseAvg);
    if (flashStats.total) parts.push(flashStats.pct);
    if (planStats.total) parts.push(planStats.pct);
    if (examStats.total) parts.push(examStats.pct);
    if (!parts.length) return 0;
    return clampPct(parts.reduce((a, b) => a + b, 0) / parts.length);
  }, [courses.length, courseAvg, flashStats.total, flashStats.pct, planStats.total, planStats.pct, examStats.total, examStats.pct]);

  const activity = (Array.isArray(notifications) ? notifications : []).slice(0, 6).map((n) => ({
    key: n.id,
    type: String(n.type || "alert").toLowerCase(),
    text: n.message ? `${n.title} — ${n.message}` : n.title,
    date: n.createdAt ? new Date(n.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US") : "—",
  }));

  const recentXp = Array.isArray(gami?.recentXp) ? gami.recentXp.slice(0, 4) : [];

  return (
    <div className="space-y-7 pb-6">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="relative overflow-hidden rounded-[1.75rem] border border-[var(--yu-blue-800)]/30 bg-[linear-gradient(135deg,#0A1628_0%,#153577_48%,#1B4FBF_100%)] p-6 text-white shadow-[var(--shadow-brand)] sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(96,165,250,0.35), transparent 42%), radial-gradient(circle at 88% 10%, rgba(251,191,36,0.22), transparent 36%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--yu-amber-400)]" />
              {t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {t("progress.titlePrefix")}{" "}
              <span className="text-[var(--yu-amber-400)]">{t("progress.titleAccent")}</span>
            </h1>
            <p className="text-sm font-medium leading-relaxed text-blue-100/90">
              {t("progress.subtitleRich", {
                defaultValue: isAr
                  ? "تابع تقدمك عبر الكورسات، البطاقات، خطة المذاكرة، الاختبارات، والزخم في مكان واحد."
                  : "Track courses, flashcards, study plan, exams, and momentum — all in one place.",
              })}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to="/student/flashcards"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/15"
              >
                <Layers className="h-3.5 w-3.5" />
                {t("progress.cta.flashcards", { defaultValue: isAr ? "مراجعة البطاقات" : "Review flashcards" })}
              </Link>
              <Link
                to="/student/study-plan"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/15"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {t("progress.cta.studyPlan", { defaultValue: isAr ? "خطة المذاكرة" : "Study plan" })}
              </Link>
              <Link
                to="/student/momentum"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[var(--yu-blue-900)] hover:bg-blue-50"
              >
                <Zap className="h-3.5 w-3.5" />
                {t("progress.cta.momentum", { defaultValue: isAr ? "الزخم" : "Momentum" })}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:min-w-[300px]">
            <ProgressRing value={overallPct} light />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200/80">
                {t("progress.overallLabel", { defaultValue: isAr ? "التقدم الشامل" : "Overall progress" })}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {t("progress.overallHint", {
                  defaultValue: isAr
                    ? "متوسط مساراتك النشطة"
                    : "Average across your active tracks",
                })}
              </p>
              {gami?.profile ? (
                <p className="mt-2 text-[11px] font-medium text-blue-100/80">
                  {t("student.gamification.level", { defaultValue: "Level" })} {gami.profile.level}
                  {" · "}
                  {gami.profile.totalXp} XP
                  {" · "}
                  {gami.profile.currentStreak}{" "}
                  {t("student.gamification.streakShort", { defaultValue: "day streak" })}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </motion.section>

      {isError ? (
        <EmptyState
          title={t("progress.loadError", { defaultValue: "Could not load progress" })}
          message={getErrorMessage(error, "Could not load your progress.")}
          icon={TrendingUp}
          action={
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white"
            >
              {t("takeExam.retry", { defaultValue: "Retry" })}
            </button>
          }
        />
      ) : null}

      {!isError ? (
        <>
          {/* Domain cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4">
            <DomainCard
              icon={BookOpen}
              title={t("progress.domains.courses", { defaultValue: isAr ? "الكورسات" : "Courses" })}
              value={isLoading ? "—" : `${courseAvg}%`}
              hint={t("progress.domains.coursesHint", {
                defaultValue: isAr
                  ? `${myCourses.length} مسجّل · ${completedCourses} مكتمل`
                  : `${myCourses.length} enrolled · ${completedCourses} done`,
              })}
              pct={courseAvg}
              href="/student/classes"
              tone="blue"
            />
            <DomainCard
              icon={Layers}
              title={t("progress.domains.flashcards", { defaultValue: isAr ? "البطاقات" : "Flashcards" })}
              value={flashStats.due}
              hint={t("progress.domains.flashcardsHint", {
                defaultValue: isAr
                  ? `${flashStats.reviewed}/${flashStats.total || 0} مُراجَعة · ${flashStats.myDue} خاصة مستحقة`
                  : `${flashStats.reviewed}/${flashStats.total || 0} reviewed · ${flashStats.myDue} private due`,
              })}
              pct={flashStats.pct}
              href="/student/flashcards"
              tone="amber"
            />
            <DomainCard
              icon={CalendarDays}
              title={t("progress.domains.studyPlan", { defaultValue: isAr ? "خطة المذاكرة" : "Study plan" })}
              value={`${planStats.done}/${planStats.total || 0}`}
              hint={t("progress.domains.studyPlanHint", {
                defaultValue: isAr
                  ? `${planStats.plans} خطة · ${planStats.open} مفتوحة`
                  : `${planStats.plans} plans · ${planStats.open} open`,
              })}
              pct={planStats.pct}
              href="/student/study-plan"
              tone="emerald"
            />
            <DomainCard
              icon={ClipboardList}
              title={t("progress.domains.exams", { defaultValue: isAr ? "الاختبارات" : "Exams" })}
              value={examStats.submitted}
              hint={t("progress.domains.examsHint", {
                defaultValue: isAr
                  ? `${examStats.available} متاح · متوسط ${examStats.avgScore}%`
                  : `${examStats.available} available · avg ${examStats.avgScore}%`,
              })}
              pct={examStats.pct}
              href="/student/exams"
              tone="rose"
            />
            <DomainCard
              icon={Award}
              title={t("progress.domains.certificates", { defaultValue: isAr ? "الشهادات" : "Certificates" })}
              value={certCount}
              hint={t("progress.domains.certificatesHint", {
                defaultValue: isAr ? "شهادات مكتسبة" : "Earned certificates",
              })}
              href="/student/certificates"
              tone="amber"
            />
            <DomainCard
              icon={Zap}
              title={t("progress.domains.momentum", { defaultValue: isAr ? "الزخم" : "Momentum" })}
              value={gami?.profile ? `Lv ${gami.profile.level}` : "—"}
              hint={
                gami?.profile
                  ? `${gami.profile.totalXp} XP · ${gami.profile.currentStreak} ${t("student.gamification.streakShort", { defaultValue: "day streak" })}`
                  : t("progress.domains.momentumEmpty", { defaultValue: isAr ? "ابدأ المذاكرة لكسب XP" : "Start studying to earn XP" })
              }
              pct={gami?.profile?.levelProgress ?? null}
              href="/student/momentum"
              tone="slate"
            />
          </div>

          {/* Momentum strip */}
          {gami?.profile ? (
            <motion.section
              initial="hidden"
              animate="show"
              custom={1}
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38] sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--yu-blue-700)]/15 to-[var(--yu-amber-400)]/20">
                    <Target className="h-6 w-6 text-[var(--yu-blue-700)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t("student.gamification.brand", { defaultValue: "Step Momentum" })}
                    </p>
                    <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
                      {t("student.gamification.level", { defaultValue: "Level" })} {gami.profile.level}
                      <span className="ms-2 text-sm font-bold text-slate-400 tabular-nums">{gami.profile.totalXp} XP</span>
                    </p>
                    <div className="mt-2 h-2 w-56 max-w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--yu-blue-700)] to-[var(--yu-amber-400)]"
                        style={{ width: `${gami.profile.levelProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200/80 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                    <Flame className="h-3.5 w-3.5" />
                    {gami.profile.currentStreak} {t("student.gamification.streakShort", { defaultValue: "day streak" })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    <Trophy className="h-3.5 w-3.5 text-[var(--yu-amber-500)]" />
                    {t("student.gamification.rankShort", { defaultValue: "Rank" })} {gami.globalRank ?? "—"}
                  </span>
                  {gami.challenge ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--yu-blue-700)]/20 bg-[var(--yu-blue-700)]/5 px-3 py-2 text-xs font-bold text-[var(--yu-blue-700)]">
                      {gami.challenge.progress}/{gami.challenge.goalTarget}{" "}
                      {t("student.gamification.challengeShort", { defaultValue: "challenge" })}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Award className="h-3.5 w-3.5" />
                    {(gami.badges || []).length} {t("progress.badges", { defaultValue: isAr ? "شارة" : "badges" })}
                  </span>
                </div>
              </div>
            </motion.section>
          ) : null}

          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Courses */}
            <div className="space-y-4 xl:col-span-2">
              <SectionHead
                title={t("progress.myCourses")}
                href="/student/classes"
                linkLabel={t("progress.viewAll", { defaultValue: isAr ? "عرض الكل" : "View all" })}
              />
              {isLoading ? (
                <StudentSurface>
                  <p className="text-sm text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
                </StudentSurface>
              ) : courses.length === 0 ? (
                <EmptyState
                  title={t("progress.noCourses", { defaultValue: "No courses yet" })}
                  message={t("progress.noCourses", { defaultValue: "Enroll in a course to see progress here." })}
                  icon={BookOpen}
                />
              ) : (
                <div className="space-y-3">
                  {courses.map((c) => (
                    <StudentSurface key={c.key} className="!p-4 sm:!p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{c.name}</h3>
                          <p className="mt-0.5 text-xs font-semibold text-[var(--yu-blue-700)]">{c.teacher}</p>
                        </div>
                        {c.isCourseCompleted || c.progress >= 100 ? (
                          <StudentBadge tone="emerald">{t("progress.completed")}</StudentBadge>
                        ) : (
                          <span className="shrink-0 text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">
                            {c.progress}%
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {c.lessons}/{c.total} {t("progress.lessons")}
                          </span>
                          <span className="font-semibold tabular-nums">{c.progress}%</span>
                        </div>
                        <MiniBar value={c.progress} className={c.colour} />
                      </div>
                      {c.courseId ? (
                        <Link
                          to={`/student/courses/${c.courseId}/learn`}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--yu-blue-700)] hover:underline"
                        >
                          {t("progress.continue", { defaultValue: isAr ? "متابعة" : "Continue" })}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </StudentSurface>
                  ))}
                </div>
              )}

              {/* Flashcards + Study plan row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StudentSurface>
                  <SectionHead
                    title={t("progress.sections.flashcards", { defaultValue: isAr ? "تقدم البطاقات" : "Flashcard progress" })}
                    href="/student/flashcards"
                    linkLabel={t("progress.reviewNow", { defaultValue: isAr ? "راجع الآن" : "Review" })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                      <p className="text-[11px] font-bold text-slate-400">{t("progress.flash.due", { defaultValue: isAr ? "مستحقة اليوم" : "Due today" })}</p>
                      <p className="mt-1 text-xl font-black tabular-nums text-slate-900 dark:text-white">{flashStats.due}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                      <p className="text-[11px] font-bold text-slate-400">{t("progress.flash.reviewed", { defaultValue: isAr ? "مُراجَعة" : "Reviewed" })}</p>
                      <p className="mt-1 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                        {flashStats.reviewed}/{flashStats.total || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>{t("progress.flash.easy", { defaultValue: "Easy" })}</span>
                      <span>{flashStats.easy}</span>
                    </div>
                    <MiniBar value={flashStats.total ? (flashStats.easy / flashStats.total) * 100 : 0} className="bg-emerald-500" />
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>{t("progress.flash.medium", { defaultValue: "Medium" })}</span>
                      <span>{flashStats.medium}</span>
                    </div>
                    <MiniBar value={flashStats.total ? (flashStats.medium / flashStats.total) * 100 : 0} className="bg-amber-500" />
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>{t("progress.flash.hard", { defaultValue: "Hard" })}</span>
                      <span>{flashStats.hard}</span>
                    </div>
                    <MiniBar value={flashStats.total ? (flashStats.hard / flashStats.total) * 100 : 0} className="bg-rose-500" />
                  </div>
                  <p className="mt-4 text-[11px] font-medium text-slate-400">
                    {t("progress.flash.private", {
                      defaultValue: isAr
                        ? `${flashStats.myTotal} بطاقة خاصة · ${flashStats.myDue} مستحقة`
                        : `${flashStats.myTotal} private cards · ${flashStats.myDue} due`,
                    })}
                  </p>
                </StudentSurface>

                <StudentSurface>
                  <SectionHead
                    title={t("progress.sections.studyPlan", { defaultValue: isAr ? "خطة المذاكرة" : "Study plan" })}
                    href="/student/study-plan"
                    linkLabel={t("progress.openPlan", { defaultValue: isAr ? "فتح الخطة" : "Open plan" })}
                  />
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">{planStats.pct}%</p>
                      <p className="text-xs font-medium text-slate-400">
                        {planStats.done}/{planStats.total || 0}{" "}
                        {t("progress.plan.tasks", { defaultValue: isAr ? "مهام مكتملة" : "tasks done" })}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/80" />
                  </div>
                  <MiniBar value={planStats.pct} className="bg-emerald-500" />
                  <div className="mt-4 space-y-2">
                    {planStats.upcoming.length ? (
                      planStats.upcoming.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 dark:border-white/8"
                        >
                          <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {item.title || item.label || t("progress.plan.task", { defaultValue: isAr ? "مهمة" : "Task" })}
                          </p>
                          <span className="shrink-0 text-[10px] font-bold text-slate-400">
                            {item.scheduledAt || item.dueDate
                              ? new Date(item.scheduledAt || item.dueDate).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-400">
                        {t("progress.plan.empty", { defaultValue: isAr ? "لا مهام مفتوحة حالياً." : "No open tasks right now." })}
                      </p>
                    )}
                  </div>
                </StudentSurface>
              </div>

              {/* Exams */}
              <StudentSurface>
                <SectionHead
                  title={t("progress.sections.exams", { defaultValue: isAr ? "تقدم الاختبارات" : "Exam progress" })}
                  href="/student/exams"
                  linkLabel={t("progress.viewAll", { defaultValue: isAr ? "عرض الكل" : "View all" })}
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-[11px] font-bold text-slate-400">{t("progress.exams.taken", { defaultValue: isAr ? "مُقدَّمة" : "Taken" })}</p>
                    <p className="mt-1 text-xl font-black tabular-nums">{examStats.submitted}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-[11px] font-bold text-slate-400">{t("progress.exams.passed", { defaultValue: isAr ? "ناجحة" : "Passed" })}</p>
                    <p className="mt-1 text-xl font-black tabular-nums text-emerald-600">{examStats.passed}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-[11px] font-bold text-slate-400">{t("progress.exams.available", { defaultValue: isAr ? "متاحة" : "Available" })}</p>
                    <p className="mt-1 text-xl font-black tabular-nums">{examStats.available}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-[11px] font-bold text-slate-400">{t("progress.exams.avg", { defaultValue: isAr ? "متوسط الدرجة" : "Avg score" })}</p>
                    <p className="mt-1 text-xl font-black tabular-nums">{examStats.avgScore}%</p>
                  </div>
                </div>
                {examStats.recent.length ? (
                  <div className="mt-4 space-y-2">
                    {examStats.recent.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-white/8"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{exam.title}</p>
                          <p className="text-[10px] text-slate-400">{exam.course?.title || "—"}</p>
                        </div>
                        <StudentBadge tone={exam.mySubmission?.isPassed ? "emerald" : "rose"}>
                          {exam.mySubmission?.totalScore != null ? exam.mySubmission.totalScore : "—"}
                          {exam.mySubmission?.isPassed
                            ? ` · ${t("progress.exams.pass", { defaultValue: isAr ? "نجاح" : "Pass" })}`
                            : ` · ${t("progress.exams.fail", { defaultValue: isAr ? "رسوب" : "Fail" })}`}
                        </StudentBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-center text-xs text-slate-400">
                    {t("progress.exams.empty", { defaultValue: isAr ? "لم تقدّم اختبارات بعد." : "No exams submitted yet." })}
                  </p>
                )}
              </StudentSurface>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div>
                <SectionHead title={t("progress.quickStats", { defaultValue: isAr ? "لمحة سريعة" : "At a glance" })} />
                <div className="grid grid-cols-2 gap-3">
                  <StudentSurface className="!p-4">
                    <Star className="mb-2 h-4 w-4 text-[var(--yu-amber-500)]" />
                    <p className="text-xl font-black tabular-nums">{courseAvg}%</p>
                    <p className="text-[11px] font-bold text-slate-400">{t("progress.stats.avgScore")}</p>
                  </StudentSurface>
                  <StudentSurface className="!p-4">
                    <Video className="mb-2 h-4 w-4 text-[var(--yu-blue-700)]" />
                    <p className="text-xl font-black tabular-nums">{lessonsCompleted}</p>
                    <p className="text-[11px] font-bold text-slate-400">{t("progress.stats.lessonsCompleted")}</p>
                  </StudentSurface>
                  <StudentSurface className="!p-4">
                    <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-600" />
                    <p className="text-xl font-black tabular-nums">{completedCourses}</p>
                    <p className="text-[11px] font-bold text-slate-400">{t("progress.stats.coursesCompleted")}</p>
                  </StudentSurface>
                  <StudentSurface className="!p-4">
                    <Award className="mb-2 h-4 w-4 text-[var(--yu-amber-500)]" />
                    <p className="text-xl font-black tabular-nums">{certCount}</p>
                    <p className="text-[11px] font-bold text-slate-400">
                      {t("progress.domains.certificates", { defaultValue: isAr ? "الشهادات" : "Certificates" })}
                    </p>
                  </StudentSurface>
                </div>
              </div>

              {recentXp.length ? (
                <div>
                  <SectionHead
                    title={t("progress.recentXp", { defaultValue: isAr ? "أحدث XP" : "Recent XP" })}
                    href="/student/momentum"
                    linkLabel={t("progress.viewAll", { defaultValue: isAr ? "عرض الكل" : "View all" })}
                  />
                  <StudentSurface padded={false}>
                    {recentXp.map((row, i) => (
                      <div
                        key={row.id || `${row.createdAt}-${i}`}
                        className={`flex items-center justify-between gap-3 px-4 py-3 ${i < recentXp.length - 1 ? "border-b border-slate-100 dark:border-white/8" : ""}`}
                      >
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          {row.reason || row.sourceType || "XP"}
                        </p>
                        <span className="text-xs font-black text-[var(--yu-blue-700)] tabular-nums">+{row.amount}</span>
                      </div>
                    ))}
                  </StudentSurface>
                </div>
              ) : null}

              <div>
                <SectionHead title={t("progress.recentActivity")} />
                <StudentSurface padded={false}>
                  {activity.length ? (
                    activity.map((a, i) => (
                      <div
                        key={a.key}
                        className={`flex items-start gap-3 px-4 py-3.5 ${i < activity.length - 1 ? "border-b border-slate-100 dark:border-white/8" : ""}`}
                      >
                        <StudentBadge tone="blue">{a.type}</StudentBadge>
                        <div>
                          <p className="text-xs font-medium leading-snug text-slate-700 dark:text-slate-200">{a.text}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{a.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t("progress.noActivity", { defaultValue: "No recent activity yet." })}
                    </p>
                  )}
                </StudentSurface>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
