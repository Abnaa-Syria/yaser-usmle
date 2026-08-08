function FilterBar({ children, className = "" }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-slate-200/90 bg-white/95 p-4 shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-white/8 dark:bg-[#0F1E38]/90 ${className}`}
    >
      <div className="grid gap-3 lg:grid-cols-12">{children}</div>
    </div>
  );
}

export default FilterBar;
