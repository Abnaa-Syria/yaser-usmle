import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  GraduationCap,
  LineChart,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/** Shared payload shape for admin and instructor student performance APIs. */
export type StudentPerformancePayload = {
  exams: {
    totalTaken: number;
    averageScorePercent: number;
    passed: number;
    failed: number;
    passUndetermined: number;
    passRatePercent: number | null;
  };
  progress: {
    overallPercent: number;
    lessonCompletionRatePercent: number;
    courseProgressAveragePercent: number;
    completedLessonsCount: number;
    totalLessonsInEnrolledCourses: number;
  };
  recentGrades: Array<{
    kind: "exam";
    id: string;
    title: string;
    context?: string | null;
    score: number | null;
    maxPoints: number | null;
    percent: number | null;
    passed: boolean | null;
    occurredAt: string;
  }>;
};

/** @deprecated Use StudentPerformancePayload */
export type AdminStudentPerformancePayload = StudentPerformancePayload;

const I18N_PREFIX = "adminPages.studentDetail.perf";

function toneClass(pct: number): "green" | "amber" | "red" {
  if (pct >= 80) return "green";
  if (pct >= 50) return "amber";
  return "red";
}

const toneStyles = {
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  red: "border-red-500/40 bg-[var(--yu-blue-700)]/10 text-red-700 dark:text-red-300",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  pct,
}: {
  icon: typeof Target;
  label: string;
  value: string | number;
  sub?: string;
  pct: number;
}) {
  const t = toneClass(pct);
  return (
    <div className={`rounded-2xl border px-5 py-4 shadow-sm ${toneStyles[t]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>
          <p className="mt-2 text-3xl font-black tabular-nums text-slate-900 dark:text-white">{value}</p>
          {sub ? <p className="mt-1 text-xs font-medium opacity-80">{sub}</p> : null}
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 dark:bg-black/20">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Target; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--yu-blue-700)]" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function StudentPerformanceUI({ data }: { data: StudentPerformancePayload }) {
  const { t } = useTranslation();
  const ex = data.exams;
  const pr = data.progress;
  const recentExamGrades = data.recentGrades || [];

  const passPie = [
    { name: t(`${I18N_PREFIX}.passed`), value: ex.passed, fill: "#10B981" },
    { name: t(`${I18N_PREFIX}.failed`), value: ex.failed, fill: "#F87171" },
    { name: t(`${I18N_PREFIX}.pending`), value: ex.passUndetermined, fill: "#94A3B8" },
  ].filter((x) => x.value > 0);

  const ringData = [{ name: "overall", value: Math.min(100, pr.overallPercent), fill: "#8B5CF6" }];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          icon={Award}
          label={t(`${I18N_PREFIX}.avgExam`)}
          value={`${ex.averageScorePercent}%`}
          sub={t(`${I18N_PREFIX}.examsTaken`, { count: ex.totalTaken })}
          pct={ex.averageScorePercent}
        />
        <StatCard
          icon={TrendingUp}
          label={t(`${I18N_PREFIX}.overallProgress`)}
          value={`${Math.round(pr.overallPercent)}%`}
          sub={t(`${I18N_PREFIX}.lessonsDone`, {
            done: pr.completedLessonsCount,
            total: pr.totalLessonsInEnrolledCourses,
          })}
          pct={pr.overallPercent}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t(`${I18N_PREFIX}.examOutcomes`)} icon={GraduationCap}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="h-52" dir="ltr">
              {passPie.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={passPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
                      {passPie.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-slate-500">{t(`${I18N_PREFIX}.noExams`)}</p>
              )}
            </div>
            <div className="flex flex-col justify-center gap-2 text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {t(`${I18N_PREFIX}.passRate`)}:{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {ex.passRatePercent != null ? `${ex.passRatePercent}%` : "—"}
                </span>
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>✓ {t(`${I18N_PREFIX}.passed`)}: {ex.passed}</li>
                <li>✗ {t(`${I18N_PREFIX}.failed`)}: {ex.failed}</li>
                <li>? {t(`${I18N_PREFIX}.ungradedExam`)}: {ex.passUndetermined}</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title={t(`${I18N_PREFIX}.completionRing`)} icon={Target}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
            <div className="relative h-44 w-44" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="100%"
                  data={ringData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar background={{ fill: "rgba(148,163,184,0.25)" }} dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                  {Math.round(pr.overallPercent)}%
                </span>
              </div>
            </div>
            <div className="max-w-sm space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-semibold text-slate-900 dark:text-white">{t(`${I18N_PREFIX}.lessonBased`)}:</span>{" "}
                {pr.lessonCompletionRatePercent}%
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-white">{t(`${I18N_PREFIX}.cohortAvg`)}:</span>{" "}
                {pr.courseProgressAveragePercent}%
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section title={t(`${I18N_PREFIX}.recentGrades`)} icon={LineChart}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-start text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-white/10">
                <th className="pb-2 pe-3">{t(`${I18N_PREFIX}.colItem`)}</th>
                <th className="pb-2 pe-3">{t(`${I18N_PREFIX}.colScore`)}</th>
                <th className="pb-2">{t(`${I18N_PREFIX}.colDate`)}</th>
              </tr>
            </thead>
            <tbody>
              {recentExamGrades.length ? (
                recentExamGrades.map((row) => (
                  <tr key={`${row.kind}-${row.id}`} className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 pe-3 font-medium text-slate-800 dark:text-slate-200">
                      {row.title}
                      {row.context ? <span className="mt-0.5 block text-xs text-slate-500">{row.context}</span> : null}
                    </td>
                    <td className="py-2.5 pe-3 tabular-nums">
                      {row.score != null && row.maxPoints != null
                        ? `${row.score} / ${row.maxPoints}`
                        : row.percent != null
                          ? `${row.percent}%`
                          : "—"}
                      {row.passed != null ? (
                        <span className={row.passed ? " ms-1 text-emerald-600" : " ms-1 text-red-500"}>
                          {row.passed ? "✓" : "✗"}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {row.occurredAt ? new Date(row.occurredAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    {t(`${I18N_PREFIX}.noGrades`)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
