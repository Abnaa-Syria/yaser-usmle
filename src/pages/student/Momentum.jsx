import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Award,
  Flame,
  Flag,
  Sparkles,
  Trophy,
  TrendingUp,
} from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { StudentSurface } from "../../components/student/ui";
import {
  useGamificationBadges,
  useGamificationLeaderboard,
  useMyGamification,
} from "../../features/student/gamification/hooks";
import { useMyCourses } from "../../features/student/courses/hooks";

function XpBar({ progress }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress || 0))}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-[var(--yu-blue-700)] to-[var(--yu-amber-400)]"
      />
    </div>
  );
}

export default function Momentum() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const [period, setPeriod] = useState("week");
  const [scope, setScope] = useState("global");
  const [courseId, setCourseId] = useState("");

  const { data: me, isLoading } = useMyGamification();
  const { data: courses = [] } = useMyCourses();
  const { data: board } = useGamificationLeaderboard({
    scope,
    period,
    courseId: scope === "course" ? courseId || undefined : undefined,
  });
  const { data: badgeCatalog = [] } = useGamificationBadges();

  const profile = me?.profile;
  const challenge = me?.challenge;
  const challengePct = challenge
    ? Math.min(100, Math.round(((challenge.progress || 0) / Math.max(1, challenge.goalTarget)) * 100))
    : 0;

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        id: c.courseId ?? c.id,
        title: c.title || c.course?.title || "Course",
      })),
    [courses]
  );

  return (
    <div className="space-y-8 pb-6">
      <PageHeader
        eyebrow={t("student.gamification.brand", { defaultValue: "Platform Points" })}
        title={t("student.gamification.title", { defaultValue: isAr ? "نقاط المنصة" : "Platform Points" })}
        subtitle={t("student.gamification.subtitle", {
          defaultValue: isAr
            ? "تتبع نقاط الإتقان، السلسلة، الشارات، والترتيب التنافسي."
            : "Track mastery XP, streaks, badges, and competitive rankings.",
        })}
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StudentSurface className="md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t("student.gamification.level", { defaultValue: "Level" })} {profile?.level ?? 1}
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums text-slate-900 dark:text-white">
                    {profile?.totalXp ?? 0}{" "}
                    <span className="text-base font-bold text-slate-400">XP</span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {t("student.gamification.xpToNext", {
                      count: profile?.xpToNext ?? 0,
                      defaultValue: "{{count}} XP to next level",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-orange-200/80 bg-orange-50/80 px-4 py-3 dark:border-orange-500/20 dark:bg-orange-500/10">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">
                      {profile?.currentStreak ?? 0}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500">
                      {t("student.gamification.streak", { defaultValue: "Day streak" })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <XpBar progress={profile?.levelProgress} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-white/10">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t("student.gamification.weekXp", { defaultValue: "This week" })}: {me?.weekXp ?? 0} XP
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-white/10">
                  <Trophy className="h-3.5 w-3.5" />
                  {t("student.gamification.rank", { defaultValue: "Global rank" })}:{" "}
                  {me?.globalRank ?? "—"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-white/10">
                  {t("student.gamification.longestStreak", { defaultValue: "Best streak" })}:{" "}
                  {profile?.longestStreak ?? 0}
                </span>
              </div>
            </StudentSurface>

            <StudentSurface>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-[var(--yu-blue-700)]" />
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {t("student.gamification.weeklyChallenge", { defaultValue: "Weekly challenge" })}
                </p>
              </div>
              {challenge ? (
                <>
                  <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                    {isAr ? challenge.titleAr : challenge.titleEn}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {isAr ? challenge.descriptionAr : challenge.descriptionEn}
                  </p>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-500">
                      <span>
                        {challenge.progress}/{challenge.goalTarget}
                      </span>
                      <span>+{challenge.rewardXp} XP</span>
                    </div>
                    <XpBar progress={challengePct} />
                  </div>
                  {challenge.completedAt ? (
                    <p className="mt-3 text-xs font-bold text-emerald-600">
                      {t("student.gamification.challengeDone", { defaultValue: "Challenge completed!" })}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">—</p>
              )}
            </StudentSurface>
          </div>

          <StudentSurface>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[var(--yu-amber-500)]" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {t("student.gamification.leaderboard", { defaultValue: "Leaderboard" })}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold dark:border-white/10 dark:bg-[#0F1E38]"
                >
                  <option value="global">{t("student.gamification.scopeGlobal", { defaultValue: "Platform" })}</option>
                  <option value="course">{t("student.gamification.scopeCourse", { defaultValue: "Course" })}</option>
                </select>
                {scope === "course" ? (
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="h-9 max-w-[200px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold dark:border-white/10 dark:bg-[#0F1E38]"
                  >
                    <option value="">{t("student.gamification.pickCourse", { defaultValue: "Select course" })}</option>
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                ) : null}
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold dark:border-white/10 dark:bg-[#0F1E38]"
                >
                  <option value="week">{t("student.gamification.periodWeek", { defaultValue: "This week" })}</option>
                  <option value="all">{t("student.gamification.periodAll", { defaultValue: "All time" })}</option>
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-start text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:border-white/8">
                    <th className="py-2 pe-3">{t("student.gamification.colRank", { defaultValue: "Rank" })}</th>
                    <th className="py-2 pe-3">{t("student.gamification.colName", { defaultValue: "Learner" })}</th>
                    <th className="py-2 pe-3">{t("student.gamification.colLevel", { defaultValue: "Level" })}</th>
                    <th className="py-2 text-end">{t("student.gamification.colXp", { defaultValue: "XP" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {(board?.entries || []).map((row) => (
                    <tr
                      key={row.userId}
                      className={`border-b border-slate-50 dark:border-white/5 ${row.isMe ? "bg-[var(--yu-blue-700)]/5" : ""}`}
                    >
                      <td className="py-2.5 pe-3 font-black tabular-nums text-slate-700 dark:text-slate-200">{row.rank}</td>
                      <td className="py-2.5 pe-3 font-semibold text-slate-800 dark:text-slate-100">
                        {row.displayName}
                        {row.isMe ? (
                          <span className="ms-2 text-[10px] font-bold text-[var(--yu-blue-700)]">
                            {t("student.gamification.you", { defaultValue: "You" })}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pe-3 tabular-nums text-slate-500">{row.level}</td>
                      <td className="py-2.5 text-end font-bold tabular-nums text-slate-900 dark:text-white">{row.totalXp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!board?.entries?.length ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  {t("student.gamification.emptyBoard", { defaultValue: "No ranked learners yet — complete a lesson to start." })}
                </p>
              ) : null}
              {board?.me && !board.entries?.some((e) => e.isMe) ? (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {t("student.gamification.yourRank", {
                    rank: board.me.rank,
                    xp: board.me.totalXp,
                    defaultValue: "Your rank: #{{rank}} · {{xp}} XP",
                  })}
                </p>
              ) : null}
            </div>
          </StudentSurface>

          <div className="grid gap-4 lg:grid-cols-2">
            <StudentSurface>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[var(--yu-blue-700)]" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {t("student.gamification.badges", { defaultValue: "Mastery badges" })}
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {badgeCatalog.map((b) => {
                  const earned = !!b.earnedAt;
                  return (
                    <div
                      key={b.key}
                      className={`rounded-xl border p-3 ${
                        earned
                          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                          : "border-slate-200/80 bg-slate-50/50 opacity-70 dark:border-white/8 dark:bg-white/5"
                      }`}
                    >
                      <Sparkles className={`h-4 w-4 ${earned ? "text-emerald-600" : "text-slate-400"}`} />
                      <p className="mt-2 text-xs font-black text-slate-800 dark:text-slate-100">
                        {isAr ? b.titleAr : b.titleEn}
                      </p>
                      <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">
                        {isAr ? b.descriptionAr : b.descriptionEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            </StudentSurface>

            <StudentSurface>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {t("student.gamification.recentXp", { defaultValue: "Recent XP" })}
              </h2>
              <ul className="mt-4 space-y-2">
                {(me?.recentXp || []).slice(0, 12).map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-white/8"
                  >
                    <span className="font-medium text-slate-600 dark:text-slate-300">{row.reason}</span>
                    <span className="shrink-0 font-black tabular-nums text-[var(--yu-blue-700)]">+{row.amount}</span>
                  </li>
                ))}
                {!me?.recentXp?.length ? (
                  <li className="text-sm text-slate-400">
                    {t("student.gamification.noXpYet", { defaultValue: "Complete lessons and exams to earn XP." })}
                  </li>
                ) : null}
              </ul>
              <Link
                to="/student/settings"
                className="mt-4 inline-block text-xs font-bold text-[var(--yu-blue-700)] hover:underline"
              >
                {t("student.gamification.privacyLink", { defaultValue: "Leaderboard privacy settings" })}
              </Link>
            </StudentSurface>
          </div>
        </>
      )}
    </div>
  );
}
