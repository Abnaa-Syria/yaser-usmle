import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  FlaskConical,
  Play,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useTrialMe } from "../../features/trial/hooks";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

const FALLBACK =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=85&w=800&auto=format&fit=crop";

function StatCard({ label, value, hint, icon: Icon, href, tone = "blue" }) {
  const tones = {
    blue: "from-[var(--yu-blue-700)]/12 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)]",
    amber: "from-[var(--yu-amber-500)]/15 to-[var(--yu-amber-400)]/5 text-[var(--yu-amber-600)]",
    emerald: "from-emerald-500/12 to-emerald-400/5 text-emerald-700 dark:text-emerald-400",
  };
  const inner = (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#0F1E38]"
    >
      <div className={`absolute -end-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-80 blur-2xl ${tones[tone]}`} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {href ? <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[var(--yu-blue-600)]" /> : null}
      </div>
      <p className="relative mt-4 text-3xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">{value}</p>
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

export default function TrialDashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const ctx = useOutletContext() || {};
  const { data: me } = useTrialMe();
  const expired = ctx.expired || me?.expired;
  const remainingDays = ctx.remainingDays ?? me?.remainingDays ?? 0;
  const courses = me?.courses || [];
  const firstCourse = courses[0];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#07111F_0%,#1B4FBF_55%,#0B2A5A_100%)] p-6 text-white shadow-lg md:p-8">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-200">
              <FlaskConical className="h-3.5 w-3.5" />
              {t("trial.badge", { defaultValue: isRtl ? "تجربة مجانية" : "Free trial" })}
            </p>
            <h1 className="mt-3 text-2xl font-black leading-snug md:text-3xl">
              {t("trial.overviewHello", {
                defaultValue: isRtl ? "أهلاً بك في لوحة الطالب التجريبية" : "Welcome to the student trial panel",
              })}
            </h1>
            <p className="mt-2 text-sm font-medium text-blue-100/85">
              {t("trial.overviewBody", {
                defaultValue: isRtl
                  ? "نفس إحساس لوحة الطالب الحقيقي: كورساتك التجريبية، التعلّم، والقائمة الجانبية كاملة — بدون تسجيل حساب."
                  : "Same feel as the real student panel: trial courses, learning, and a full sidebar — without creating an account.",
              })}
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-[var(--yu-blue-900)]"
          >
            <UserPlus className="h-4 w-4" />
            {t("trial.saveProgress", { defaultValue: isRtl ? "أنشئ حساباً لحفظ تقدّمك" : "Create account to save progress" })}
          </Link>
        </div>
      </section>

      {expired ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          {t("trial.expiredBody", {
            defaultValue: isRtl
              ? "انتهت التجربة. سجّل حساباً أو سجّل الدخول لمتابعة التعلّم."
              : "Trial ended. Sign up or log in to continue learning.",
          })}
          <div className="mt-3 flex gap-2">
            <Link to="/signup" className="rounded-xl bg-[var(--yu-blue-700)] px-4 py-2 text-xs font-black text-white">
              {t("auth.signup.title", { defaultValue: isRtl ? "إنشاء حساب" : "Sign up" })}
            </Link>
            <Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
              {t("auth.login.title")}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("sidebarNav.items.myCourses")}
          value={courses.length}
          hint={t("trial.statCoursesHint", { defaultValue: isRtl ? "كورسات مفعّلة في تجربتك" : "Courses unlocked in your trial" })}
          icon={BookOpen}
          href="/trial/classes"
          tone="blue"
        />
        <StatCard
          label={t("trial.daysLeft", { defaultValue: isRtl ? "أيام متبقية" : "Days left" })}
          value={expired ? 0 : remainingDays}
          hint={t("trial.statDaysHint", { defaultValue: isRtl ? "مدة التجربة الحالية" : "Current trial window" })}
          icon={Sparkles}
          tone="amber"
        />
        <StatCard
          label={t("sidebarNav.items.exams")}
          value={courses.length ? "✓" : "—"}
          hint={t("trial.openLearningHint", { defaultValue: isRtl ? "مفتوح ضمن كورسات التجربة" : "Open inside trial courses" })}
          icon={ClipboardList}
          href="/trial/exams"
          tone="emerald"
        />
        <StatCard
          label={t("sidebarNav.items.recordings")}
          value={<Play className="inline h-7 w-7" />}
          hint={t("trial.recordingsHintShort", { defaultValue: isRtl ? "مكتبة فيديو التجربة" : "Trial video library" })}
          icon={Sparkles}
          href="/trial/recordings"
          tone="blue"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t("trial.continueLearning", { defaultValue: isRtl ? "تابع التعلّم" : "Continue learning" })}
          </h2>
          <Link to="/trial/classes" className="text-xs font-bold text-[var(--yu-blue-700)] hover:underline">
            {t("sidebarNav.items.myCourses")}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((course) => {
            const title = isRtl ? course.titleAr || course.title : course.title;
            return (
              <article
                key={course.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
              >
                <div className="relative aspect-[16/9] bg-slate-100 dark:bg-white/5">
                  <img src={resolveMediaUrl(course.thumbnail || course.coverImage) || FALLBACK} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="line-clamp-2 text-sm font-black text-slate-900 dark:text-white">{title}</h3>
                  {expired ? (
                    <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/5">
                      {t("trial.locked", { defaultValue: isRtl ? "مقفل" : "Locked" })}
                    </span>
                  ) : (
                    <Link
                      to={`/trial/courses/${course.id}/learn`}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] text-xs font-black text-white"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {t("trial.startLearning", { defaultValue: isRtl ? "ابدأ التعلم" : "Start learning" })}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {!courses.length ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10">
            {t("trial.noCourses", { defaultValue: isRtl ? "لا توجد كورسات في التجربة حالياً." : "No trial courses configured yet." })}
          </p>
        ) : null}

        {firstCourse && !expired ? (
          <Link
            to={`/trial/courses/${firstCourse.id}/learn`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--yu-blue-700)] hover:underline"
          >
            {t("trial.jumpFirst", { defaultValue: isRtl ? "افتح أول كورس تجريبي مباشرة" : "Jump into the first trial course" })}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
      </section>
    </div>
  );
}
