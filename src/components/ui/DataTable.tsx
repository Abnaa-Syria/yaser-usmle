function DataTable({ columns = [], rows = [], pagination = null, className = "", emptyMessage = null }) {
  return (
    <div
      className={`overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white/95 shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-white/8 dark:bg-[#0F1E38]/90 ${className}`}
    >
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[920px] border-collapse text-start">
          <thead className="bg-[linear-gradient(180deg,#F8FAFC_0%,#F1F5F9_100%)] dark:bg-[#0A1424]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3.5 text-start text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && emptyMessage ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-t border-slate-100/90 transition-colors hover:bg-[var(--yu-blue-50)]/50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-start text-sm font-medium text-slate-700 dark:text-slate-300">
                      {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="border-t border-slate-100/90 bg-slate-50/50 p-3 dark:border-white/6 dark:bg-white/[0.02]">
          {pagination}
        </div>
      ) : null}
    </div>
  );
}

export default DataTable;
