import { useMemo, useState } from "react";
import { Link, useLocation, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock3,
  FlaskConical,
  Globe,
  KeyRound,
  MessageSquare,
  Settings2,
  Sparkles,
  Target,
  Ticket,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { useTrialMe } from "../../features/trial/hooks";

function DemoBadge({ isRtl }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
      <FlaskConical className="h-3 w-3" />
      {isRtl ? "معاينة تجريبية · بيانات توضيحية" : "Trial preview · sample data"}
    </span>
  );
}

function ProgressRing({ value, size = 112, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-100 dark:text-white/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#trialMockProgress)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
        <defs>
          <linearGradient id="trialMockProgress" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1B4FBF" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">{value}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">demo</span>
      </div>
    </div>
  );
}

function MockProgress({ isRtl, courseTitle, remainingDays }) {
  const week = isRtl
    ? [
        { d: "س", v: 40 },
        { d: "ح", v: 65 },
        { d: "ن", v: 55 },
        { d: "ث", v: 80 },
        { d: "ر", v: 70 },
        { d: "خ", v: 90 },
        { d: "ج", v: 45 },
      ]
    : [
        { d: "S", v: 40 },
        { d: "M", v: 65 },
        { d: "T", v: 55 },
        { d: "W", v: 80 },
        { d: "T", v: 70 },
        { d: "F", v: 90 },
        { d: "S", v: 45 },
      ];

  const rows = [
    {
      title: courseTitle || (isRtl ? "كورس التجربة" : "Trial course"),
      pct: 38,
      lessons: isRtl ? "3 / 8 دروس" : "3 / 8 lessons",
    },
    {
      title: isRtl ? "اختبار المعرفة التجريبي" : "Trial knowledge check",
      pct: 72,
      lessons: isRtl ? "درجة توضيحية 7.2/10" : "Sample score 7.2/10",
    },
    {
      title: isRtl ? "بطاقات المراجعة" : "Flashcard review",
      pct: 54,
      lessons: isRtl ? "16 بطاقة مُراجعة" : "16 cards reviewed",
    },
  ];

  const activity = [
    {
      t: isRtl ? "فتحت درس How To Use" : "Opened How To Use lesson",
      ago: isRtl ? "منذ ساعتين" : "2h ago",
    },
    {
      t: isRtl ? "أنهيت بطاقة Active recall" : "Completed Active recall card",
      ago: isRtl ? "أمس" : "Yesterday",
    },
    {
      t: isRtl ? "بدأت اختبار التجربة" : "Started trial quiz",
      ago: isRtl ? "أمس" : "Yesterday",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#07111F_0%,#1B4FBF_55%,#0B2A5A_100%)] p-6 text-white shadow-lg md:p-8"
        >
          <div className="pointer-events-none absolute -end-8 -top-8 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
          <DemoBadge isRtl={isRtl} />
          <div className="relative mt-5 flex flex-wrap items-center gap-6">
            <ProgressRing value={46} />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black md:text-3xl">{isRtl ? "لوحة التقدّم" : "Progress board"}</h1>
              <p className="mt-2 max-w-md text-sm font-medium text-blue-100/85">
                {isRtl
                  ? "هنا يرى الطالب نسبة الإنجاز، نشاط الأسبوع، وما تبقّى من الخطة — هذه أرقام توضيحية داخل التجربة."
                  : "Students see completion rate, weekly activity, and what’s left — these are illustrative numbers inside the trial."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-white/10 px-3 py-1">{isRtl ? `${remainingDays} يوم متبقي` : `${remainingDays}d left`}</span>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-100">
                  {isRtl ? "الحفظ الدائم بعد إنشاء حساب" : "Permanent save after signup"}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-black text-slate-900 dark:text-white">{isRtl ? "نشاط الأسبوع" : "This week"}</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-5 flex h-36 items-end justify-between gap-2">
            {week.map((day) => (
              <div key={day.d + day.v} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-xl bg-slate-50 dark:bg-white/5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${day.v}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className="w-full rounded-xl bg-[linear-gradient(180deg,#1B4FBF,#F59E0B)]"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{day.d}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Target, label: isRtl ? "أهداف مكتملة" : "Goals done", value: "2/5" },
          { icon: Clock3, label: isRtl ? "وقت دراسة تقريبي" : "Study time", value: isRtl ? "4س 20د" : "4h 20m" },
          { icon: Sparkles, label: isRtl ? "سلسلة أيام" : "Streak", value: isRtl ? "3 أيام" : "3 days" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
          >
            <stat.icon className="h-4 w-4 text-[var(--yu-blue-700)]" />
            <p className="mt-3 text-2xl font-black tabular-nums text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#0F1E38]">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">{isRtl ? "تقدّم المسارات" : "Path progress"}</h2>
          {rows.map((row) => (
            <div key={row.title} className="rounded-2xl border border-slate-100 p-3 dark:border-white/5">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{row.title}</p>
                <span className="text-xs font-black tabular-nums text-[var(--yu-blue-700)]">{row.pct}%</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{row.lessons}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#1B4FBF,#F59E0B)]" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#0F1E38]">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">{isRtl ? "آخر النشاط" : "Recent activity"}</h2>
          <ul className="space-y-3">
            {activity.map((item) => (
              <li key={item.t} className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-3 dark:bg-white/5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.t}</p>
                  <p className="text-[11px] text-slate-400">{item.ago}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function MockStudyPlan({ isRtl }) {
  const [done, setDone] = useState({ 1: true, 2: false, 3: false, 4: true });
  const tasks = [
    { id: 1, day: isRtl ? "اليوم" : "Today", title: isRtl ? "شاهد محاضرة How To Use" : "Watch How To Use lecture", mins: 25 },
    { id: 2, day: isRtl ? "اليوم" : "Today", title: isRtl ? "راجع 10 بطاقات" : "Review 10 flashcards", mins: 15 },
    { id: 3, day: isRtl ? "غداً" : "Tomorrow", title: isRtl ? "اختبار المعرفة التجريبي" : "Trial knowledge check", mins: 15 },
    { id: 4, day: isRtl ? "هذا الأسبوع" : "This week", title: isRtl ? "لخّص مفاهيم Active recall" : "Summarize active recall concepts", mins: 20 },
  ];
  const completed = Object.values(done).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#0F1E38] md:p-8"
      >
        <DemoBadge isRtl={isRtl} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{isRtl ? "خطة الدراسة" : "Study plan"}</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {isRtl
                ? "الخطة تقسّم أيام الطالب لمهام قصيرة قابلة للتنفيذ. هنا نموذج توضيحي — الحفظ والمزامنة بعد التسجيل."
                : "The plan breaks study days into short actionable tasks. This is a sample — syncing starts after signup."}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--yu-blue-700)]/10 px-4 py-3 text-center">
            <p className="text-2xl font-black tabular-nums text-[var(--yu-blue-700)]">
              {completed}/{tasks.length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{isRtl ? "مهام توضيحية" : "Demo tasks"}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {(isRtl ? ["س", "ح", "ن", "ث", "ر", "خ", "ج"] : ["S", "M", "T", "W", "T", "F", "S"]).map((d, i) => (
            <div
              key={`${d}-${i}`}
              className={`rounded-2xl border px-2 py-3 text-center text-xs font-bold ${
                i === 1
                  ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)] text-white"
                  : "border-slate-200 text-slate-500 dark:border-white/10"
              }`}
            >
              <p>{d}</p>
              <p className="mt-1 text-[10px] opacity-80">{i + 8}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <section className="space-y-3">
        {tasks.map((task, i) => {
          const checked = Boolean(done[task.id]);
          return (
            <motion.button
              key={task.id}
              type="button"
              initial={{ opacity: 0, x: isRtl ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setDone((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-start transition ${
                checked
                  ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                  : "border-slate-200/80 bg-white dark:border-white/8 dark:bg-[#0F1E38]"
              }`}
            >
              {checked ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-300" />}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${checked ? "text-emerald-900 line-through dark:text-emerald-100" : "text-slate-900 dark:text-white"}`}>
                  {task.title}
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  {task.day} · {task.mins} {isRtl ? "د" : "min"}
                </p>
              </div>
              <Calendar className="h-4 w-4 text-slate-300" />
            </motion.button>
          );
        })}
      </section>
    </div>
  );
}

function MockQna({ isRtl }) {
  const threads = [
    {
      q: isRtl ? "كيف أستخدم التجربة المجانية بأفضل شكل؟" : "How should I use the free trial best?",
      a: isRtl
        ? "ابدأ بالمحاضرات، راجع البطاقات، ثم جرّب الاختبار القصير — كل ذلك على هذا الجهاز خلال مدة التجربة."
        : "Start with lectures, review flashcards, then try the short quiz — all on this device during the trial window.",
      tag: isRtl ? "توجيه" : "Guidance",
    },
    {
      q: isRtl ? "هل تُحفظ إجاباتي بعد انتهاء التجربة؟" : "Are my answers saved after the trial ends?",
      a: isRtl
        ? "محاولات التجربة مرتبطة بالجهاز مؤقتاً. أنشئ حساباً لحفظ التقدّم والنتائج بشكل دائم."
        : "Trial attempts are device-bound temporarily. Create an account to keep progress and results permanently.",
      tag: isRtl ? "حساب" : "Account",
    },
    {
      q: isRtl ? "متى أقدر أسأل د. ياسر مباشرة؟" : "When can I ask Dr. Yaser directly?",
      a: isRtl
        ? "بعد التسجيل والانضمام للكورس الكامل تفتح قناة الأسئلة والأجوبة الحقيقية مع المتابعة."
        : "After signup and full course access, the real Q&A channel with follow-up opens.",
      tag: isRtl ? "دعم" : "Support",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-[linear-gradient(135deg,#0B1A33,#1B4FBF)] p-6 text-white md:p-8"
      >
        <DemoBadge isRtl={isRtl} />
        <h1 className="mt-4 text-2xl font-black md:text-3xl">{isRtl ? "الأسئلة والأجوبة" : "Q&A"}</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-blue-100/90">
          {isRtl
            ? "هنا يطرح الطالب أسئلته ويصل رد المدرّس. المعروض الآن نماذج توضيحية لشكل التجربة بعد التسجيل."
            : "This is where students ask questions and get instructor replies. Below are sample threads showing the post-signup experience."}
        </p>
      </motion.section>

      <div className="space-y-4">
        {threads.map((thread, i) => (
          <motion.article
            key={thread.q}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
          >
            <div className="border-b border-slate-100 px-5 py-4 dark:border-white/5">
              <span className="rounded-full bg-[var(--yu-blue-700)]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[var(--yu-blue-700)]">
                {thread.tag}
              </span>
              <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{thread.q}</p>
            </div>
            <div className="flex gap-3 bg-slate-50/80 px-5 py-4 dark:bg-white/5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F59E0B,#1B4FBF)] text-[10px] font-black text-white">
                DY
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">{isRtl ? "د. ياسر · رد توضيحي" : "Dr. Yaser · sample reply"}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{thread.a}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function MockCertificates({ isRtl, courseTitle }) {
  const certs = [
    {
      title: isRtl ? "شهادة إتمام التجربة" : "Trial completion certificate",
      course: courseTitle || (isRtl ? "كورس التجربة" : "Trial course"),
      serial: "YU-TRIAL-DEMO-001",
      status: isRtl ? "معاينة" : "Preview",
    },
    {
      title: isRtl ? "شهادة اختبار المعرفة" : "Knowledge check certificate",
      course: isRtl ? "اختبار التجربة القصير" : "Trial knowledge quiz",
      serial: "YU-TRIAL-DEMO-002",
      status: isRtl ? "بعد التسجيل" : "After signup",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#07111F_0%,#102A56_50%,#B45309_120%)] p-6 text-white md:p-8"
      >
        <div className="pointer-events-none absolute -end-6 top-0 h-40 w-40 rounded-full bg-amber-300/25 blur-3xl" />
        <DemoBadge isRtl={isRtl} />
        <div className="relative mt-4 flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Award className="h-7 w-7 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black md:text-3xl">{isRtl ? "الشهادات" : "Certificates"}</h1>
            <p className="mt-1 max-w-xl text-sm text-blue-100/90">
              {isRtl
                ? "بعد إكمال الكورسات تظهر شهادات قابلة للتحقق والمشاركة. هذه نماذج توضح شكل الصفحة للطالب."
                : "After completing courses, verifiable shareable certificates appear here. These samples show the student view."}
            </p>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-2">
        {certs.map((cert, i) => (
          <motion.article
            key={cert.serial}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white p-5 shadow-sm dark:border-amber-500/20 dark:bg-[#0F1E38]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#1B4FBF,#F59E0B)]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">{cert.status}</p>
                <h2 className="mt-1 text-base font-black text-slate-900 dark:text-white">{cert.title}</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">{cert.course}</p>
              </div>
              <Award className="h-8 w-8 text-amber-500/80" />
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-500 dark:bg-white/5">{cert.serial}</p>
            <button
              type="button"
              disabled
              className="mt-3 inline-flex h-9 items-center rounded-xl bg-[var(--yu-blue-700)]/15 px-3 text-xs font-bold text-[var(--yu-blue-700)]"
            >
              {isRtl ? "تحميل / مشاركة (بعد الحساب)" : "Download / share (after account)"}
            </button>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function MockTickets({ isRtl }) {
  const tickets = [
    {
      id: "T-1042",
      title: isRtl ? "مشكلة في تشغيل فيديو التجربة" : "Trial video playback issue",
      status: isRtl ? "تم الحل" : "Resolved",
      tone: "emerald",
      updated: isRtl ? "منذ يومين" : "2 days ago",
    },
    {
      id: "T-1088",
      title: isRtl ? "استفسار عن مدة التجربة على الجهاز" : "Question about device trial duration",
      status: isRtl ? "قيد المتابعة" : "In progress",
      tone: "amber",
      updated: isRtl ? "منذ 5 ساعات" : "5h ago",
    },
    {
      id: "T-1101",
      title: isRtl ? "طلب تفعيل كورس إضافي للتجربة" : "Request extra trial course",
      status: isRtl ? "جديد" : "New",
      tone: "blue",
      updated: isRtl ? "اليوم" : "Today",
    },
  ];

  const toneClass = {
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
    blue: "bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)]",
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#0F1E38] md:p-8"
      >
        <DemoBadge isRtl={isRtl} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)]">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{isRtl ? "التذاكر" : "Support tickets"}</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {isRtl
                ? "الطالب يفتح تذكرة دعم ويتابع الردود هنا. المعروض تذاكر توضيحية لشكل لوحة الدعم."
                : "Students open support tickets and track replies here. Below are sample tickets showing the support desk."}
            </p>
          </div>
        </div>
      </motion.section>

      <div className="space-y-3">
        {tickets.map((ticket, i) => (
          <motion.article
            key={ticket.id}
            initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400">{ticket.id}</p>
              <p className="truncate text-sm font-black text-slate-900 dark:text-white">{ticket.title}</p>
              <p className="mt-1 text-[11px] text-slate-400">{ticket.updated}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${toneClass[ticket.tone]}`}>
              {ticket.status}
            </span>
          </motion.article>
        ))}
      </div>

      <button
        type="button"
        disabled
        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--yu-blue-700)] px-4 text-sm font-black text-white opacity-70"
      >
        <MessageSquare className="h-4 w-4" />
        {isRtl ? "فتح تذكرة جديدة (بعد إنشاء حساب)" : "Open new ticket (after signup)"}
      </button>
    </div>
  );
}

function MockSettings({ isRtl }) {
  const rows = [
    {
      icon: Globe,
      title: isRtl ? "اللغة" : "Language",
      value: isRtl ? "العربية / English" : "Arabic / English",
    },
    {
      icon: Bell,
      title: isRtl ? "الإشعارات" : "Notifications",
      value: isRtl ? "تذكير يومي · بريد أسبوعي" : "Daily reminder · weekly email",
    },
    {
      icon: KeyRound,
      title: isRtl ? "الأمان" : "Security",
      value: isRtl ? "كلمة المرور · الجلسات" : "Password · sessions",
    },
    {
      icon: Settings2,
      title: isRtl ? "تفضيلات التعلّم" : "Learning preferences",
      value: isRtl ? "سرعة الفيديو · الترجمة" : "Playback speed · captions",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#0F1E38] md:p-8"
      >
        <DemoBadge isRtl={isRtl} />
        <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{isRtl ? "الإعدادات" : "Settings"}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
          {isRtl
            ? "حساب الطالب يضبط اللغة والإشعارات والأمان من هنا. هذه بطاقات توضيحية — الحفظ الحقيقي بعد التسجيل."
            : "Student accounts manage language, notifications, and security here. These cards are illustrative — real saves after signup."}
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-white/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F59E0B,#1B4FBF)] text-sm font-black text-white">
            TR
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{isRtl ? "ضيف التجربة" : "Trial guest"}</p>
            <p className="text-[11px] text-slate-400">{isRtl ? "جلسة مرتبطة بهذا الجهاز" : "Session bound to this device"}</p>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row, i) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
          >
            <row.icon className="h-4 w-4 text-[var(--yu-blue-700)]" />
            <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">{row.title}</p>
            <p className="mt-1 text-xs text-slate-500">{row.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function TrialMockFeature({ feature: featureProp } = {}) {
  const params = useParams();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const ctx = useOutletContext() || {};
  const { data: me } = useTrialMe();
  const courses = me?.courses || ctx.me?.courses || [];
  const remainingDays = ctx.remainingDays ?? me?.remainingDays ?? 3;
  const courseTitle = useMemo(() => {
    const c = courses[0];
    if (!c) return "";
    return isRtl ? c.titleAr || c.title : c.title;
  }, [courses, isRtl]);

  const fromPath = location.pathname.replace(/^\/trial\/?/, "").split("/").filter(Boolean)[0];
  const feature = featureProp || params.feature || fromPath || "progress";

  let body = null;
  if (feature === "study-plan") body = <MockStudyPlan isRtl={isRtl} />;
  else if (feature === "qna") body = <MockQna isRtl={isRtl} />;
  else if (feature === "certificates") body = <MockCertificates isRtl={isRtl} courseTitle={courseTitle} />;
  else if (feature === "tickets") body = <MockTickets isRtl={isRtl} />;
  else if (feature === "settings") body = <MockSettings isRtl={isRtl} />;
  else body = <MockProgress isRtl={isRtl} courseTitle={courseTitle} remainingDays={remainingDays} />;

  return (
    <div className="space-y-6" data-trial-mock={feature}>
      {body}

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-amber-300/70 bg-amber-50/70 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
        <p className="text-xs font-semibold text-amber-950 dark:text-amber-100">
          {isRtl
            ? "هذه شاشة توضيحية داخل التجربة — أنشئ حساباً لتفعيل البيانات الحقيقية والحفظ."
            : "This is an in-trial demo screen — create an account to unlock live data and saving."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/trial/classes"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-3 text-xs font-black text-white"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {t("sidebarNav.items.myCourses")}
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 text-xs font-bold text-amber-950 dark:border-amber-500/30 dark:bg-transparent dark:text-amber-100"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {t("trial.saveProgress", { defaultValue: isRtl ? "أنشئ حساباً" : "Create account" })}
          </Link>
        </div>
      </section>
    </div>
  );
}
