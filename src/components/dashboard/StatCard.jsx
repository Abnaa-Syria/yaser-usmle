import { useTranslation } from "react-i18next";

function StatCard({ label, value, icon: Icon, colorClass = "blue", trend, trendLabel, trendUp = true }) {
  const { t } = useTranslation();
  const isZero = value === 0 || value === "0";
  
  const themes = {
    blue: { bg: "bg-blue-500/20", icon: "text-blue-500", border: "border-t-blue-500" },
    purple: { bg: "bg-purple-500/20", icon: "text-purple-500", border: "border-t-purple-500" },
    amber: { bg: "bg-amber-500/20", icon: "text-amber-500", border: "border-t-amber-500" },
    green: { bg: "bg-green-500/20", icon: "text-green-500", border: "border-t-green-500" },
  };

  const theme = themes[colorClass] || themes.blue;

  return (
    <article className={`group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:border-white/8 dark:bg-[#1A1A22] dark:hover:border-white/15 dark:hover:bg-[#1E1E2A] ${theme.border}`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${theme.bg}`}>
          {Icon && <Icon className={`h-5 w-5 ${theme.icon}`} />}
        </div>
        
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ltr-only ${
              trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            }`}
            dir="ltr"
          >
            {trendUp ? "↑" : "↓"} {trend}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="flex flex-col">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 ltr-only dark:text-white" dir="ltr">
            {isZero ? "—" : value}
          </p>
          {isZero && (
            <p className="text-[10px] font-medium text-slate-600">
              {t("common.noDataYet", { defaultValue: "No data yet" })}
            </p>
          )}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </p>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold ltr-only ${trendUp ? "text-emerald-500" : "text-rose-500"}`} dir="ltr">
            {trendUp ? "↑" : "↓"} {trend}
          </span>
          <span className="text-[10px] font-medium text-slate-600">{trendLabel}</span>
        </div>
      )}
    </article>
  );
}

export default StatCard;
