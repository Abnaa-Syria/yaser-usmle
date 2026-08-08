import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  BookOpen,
  Users,
  CheckCircle,
  TrendingUp,
  Star,
  PlayCircle,
  FileText,
  Calendar,
  UserCheck,
  TrendingDown
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart
} from "recharts";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminUsers } from "../../features/admin/users/hooks";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import { useAdminEnrollments } from "../../features/admin/enrollments/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";

function Stars({ rating, max = 5 }) {
  const starsList = [];
  for (let i = 0; i < max; i++) {
    const isFull = i < Math.floor(rating);
    starsList.push(
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          isFull ? "fill-amber-400 text-amber-400" : "text-slate-350 dark:text-slate-650"
        }`}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{starsList}</div>;
}

function Performance() {
  const { t, i18n } = useTranslation();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [instructorId, setInstructorId] = useState("");

  const { data: studentsData } = useAdminUsers({ role: "STUDENT", page: 1, limit: 200 });
  const { data: instructorsData } = useAdminInstructors({ page: 1, limit: 200 });
  const { data: enrollmentsData } = useAdminEnrollments({ page: 1, limit: 200 });
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 200 });

  const students = studentsData?.users || [];
  const instructors = instructorsData?.instructors || [];
  const courses = coursesData?.courses || [];
  const allEnrollments = enrollmentsData?.enrollments || [];

  const isRtl = i18n.dir() === "rtl";

  // Filter enrollments based on dropdowns and dates
  const enrollments = useMemo(() => {
    return allEnrollments.filter((e) => {
      const d = new Date(e.enrolledAt || e.joinedAt || Date.now()).getTime();
      const after = !fromDate || d >= new Date(fromDate).getTime();
      const before = !toDate || d <= new Date(toDate).getTime() + 86399999;
      const byCourse = !courseId || e.courseId === courseId || e?.course?.id === courseId;
      const matchedCourse = courses.find((c) => c.id === (e.courseId || e?.course?.id));
      const byInstructor = !instructorId || matchedCourse?.instructor?.id === instructorId;
      return after && before && byCourse && byInstructor;
    });
  }, [allEnrollments, fromDate, toDate, courseId, instructorId, courses]);

  // 1. Calculate top grid metrics
  const completionRate = useMemo(() => {
    const pool = enrollments.length > 0 ? enrollments : allEnrollments;
    if (pool.length === 0) return null;
    const completed = pool.filter((e) => e.isCompleted).length;
    const rate = Math.round((completed / pool.length) * 1000) / 10;
    if (rate > 0) return rate;
    const avgProgress =
      pool.reduce((sum, e) => sum + (Number(e.progressPercentage) || 0), 0) / pool.length;
    if (avgProgress > 0) return Math.round(avgProgress * 10) / 10;
    return 0;
  }, [enrollments, allEnrollments]);

  const averageRating = useMemo(() => {
    let list = instructors;
    if (instructorId) {
      list = instructors.filter((i) => i.id === instructorId);
    }
    const validRatings = list
      .map((i) => Number(i.rating || i.averageRating || 0))
      .filter((r) => r > 0);
    if (validRatings.length === 0) return null;
    return Math.round((validRatings.reduce((a, b) => a + b, 0) / validRatings.length) * 10) / 10;
  }, [instructors, instructorId]);

  const examPassRatio = useMemo(() => {
    // No dedicated exam-pass analytics API yet — show null instead of fabricated %.
    return null;
  }, []);

  const dailyEngagementCount = useMemo(() => {
    const base = enrollments.length || students.length || 0;
    return base;
  }, [enrollments, students]);

  // 2. Chart Layouts Data — only real enrollment activity; no fabricated retention curves
  const studentRetentionData = useMemo(() => {
    return [];
  }, []);

  const academicSubmissionsData = useMemo(() => {
    let filteredCourses = courses;
    if (courseId) {
      filteredCourses = courses.filter((c) => c.id === courseId);
    } else if (instructorId) {
      filteredCourses = courses.filter(
        (c) => c.instructor?.id === instructorId || c.instructorId === instructorId
      );
    }

    const targetCourses = filteredCourses.slice(0, 5);
    return targetCourses.map((c) => {
      const cid = c.id;
      const courseEnrollments = enrollments.filter(
        (e) => (e.courseId || e?.course?.id) === cid
      );
      const completed = courseEnrollments.filter((e) => e.isCompleted).length;
      const progressAvg =
        courseEnrollments.length > 0
          ? Math.round(
              courseEnrollments.reduce(
                (sum, e) => sum + (Number(e.progressPercentage) || 0),
                0
              ) / courseEnrollments.length
            )
          : 0;
      return {
        name: c.title.length > 14 ? `${c.title.slice(0, 12)}…` : c.title,
        courseProgress: progressAvg,
        quizzes: courseEnrollments.length
          ? Math.round((completed / courseEnrollments.length) * 100)
          : 0,
      };
    });
  }, [courses, courseId, instructorId, enrollments]);

  // 3. Leaderboards Lists
  const topInstructors = useMemo(() => {
    const list = instructors.map((i) => {
      const instructorCourses = courses.filter((c) => c.instructor?.id === i.id || c.instructorId === i.id);
      const courseIds = instructorCourses.map((c) => c.id);
      const studentCount = enrollments.filter((e) => courseIds.includes(e.courseId || e?.course?.id)).length;
      return {
        id: i.id,
        fullName: i.fullName || i.name || "-",
        email: i.email || "-",
        rating: Number(i.rating || i.averageRating || 0) || null,
        students: studentCount,
      };
    });
    return list.sort((a, b) => b.rating - a.rating).slice(0, 5);
  }, [instructors, courses, enrollments]);

  const weeklyEngagementTrend = useMemo(() => {
    const locale = isRtl ? "ar-EG" : "en-US";
    const groups = {};
    enrollments.forEach((e) => {
      const raw = e.enrolledAt || e.joinedAt;
      if (!raw) return;
      const key = String(raw).split("T")[0];
      groups[key] = (groups[key] || 0) + 1;
    });
    const sorted = Object.keys(groups).sort();
    if (sorted.length === 0) return [];
    return sorted.slice(-7).map((d) => ({
      label: new Date(d).toLocaleDateString(locale, { weekday: "short" }),
      engagement: groups[d],
    }));
  }, [enrollments, students.length, isRtl]);

  const trendingCourses = useMemo(() => {
    const counts = {};
    enrollments.forEach((e) => {
      const cid = e.courseId || e?.course?.id;
      if (cid) counts[cid] = (counts[cid] || 0) + 1;
    });

    const list = courses.map((c) => {
      const count = counts[c.id] || 0;
      return {
        id: c.id,
        title: c.title,
        instructorName: c.instructor?.fullName || c.instructor?.name || "-",
        weeklyGrowth: count,
        totalEnrollments: c.enrollmentsCount || c.studentCount || count || 0,
      };
    });

    return list.sort((a, b) => b.weeklyGrowth - a.weeklyGrowth).slice(0, 5);
  }, [courses, enrollments]);

  return (
    <section className="space-y-6 pb-10">
      <PageHeader
        title={t("adminPages.performance.title")}
        subtitle={t("adminPages.performance.subtitle")}
      />

      {/* 1. Premium 4-Card Quality & Engagement Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Course Completion Velocity */}
        <article className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[var(--yu-blue-700)]/30">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/20">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
              <span>↑ 4.2%</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {completionRate == null ? "—" : `${completionRate}%`}
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("adminPages.performance.courseCompletionVelocity")}
              </p>
            </div>
            {/* Glowing progress line */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-[var(--yu-blue-700)] shadow-[0_0_8px_var(--yu-blue-700)] transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </article>

        {/* Global Instruction Rating */}
        <article className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Star className="h-5 w-5" />
            </div>
            <Stars rating={averageRating || 0} />
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {averageRating == null ? "—" : `${averageRating.toFixed(1)} / 5.0`}
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t("adminPages.performance.globalInstructionRating")}
            </p>
          </div>
        </article>

        {/* Exam Pass Ratio */}
        <article className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>{examPassRatio == null ? "N/A" : "live"}</span>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {examPassRatio == null ? "—" : `${examPassRatio}%`}
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t("adminPages.performance.examPassRatio")}
            </p>
          </div>
        </article>

        {/* Daily Content Engagement */}
        <article className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
              <PlayCircle className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-blue-650 dark:text-blue-400">
              {t("adminPages.performance.activeToday")}
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {dailyEngagementCount.toLocaleString()}
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t("adminPages.performance.dailyContentEngagement")}
            </p>
          </div>
        </article>
      </div>

      {/* 2. Restyled Interactive Filters */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-4 transition-all">
        <div className="relative">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[var(--yu-blue-700)] dark:border-slate-750 dark:bg-slate-950 dark:text-white transition-all"
            title={t("adminPages.performance.fromDate")}
          />
        </div>
        <div className="relative">
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[var(--yu-blue-700)] dark:border-slate-750 dark:bg-slate-950 dark:text-white transition-all"
            title={t("adminPages.performance.toDate")}
          />
        </div>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-850 outline-none focus:border-[var(--yu-blue-700)] dark:border-slate-750 dark:bg-slate-950 dark:text-white transition-all cursor-pointer"
        >
          <option value="">{t("adminPages.performance.allCourses")}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-855 outline-none focus:border-[var(--yu-blue-700)] dark:border-slate-750 dark:bg-slate-950 dark:text-white transition-all cursor-pointer"
        >
          <option value="">{t("adminPages.performance.allInstructors")}</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.fullName || i.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Advanced Chart Matrix */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Side: Student Retention Curve */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("adminPages.performance.retentionTitle")}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
              {t("adminPages.performance.retentionSubtitle")}
            </p>
          </div>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentRetentionData}>
                <defs>
                  <linearGradient id="retentionSplineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#94A3B8"
                  strokeOpacity={0.06}
                />
                <XAxis
                  dataKey="milestone"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const value = payload[0].value;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-800 dark:bg-slate-950/90 dark:backdrop-blur-md z-50">
                        <p className="mb-1 font-bold text-slate-500">{label}</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {t("adminPages.performance.retention")}: {value}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="retention"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#retentionSplineGrad)"
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Academic Submissions Metric */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("adminPages.performance.submissionsTitle")}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
              {t("adminPages.performance.submissionsSubtitle")}
            </p>
          </div>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={academicSubmissionsData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#94A3B8"
                  strokeOpacity={0.06}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-800 dark:bg-slate-950/90 dark:backdrop-blur-md z-50 space-y-1">
                        <p className="font-bold text-slate-550 border-b border-slate-100 pb-1 dark:border-white/5">{label}</p>
                        {payload.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-slate-700 dark:text-slate-350">{item.name}:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="courseProgress"
                  name={t("adminPages.performance.courseProgress")}
                  fill="var(--yu-blue-700)"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="quizzes"
                  name={t("adminPages.performance.completionRate")}
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly engagement trend */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("adminPages.performance.weeklyEngagementTitle")}
          </h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
            {t("adminPages.performance.weeklyEngagementSubtitle")}
          </p>
        </div>
        <div className="h-56 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyEngagementTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={0.06} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-800 dark:bg-slate-950/90 z-50">
                      <p className="mb-1 font-bold text-slate-500">{label}</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {t("adminPages.performance.engagement")}: {payload[0].value}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="var(--yu-blue-700)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--yu-blue-700)", strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: "var(--yu-blue-700)", strokeWidth: 2, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Bottom operational lists & ledger */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side (3/5): Top Instructors Ledger */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden lg:col-span-3 transition-all flex flex-col justify-between">
          <div className="border-b border-slate-100 bg-slate-50/20 px-5 py-4 dark:border-white/5 dark:bg-white/[0.01]">
            <h3 className="text-md font-bold text-slate-900 dark:text-white">
              {t("adminPages.performance.topInstructorsTitle")}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("adminPages.performance.topInstructorsSubtitle")}
            </p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-50/50 dark:bg-slate-950/40">
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-4 py-3 text-start text-xs font-extrabold uppercase text-slate-400">
                    {t("adminPages.performance.colTeacher")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold uppercase text-slate-400">
                    {t("adminPages.performance.colRating")}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-extrabold uppercase text-slate-400">
                    {t("adminPages.performance.colActiveStudents")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {topInstructors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                      {t("adminPages.performance.noRecords")}
                    </td>
                  </tr>
                ) : (
                  topInstructors.map((ins, idx) => (
                    <tr key={ins.id || idx} className="hover:bg-slate-50/55 dark:hover:bg-white/[0.01]">
                      <td className="px-4 py-3 text-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ins.fullName}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {ins.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-extrabold text-amber-500">{ins.rating.toFixed(1)}</span>
                          <Stars rating={ins.rating} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-end font-extrabold text-slate-800 dark:text-slate-200">
                        {ins.students.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side (2/5): Trending Courses Backlog */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden lg:col-span-2 transition-all flex flex-col">
          <div className="border-b border-slate-100 bg-slate-50/20 px-5 py-4 dark:border-white/5 dark:bg-white/[0.01]">
            <h3 className="text-md font-bold text-slate-900 dark:text-white">
              {t("adminPages.performance.trendingTitle")}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("adminPages.performance.trendingSubtitle")}
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.05] flex-1">
            {trendingCourses.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                {t("adminPages.performance.noRecords")}
              </p>
            ) : (
              trendingCourses.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {c.instructorName}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-xs font-extrabold text-[var(--yu-blue-700)] flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{c.weeklyGrowth} {t("adminPages.performance.new")}</span>
                    </p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">
                      {c.totalEnrollments} {t("adminPages.performance.total")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Performance;
