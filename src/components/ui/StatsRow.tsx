function StatsRow({ items = [], className = "" }) {
  const colsClass =
    items.length <= 2 ? "sm:grid-cols-2" : items.length === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";
  return (
    <div className={`grid gap-4 ${colsClass} ${className}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
              </div>
              {Icon ? (
                <div className={`rounded-lg p-2 ${item.iconWrap || "bg-slate-500/10 text-slate-400"}`}>
                  <Icon className="h-5 w-5" />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsRow;

