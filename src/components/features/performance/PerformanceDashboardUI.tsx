import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Star } from "lucide-react";

export type PerformanceQuestionRow = {
  question: string;
  avgRating: number;
  responses: number;
};

export type PerformanceDashboardData = {
  instructorRating?: number;
  totalReviews?: number;
  averageCourseRating?: number;
  reviews: {
    overallRating: number;
    totalResponses: number;
    distribution: Record<number, number>;
    questionBreakdown: PerformanceQuestionRow[];
  };
};

function SectionCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A22] dark:shadow-none">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-yu-blue-700" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export type PerformanceDashboardUIProps = {
  data: PerformanceDashboardData;
};

export function PerformanceDashboardUI({ data }: PerformanceDashboardUIProps) {
  const rev = data.reviews;
  const dist = rev.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxDist = Math.max(1, ...[1, 2, 3, 4, 5].map((k) => dist[k] || 0));

  return (
    <div className="space-y-6">
      <SectionCard icon={Star} title="Student evaluations">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-8 dark:bg-amber-500/10">
            <div className="text-5xl font-black text-amber-500">{rev.overallRating}</div>
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i <= Math.round(rev.overallRating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{rev.totalResponses} responses</p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const c = dist[stars] || 0;
              const w = (c / maxDist) * 100;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-semibold text-slate-600 dark:text-slate-300">{stars}★</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${w}%` }} />
                  </div>
                  <span className="w-8 text-end text-sm tabular-nums text-slate-500">{c}</span>
                </div>
              );
            })}
          </div>
        </div>

        {rev.questionBreakdown?.length ? (
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 dark:border-white/10">
            {rev.questionBreakdown.map((row) => (
              <div key={row.question} className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{row.question}</span>
                <span className="tabular-nums text-slate-500">
                  {row.avgRating} · {row.responses}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
