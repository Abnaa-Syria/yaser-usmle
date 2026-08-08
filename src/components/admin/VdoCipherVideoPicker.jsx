import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";

async function fetchVdoCipherVideos({ page = 1, limit = 20, q = "" } = {}) {
  const res = await client.get(endpoints.admin.vdocipherVideos, {
    params: { page, limit, ...(q ? { q } : {}) },
  });
  return res?.data?.data ?? { count: 0, rows: [], page: 1, limit };
}

function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

/**
 * @param {{
 *   value?: string,
 *   onSelect: (video: { id: string, title: string, length?: number }) => void,
 * }} props
 */
export default function VdoCipherVideoPicker({ value = "", onSelect }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "vdocipher-videos", page, search],
    queryFn: () => fetchVdoCipherVideos({ page, limit: 12, q: search }),
    enabled: open,
    retry: false,
    staleTime: 60_000,
  });

  const rows = data?.rows || [];
  const total = data?.count || 0;
  const limit = data?.limit || 12;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[var(--yu-blue-700)] hover:text-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200"
        >
          <Video className="h-3.5 w-3.5" />
          {open
            ? t("adminPages.courseEditor.vdoPicker.hide", { defaultValue: "Hide library" })
            : t("adminPages.courseEditor.vdoPicker.browse", { defaultValue: "Browse VdoCipher library" })}
        </button>
        {value ? (
          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            ID: {value}
          </span>
        ) : null}
      </div>

      {open ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#12121a]">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(q.trim());
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("adminPages.courseEditor.vdoPicker.search", {
                  defaultValue: "Search by title or video ID…",
                })}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white ps-8 pe-3 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[var(--yu-blue-700)] px-3 text-xs font-bold text-white hover:bg-[var(--yu-blue-600)]"
            >
              {t("common.search", { defaultValue: "Search" })}
            </button>
          </form>

          {isLoading || isFetching ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("dashboard.common.loading", { defaultValue: "Loading…" })}
            </div>
          ) : isError ? (
            <div className="space-y-2 py-6 text-center">
              <p className="text-xs text-rose-600">
                {getErrorMessage(
                  error,
                  t("adminPages.courseEditor.vdoPicker.error", {
                    defaultValue: "Could not load VdoCipher library. Check VDOCIPHER_API_SECRET.",
                  })
                )}
              </p>
              <button type="button" onClick={() => void refetch()} className="text-xs font-semibold text-[var(--yu-blue-700)]">
                {t("takeExam.retry", { defaultValue: "Retry" })}
              </button>
            </div>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              {t("adminPages.courseEditor.vdoPicker.empty", { defaultValue: "No videos found." })}
            </p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
              {rows.map((video) => {
                const selected = value === video.id;
                return (
                  <li key={video.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect({ id: video.id, title: video.title, length: video.length });
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-start transition ${
                        selected
                          ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/10"
                          : "border-transparent bg-white hover:border-slate-200 dark:bg-[#0F0F13] dark:hover:border-white/10"
                      }`}
                    >
                      {video.posterUrl ? (
                        <img src={video.posterUrl} alt="" className="h-10 w-16 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded bg-slate-200 dark:bg-white/10">
                          <Video className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{video.title}</p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">{video.id}</p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="text-[10px] font-bold uppercase text-slate-500">{video.status}</p>
                        <p className="text-[10px] text-slate-400">{formatDuration(video.length)}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {totalPages > 1 ? (
            <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-500">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="disabled:opacity-40"
              >
                {t("common.prev", { defaultValue: "Prev" })}
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="disabled:opacity-40"
              >
                {t("common.next", { defaultValue: "Next" })}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
