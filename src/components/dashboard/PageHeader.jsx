function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--yu-blue-600)] dark:text-[var(--yu-blue-400)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-[1.85rem] dark:text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
