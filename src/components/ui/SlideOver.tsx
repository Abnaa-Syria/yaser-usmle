function SlideOver({ open, title, onClose, children, className = "" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="slide-over-title">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside
        className={`absolute inset-y-0 start-0 z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto overscroll-y-contain border-e border-slate-200 bg-white p-5 shadow-2xl dark:border-white/8 dark:bg-[#1A1A22] ${className}`}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          <h3 id="slide-over-title" className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </aside>
    </div>
  );
}

export default SlideOver;
