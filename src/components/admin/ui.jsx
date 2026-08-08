/**
 * Shared visual primitives for the admin / super-admin dashboard shell.
 */
export const adminFieldClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-[var(--shadow-sm)] outline-none transition placeholder:text-slate-400 focus:border-[var(--yu-blue-400)] focus:ring-4 focus:ring-[var(--yu-blue-500)]/10 dark:border-white/10 dark:bg-[#0C1829] dark:text-white dark:placeholder:text-slate-500";

export const adminSelectClass = `${adminFieldClass} pe-9`;

export const adminBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition hover:bg-[var(--yu-blue-600)] disabled:cursor-not-allowed disabled:opacity-50";

export const adminBtnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-[var(--shadow-sm)] transition hover:border-[var(--yu-blue-200)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200";

export function AdminSurface({ children, className = "", padded = true, as: Tag = "div" }) {
  return (
    <Tag
      className={[
        "admin-surface overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/92 shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-white/8 dark:bg-[#0F1E38]/88",
        padded ? "p-5 sm:p-6" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

export function AdminStat({ label, value, hint, icon: Icon, tone = "blue", href }) {
  const tones = {
    blue: "from-[var(--yu-blue-700)]/12 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)]",
    amber: "from-[var(--yu-amber-500)]/15 to-amber-400/5 text-[var(--yu-amber-600)]",
    emerald: "from-emerald-500/12 to-emerald-400/5 text-emerald-700 dark:text-emerald-400",
    rose: "from-rose-500/12 to-rose-400/5 text-rose-700 dark:text-rose-400",
    slate: "from-slate-500/10 to-slate-400/5 text-slate-700 dark:text-slate-300",
  };
  const inner = (
    <AdminSurface className="relative overflow-hidden transition hover:border-[var(--yu-blue-200)] hover:shadow-[var(--shadow-md)]">
      <div className={`absolute -end-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-80 blur-2xl ${tones[tone]}`} aria-hidden />
      <div className={`relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
      <p className="relative text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="relative mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">{label}</p>
      {hint ? <p className="relative mt-1 text-[11px] font-medium text-slate-400">{hint}</p> : null}
    </AdminSurface>
  );
  if (href) {
    return (
      <a href={href} className="block no-underline">
        {inner}
      </a>
    );
  }
  return inner;
}

export function AdminToolbar({ children, className = "" }) {
  return (
    <AdminSurface className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}>
      {children}
    </AdminSurface>
  );
}

export function AdminBadge({ children, tone = "blue" }) {
  const map = {
    blue: "bg-[var(--yu-blue-50)] text-[var(--yu-blue-800)] border-[var(--yu-blue-100)] dark:bg-[var(--yu-blue-700)]/15 dark:text-[var(--yu-blue-300)] dark:border-[var(--yu-blue-800)]",
    amber: "bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-900/40",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-900/40",
    rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-900/40",
    slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-white/5 dark:text-slate-300 dark:border-white/10",
  };
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${map[tone] || map.blue}`}>
      {children}
    </span>
  );
}

export function AdminTableShell({ children }) {
  return (
    <AdminSurface padded={false} className="overflow-x-auto">
      {children}
    </AdminSurface>
  );
}

export function AdminPageHero({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="relative mb-7 overflow-hidden rounded-[1.5rem] border border-[var(--yu-blue-800)]/25 bg-[linear-gradient(125deg,#050B16_0%,#0F2448_45%,#1B4FBF_100%)] p-5 text-white shadow-[var(--shadow-brand)] sm:mb-8 sm:p-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(96,165,250,0.35), transparent 40%), radial-gradient(circle at 88% 15%, rgba(251,191,36,0.18), transparent 35%)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          {eyebrow ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/80">{eyebrow}</p>
          ) : null}
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm font-medium leading-relaxed text-blue-100/85">{subtitle}</p> : null}
        </div>
        {actions ? <div className="relative flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
