import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Flame,
  Flag,
  Loader2,
  Plus,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import {
  useAdminChallenges,
  useAdminGamificationStats,
  useCreateAdminChallenge,
  useSeedAdminBadges,
} from "../../features/admin/gamification/hooks";
import { getErrorMessage } from "../../api/error";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

function mondayIso() {
  const now = new Date();
  const day = now.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
  return monday.toISOString().slice(0, 10);
}

export default function AdminGamification() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { data: stats, isLoading: statsLoading } = useAdminGamificationStats();
  const { data: challenges = [], isLoading: listLoading } = useAdminChallenges();
  const createChallenge = useCreateAdminChallenge();
  const seedBadges = useSeedAdminBadges();

  const [form, setForm] = useState({
    weekStart: mondayIso(),
    titleEn: "Complete 5 lessons this week",
    titleAr: "أكمل 5 دروس هذا الأسبوع",
    descriptionEn: "Stay consistent — finish five lessons before the week ends.",
    descriptionAr: "حافظ على الانتظام — أنهِ خمسة دروس قبل نهاية الأسبوع.",
    goalType: "COMPLETE_LESSONS",
    goalTarget: 5,
    rewardXp: 50,
    isActive: true,
  });

  useEffect(() => {
    setForm((f) => ({ ...f, weekStart: mondayIso() }));
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await createChallenge.mutateAsync({
        ...form,
        goalTarget: Number(form.goalTarget),
        rewardXp: Number(form.rewardXp),
      });
      toast.success(t("admin.gamification.created", { defaultValue: "Challenge created" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("admin.gamification.createFailed", { defaultValue: "Could not create challenge" })));
    }
  };

  const onSeed = async () => {
    try {
      await seedBadges.mutateAsync();
      toast.success(t("admin.gamification.seeded", { defaultValue: "Badge definitions seeded" }));
    } catch (err) {
      toast.error(getErrorMessage(err, "Seed failed"));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("admin.gamification.title", { defaultValue: "Platform Points" })}
        subtitle={t("admin.gamification.subtitle", {
          defaultValue: "Weekly challenges, badge seed, and active learner stats.",
        })}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/8 dark:bg-[#0F1E38]">
          <Users className="h-5 w-5 text-[var(--yu-blue-700)]" />
          <p className="mt-3 text-2xl font-black tabular-nums">
            {statsLoading ? "—" : stats?.activePlayers ?? 0}
          </p>
          <p className="text-xs font-bold text-slate-500">
            {t("admin.gamification.activePlayers", { defaultValue: "Active players (XP > 0)" })}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/8 dark:bg-[#0F1E38]">
          <Trophy className="h-5 w-5 text-[var(--yu-amber-500)]" />
          <p className="mt-3 text-2xl font-black tabular-nums">
            {statsLoading ? "—" : stats?.topXp ?? 0}
          </p>
          <p className="text-xs font-bold text-slate-500">
            {t("admin.gamification.topXp", { defaultValue: "Highest total XP" })}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/8 dark:bg-[#0F1E38]">
          <Flag className="h-5 w-5 text-emerald-600" />
          <p className="mt-3 text-sm font-black line-clamp-2">
            {statsLoading
              ? "—"
              : stats?.currentChallenge
                ? isAr
                  ? stats.currentChallenge.titleAr
                  : stats.currentChallenge.titleEn
                : t("admin.gamification.noChallenge", { defaultValue: "No active challenge" })}
          </p>
          <p className="text-xs font-bold text-slate-500">
            {t("admin.gamification.currentChallenge", { defaultValue: "Current weekly challenge" })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void onSeed()}
          disabled={seedBadges.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F1E38] dark:text-white"
        >
          {seedBadges.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {t("admin.gamification.seedBadges", { defaultValue: "Seed / refresh badges" })}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onCreate}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/8 dark:bg-[#0F1E38]"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[var(--yu-blue-700)]" />
            <h2 className="text-sm font-black">
              {t("admin.gamification.createChallenge", { defaultValue: "Create weekly challenge" })}
            </h2>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500">Week start (UTC Monday)</span>
            <input
              type="date"
              className={inputClass}
              value={form.weekStart}
              onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500">Title (EN)</span>
            <input className={inputClass} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500">Title (AR)</span>
            <input className={inputClass} value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} required dir="rtl" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500">Description (EN)</span>
            <textarea className={`${inputClass} h-20 py-2`} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500">Description (AR)</span>
            <textarea className={`${inputClass} h-20 py-2`} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} required dir="rtl" />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">Goal type</span>
              <select className={inputClass} value={form.goalType} onChange={(e) => setForm({ ...form, goalType: e.target.value })}>
                <option value="COMPLETE_LESSONS">COMPLETE_LESSONS</option>
                <option value="PASS_EXAMS">PASS_EXAMS</option>
                <option value="EARN_XP">EARN_XP</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">Target</span>
              <input type="number" min={1} className={inputClass} value={form.goalTarget} onChange={(e) => setForm({ ...form, goalTarget: e.target.value })} required />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">Reward XP</span>
              <input type="number" min={0} className={inputClass} value={form.rewardXp} onChange={(e) => setForm({ ...form, rewardXp: e.target.value })} required />
            </label>
          </div>
          <button
            type="submit"
            disabled={createChallenge.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--yu-blue-600)]"
          >
            {createChallenge.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
            {t("admin.gamification.save", { defaultValue: "Create challenge" })}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/8 dark:bg-[#0F1E38]">
          <h2 className="text-sm font-black">
            {t("admin.gamification.challengeList", { defaultValue: "Recent challenges" })}
          </h2>
          {listLoading ? (
            <p className="mt-4 text-sm text-slate-500">{t("dashboard.common.loading")}</p>
          ) : (
            <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
              {challenges.map((c) => (
                <li key={c.id} className="rounded-xl border border-slate-100 px-3 py-3 dark:border-white/8">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {isAr ? c.titleAr : c.titleEn}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {String(c.weekStart).slice(0, 10)} · {c.goalType} · {c.goalTarget} · +{c.rewardXp} XP
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                        c.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Off"}
                    </span>
                  </div>
                </li>
              ))}
              {!challenges.length ? (
                <li className="text-sm text-slate-400">
                  {t("admin.gamification.emptyChallenges", { defaultValue: "No challenges yet." })}
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
