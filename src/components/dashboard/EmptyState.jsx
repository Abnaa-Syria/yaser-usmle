function EmptyState({ title, message, icon: Icon, action }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200/90 bg-white/80 p-10 text-center shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-white/10 dark:bg-[#0F1E38]/70">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,var(--yu-blue-50),#fff)] text-[var(--yu-blue-700)] ring-1 ring-[var(--yu-blue-100)] dark:bg-[var(--yu-blue-700)]/15 dark:text-[var(--yu-blue-300)] dark:ring-[var(--yu-blue-800)]">
        {Icon ? <Icon className="h-7 w-7" /> : <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-white/10" />}
      </div>
      <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">{message}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
