import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useMyCourses } from "../../features/student/courses/hooks";
import { useStudentExams } from "../../features/student/exams/hooks";
import { useNotifications } from "../../features/student/notifications/hooks";
import { useStudentFlashcards } from "../../features/student/flashcards/hooks";
import { useStudyPlans } from "../../features/student/studyPlans/hooks";
import { useMyCertificates } from "../../features/student/certificates/hooks";

function courseKey(course) {
  return course.courseId ?? course.id;
}

function greetingKey(hour) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function ProgressRing({ value, size = 88, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#yuProgressGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="yuProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-xl font-black tabular-nums leading-none">{value}%</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, icon: Icon, href, tone = "blue" }) {
  const tones = {
    blue: "from-[var(--yu-blue-700)]/12 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)]",
    amber: "from-[var(--yu-amber-500)]/15 to-[var(--yu-amber-400)]/5 text-[var(--yu-amber-600)]",
    emerald: "from-emerald-500/12 to-emerald-400/5 text-emerald-700 dark:text-emerald-400",
    slate: "from-slate-500/10 to-slate-400/5 text-slate-700 dark:text-slate-300",
  };
  const inner = (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]"
    >
      <div
        className={`absolute -end-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-80 blur-2xl ${tones[tone]}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {href ? (
          <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[var(--yu-blue-600)] dark:text-slate-600" />
        ) : null}
      </div>
      <p className="relative mt-4 text-3xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">
        {value}
      </p>
      <p className="relative mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">{label}</p>
      {hint ? <p className="relative mt-1 text-[11px] font-medium text-slate-400">{hint}</p> : null}
    </motion.article>
  );
  return href ? (
    <Link to={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function getNotificationBadge(title, t) {
  const tLower = (title || "").toLowerCase();
  if (tLower.includes("graded") || tLower.includes("تصحيح") || tLower.includes("grade")) {
    return {
      label: t("student.overview.badgeResult"),
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-950/30",
    };
  }
  if (tLower.includes("exam") || tLower.includes("اختبار") || tLower.includes("assessment")) {
    return {
      label: t("student.overview.badgeExam"),
      classes:
        "bg-[var(--yu-blue-50)] text-[var(--yu-blue-800)] border-[var(--yu-blue-100)] dark:bg-[var(--yu-blue-700)]/15 dark:text-[var(--yu-blue-300)] dark:border-[var(--yu-blue-800)]",
    };
  }
  if (tLower.includes("expiring") || tLower.includes("انتهاء") || tLower.includes("expire")) {
    return {
      label: t("student.overview.badgeAlert"),
      classes:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-950/30",
    };
  }
  return {
    label: t("student.overview.badgeAlert"),
    classes:
      "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-800",
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function StudentOverview() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.fullName || "").trim().split(/\s+/)[0] || t("student.overview.studentFallback", { defaultValue: "Student" });

  const { data: courses = [], isLoading: coursesLoading } = useMyCourses();
  const { data: exams = [] } = useStudentExams();
  const { data: notifications = [] } = useNotifications();
  const { data: flashcards = [] } = useStudentFlashcards();
  const { data: studyPlans = [] } = useStudyPlans();
  const { data: certificates = [] } = useMyCertificates();

  const hour = new Date().getHours();
  const greet = t(`student.overview.greet.${greetingKey(hour)}`, {
    defaultValue: greetingKey(hour) === "morning" ? "Good morning" : greetingKey(hour) === "afternoon" ? "Good afternoon" : "Good evening",
  });

  const todayLabel = new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const enrichedCourses = useMemo(
    () =>
      courses.map((course) => ({
        ...course,
        id: courseKey(course),
        progress: Math.round(Number(course.progressPercentage) || 0),
        instructorName: course?.instructor?.fullName || course?.teacherName || null,
        completedLessons: Number(course.completedLessonsCount) || 0,
        totalLessons: Number(course.totalLessonsCount || course.lessonsCount) || 0,
      })),
    [courses]
  );

  const avgProgress = useMemo(() => {
    if (!enrichedCourses.length) return 0;
    return Math.round(
      enrichedCourses.reduce((sum, c) => sum + c.progress, 0) / enrichedCourses.length
    );
  }, [enrichedCourses]);

  const completedCourses = enrichedCourses.filter((c) => c.progress >= 100 || c.isCompleted).length;

  const upcomingExamList = useMemo(
    () =>
      exams
        .filter((e) => {
          if (e.mySubmission?.submittedAt) return false;
          return e.status === "AVAILABLE" || e.status === "UPCOMING";
        })
        .slice(0, 4),
    [exams]
  );

  const completedExams = useMemo(
    () => exams.filter((e) => Boolean(e.mySubmission?.submittedAt)).length,
    [exams]
  );

  const continueCourses = useMemo(
    () => enrichedCourses.filter((c) => c.id && c.progress < 100).slice(0, 3),
    [enrichedCourses]
  );

  const primaryContinue = continueCourses[0];

  const planItemsDue = useMemo(() => {
    const plans = Array.isArray(studyPlans) ? studyPlans : [];
    const items = plans.flatMap((p) => (Array.isArray(p.items) ? p.items : []));
    const open = items.filter((item) => !item.completedAt && item.status !== "DONE" && item.status !== "COMPLETED");
    return open.slice(0, 4);
  }, [studyPlans]);

  const recentNotifs = (Array.isArray(notifications) ? notifications : [])
    .filter((n) => {
      const blob = `${n.title || ""} ${n.message || ""}`.toLowerCase();
      return !blob.includes("workshop") && !blob.includes("homework") && !blob.includes("اسايم") && !blob.includes("واجب");
    })
    .slice(0, 6);

  const flashcardCount = Array.isArray(flashcards) ? flashcards.length : 0;
  const certCount = Array.isArray(certificates) ? certificates.length : 0;

  const quickLinks = [
    { to: "/student/exams", icon: ClipboardList, label: t("student.overview.quick.exams", { defaultValue: "Exams" }) },
    { to: "/student/flashcards", icon: Layers, label: t("student.overview.quick.flashcards", { defaultValue: "Flashcards" }) },
    { to: "/student/study-plan", icon: CalendarDays, label: t("student.overview.quick.studyPlan", { defaultValue: "Study plan" }) },
    { to: "/student/recordings", icon: Headphones, label: t("student.overview.quick.recordings", { defaultValue: "Recordings" }) },
    { to: "/student/certificates", icon: Award, label: t("student.overview.quick.certificates", { defaultValue: "Certificates" }) },
    { to: "/student/progress", icon: TrendingUp, label: t("student.overview.quick.progress", { defaultValue: "Progress" }) },
  ];

  return (
    <div className="space-y-8 pb-4">
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
              "radial-gradient(circle at 12% 20%, rgba(96,165,250,0.35), transparent 42%), radial-gradient(circle at 88% 10%, rgba(251,191,36,0.22), transparent 36%), radial-gradient(circle at 70% 85%, rgba(59,130,246,0.25), transparent 40%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--yu-amber-400)]" />
              {todayLabel}
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {greet}
              {isAr ? "، " : ", "}
              <span className="text-[var(--yu-amber-400)]">{firstName}</span>
            </h1>
            <p className="text-sm font-medium leading-relaxed text-blue-100/90 sm:text-[15px]">
              {t("student.overview.heroSubtitle", {
                defaultValue: isAr
                  ? "تابع تقدمك في الكورسات، راجع الاختبارات القادمة، وابنِ زخم مذاكرتك خطوة بخطوة."
                  : "Track course progress, stay ahead of upcoming exams, and keep your study momentum strong.",
              })}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {primaryContinue ? (
                <Link
                  to={`/student/courses/${primaryContinue.id}/learn`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[var(--yu-blue-900)] shadow-lg transition hover:bg-blue-50"
                >
                  <BookOpen className="h-4 w-4" />
                  {t("student.overview.resumeLearning", { defaultValue: isAr ? "متابعة التعلم" : "Resume learning" })}
                </Link>
              ) : (
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[var(--yu-blue-900)] shadow-lg transition hover:bg-blue-50"
                >
                  {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
                </Link>
              )}
              <Link
                to="/student/exams"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                <ClipboardList className="h-4 w-4" />
                {t("student.overview.viewExams", { defaultValue: isAr ? "الاختبارات" : "View exams" })}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:min-w-[280px]">
            <ProgressRing value={avgProgress} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200/80">
                {t("student.overview.overallProgress", { defaultValue: isAr ? "متوسط التقدم" : "Overall progress" })}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {coursesLoading
                  ? "—"
                  : t("student.overview.coursesSummary", {
                      count: courses.length,
                      completed: completedCourses,
                      defaultValue: isAr
                        ? `${courses.length} كورس · ${completedCourses} مكتمل`
                        : `${courses.length} courses · ${completedCourses} completed`,
                    })}
              </p>
              <p className="mt-2 text-[11px] font-medium text-blue-100/75">
                {t("student.overview.examsSummary", {
                  upcoming: upcomingExamList.length,
                  done: completedExams,
                  defaultValue: isAr
                    ? `${upcomingExamList.length} اختبار قادم · ${completedExams} مكتمل`
                    : `${upcomingExamList.length} upcoming · ${completedExams} done`,
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={t("student.overview.stats.courses", { defaultValue: "Enrolled courses" })}
          value={coursesLoading ? "—" : courses.length}
          hint={t("student.overview.stats.coursesHint", {
            defaultValue: isAr ? `${completedCourses} مكتملة` : `${completedCourses} completed`,
          })}
          icon={BookOpen}
          href="/student/classes"
          tone="blue"
        />
        <StatCard
          label={t("student.overview.stats.avgProgress", { defaultValue: isAr ? "متوسط التقدم" : "Avg. progress" })}
          value={`${avgProgress}%`}
          hint={t("student.overview.stats.avgProgressHint", {
            defaultValue: isAr ? "عبر كل الكورسات" : "Across all courses",
          })}
          icon={Target}
          href="/student/progress"
          tone="amber"
        />
        <StatCard
          label={t("student.overview.stats.exams", { defaultValue: "Upcoming exams" })}
          value={upcomingExamList.length}
          hint={t("student.overview.stats.examsHint", {
            defaultValue: isAr ? `${completedExams} مكتملة` : `${completedExams} completed`,
          })}
          icon={ClipboardList}
          href="/student/exams"
          tone="emerald"
        />
        <StatCard
          label={t("student.overview.stats.flashcards", { defaultValue: isAr ? "البطاقات" : "Flashcards" })}
          value={flashcardCount}
          hint={
            certCount
              ? t("student.overview.stats.certsHint", {
                  defaultValue: isAr ? `${certCount} شهادة` : `${certCount} certificates`,
                })
              : t("student.overview.stats.flashcardsHint", {
                  defaultValue: isAr ? "جاهزة للمراجعة" : "Ready to review",
                })
          }
          icon={Layers}
          href="/student/flashcards"
          tone="slate"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Continue learning */}
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t("student.overview.continueLearning", { defaultValue: "Continue learning" })}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {t("student.overview.continueLearningHint", {
                  defaultValue: isAr ? "أكمل من حيث توقفت" : "Pick up exactly where you left off",
                })}
              </p>
            </div>
            <Link to="/student/classes" className="text-sm font-bold text-[var(--yu-blue-700)] hover:underline">
              {t("student.overview.viewAll", { defaultValue: "View all" })}
            </Link>
          </div>

          {continueCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-[#0F1E38]/60">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--yu-blue-50)] dark:bg-[var(--yu-blue-700)]/20">
                <BookOpen className="h-7 w-7 text-[var(--yu-blue-700)]" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t("student.overview.noCourses", { defaultValue: "Enroll in a course to start learning." })}
              </p>
              <Link
                to="/explore"
                className="mt-5 inline-flex rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-cta)] hover:bg-[var(--yu-blue-600)]"
              >
                {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {continueCourses.map((course, index) => (
                <motion.div key={course.id} custom={index + 1} initial="hidden" animate="show" variants={fadeUp}>
                  <Link
                    to={`/student/courses/${course.id}/learn`}
                    className="group flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow-sm)] transition hover:border-[var(--yu-blue-300)] hover:shadow-[var(--shadow-md)] dark:border-white/8 dark:bg-[#0F1E38] sm:flex-row sm:items-center"
                  >
                    <div className="relative flex h-16 w-full shrink-0 items-end overflow-hidden rounded-xl bg-[linear-gradient(145deg,#0F2448,#1B4FBF)] p-3 sm:h-16 sm:w-16">
                      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 20%, #60A5FA, transparent 55%)" }} />
                      <BookOpen className="relative h-5 w-5 text-white/90" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-black text-slate-900 dark:text-white">{course.title}</p>
                        {course.progress >= 70 ? (
                          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            {t("student.overview.nearlyDone")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {course.instructorName
                          ? `${t("student.overview.withInstructor")} ${course.instructorName}`
                          : t("student.overview.recordedCourse")}
                        {course.totalLessons > 0
                          ? ` · ${course.completedLessons}/${course.totalLessons} ${t("student.overview.lessons")}`
                          : null}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,var(--yu-blue-700),var(--yu-blue-500))] transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="min-w-[2.75rem] text-end text-sm font-black tabular-nums text-[var(--yu-blue-700)]">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--yu-blue-50)] px-3 py-2 text-xs font-bold text-[var(--yu-blue-800)] transition group-hover:bg-[var(--yu-blue-700)] group-hover:text-white dark:bg-[var(--yu-blue-700)]/20 dark:text-[var(--yu-blue-300)]">
                      {t("student.overview.resume")}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upcoming exams */}
          <div className="pt-2">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t("student.overview.upcomingExams", { defaultValue: isAr ? "اختبارات قادمة" : "Upcoming exams" })}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {t("student.overview.upcomingExamsHint", {
                    defaultValue: isAr ? "جهّز نفسك قبل الموعد" : "Stay ready before the deadline",
                  })}
                </p>
              </div>
              <Link to="/student/exams" className="text-sm font-bold text-[var(--yu-blue-700)] hover:underline">
                {t("student.overview.viewAll", { defaultValue: "View all" })}
              </Link>
            </div>
            {upcomingExamList.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/8 dark:bg-[#0F1E38]">
                {t("student.overview.noExams", {
                  defaultValue: isAr ? "لا توجد اختبارات قادمة حالياً." : "No upcoming exams right now.",
                })}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {upcomingExamList.map((exam) => (
                  <Link
                    key={exam.id}
                    to={`/student/exams/${exam.id}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-sm)] transition hover:border-[var(--yu-blue-300)] dark:border-white/8 dark:bg-[#0F1E38]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--yu-blue-50)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--yu-blue-800)] dark:bg-[var(--yu-blue-700)]/20 dark:text-[var(--yu-blue-300)]">
                        <CheckCircle2 className="h-3 w-3" />
                        {exam.status === "AVAILABLE"
                          ? t("student.overview.availableNow")
                          : t("student.overview.upcoming")}
                      </span>
                      {exam.durationMinutes ? (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {exam.durationMinutes} {t("student.overview.minutesShort")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">{exam.title}</p>
                    {exam.scheduledAt ? (
                      <p className="mt-2 text-[11px] font-medium text-slate-500">
                        {new Date(exam.scheduledAt).toLocaleString(isAr ? "ar-EG" : undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    ) : (
                      <p className="mt-2 text-[11px] font-medium text-slate-400">
                        {t("student.overview.noFixedSchedule")}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Side column */}
        <aside className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t("student.overview.quickLinks", { defaultValue: isAr ? "اختصارات سريعة" : "Quick links" })}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {quickLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[var(--shadow-sm)] transition hover:border-[var(--yu-blue-300)] hover:bg-[var(--yu-blue-50)]/40 dark:border-white/8 dark:bg-[#0F1E38] dark:hover:bg-[var(--yu-blue-700)]/10"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--yu-blue-50)] text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/20 dark:text-[var(--yu-blue-300)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          {planItemsDue.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t("student.overview.studyPlan", { defaultValue: isAr ? "خطة المذاكرة" : "Study plan" })}
                </h2>
                <Link to="/student/study-plan" className="text-xs font-bold text-[var(--yu-blue-700)] hover:underline">
                  {t("student.overview.viewAll", { defaultValue: "View all" })}
                </Link>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/8 dark:bg-[#0F1E38]">
                {planItemsDue.map((item) => (
                  <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title || item.label}</p>
                    {item.dueDate ? (
                      <p className="mt-1 text-[10px] font-medium text-slate-400">
                        {new Date(item.dueDate).toLocaleDateString(isAr ? "ar-EG" : undefined)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t("student.overview.notifications", { defaultValue: "Recent alerts" })}
              </h2>
              <Link to="/student/settings" className="text-xs font-bold text-[var(--yu-blue-700)] hover:underline">
                {t("student.overview.viewAll", { defaultValue: "View all" })}
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]">
              {recentNotifs.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  {t("student.overview.noNotifications", { defaultValue: "No new notifications." })}
                </p>
              ) : (
                recentNotifs.map((n) => {
                  const badge = getNotificationBadge(n.title, t);
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <div className="mt-1.5 flex shrink-0 items-center justify-center">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            n.isRead ? "bg-slate-300 dark:bg-slate-600" : "bg-[var(--yu-blue-600)] animate-pulse"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${badge.classes}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleDateString(undefined, {
                                  month: "numeric",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                        <p
                          className={`mt-1.5 text-xs font-bold ${
                            n.isRead ? "font-medium text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {n.title}
                        </p>
                        {n.message ? (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
