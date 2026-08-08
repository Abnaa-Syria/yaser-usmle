function EmptyState({ title, message, cta = null, className = "" }) {
  return (
    <div
      className={`rounded-[1.35rem] border border-dashed border-slate-200/90 bg-white/80 p-10 text-center shadow-[var(--shadow-sm)] dark:border-white/10 dark:bg-[#0F1E38]/70 ${className}`}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--yu-blue-50)] dark:bg-[var(--yu-blue-700)]/15">
        <div className="h-6 w-6 rounded-full bg-[var(--yu-blue-700)]/25" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
      {cta ? <div className="mt-5">{cta}</div> : null}
    </div>
  );
}

export default EmptyState;
