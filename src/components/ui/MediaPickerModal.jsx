import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, Loader2, Search, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteMedia, useMediaLibrary, useUploadMedia } from "../../features/media/hooks";
import { getErrorMessage } from "../../api/error";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import useAuthStore from "../../store/authStore";
import { APP_ROLES, normalizeRole } from "../../config/permissions";

export default function MediaPickerModal({ open, onClose, onSelect }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);
  const canDeleteAny = role === APP_ROLES.ADMIN;

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, debounced]);

  const { data, isLoading, isError, error, refetch } = useMediaLibrary(
    { page, limit: 24, search: debounced || undefined },
    { enabled: open }
  );
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();

  const items = data?.items || [];
  const meta = data?.meta || {};
  const totalPages = Math.max(1, meta.totalPages || 1);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const asset = await uploadMutation.mutateAsync(file);
      toast.success(t("media.uploaded", { defaultValue: "Image uploaded." }));
      if (asset?.url && onSelect) onSelect(asset.url);
    } catch (err) {
      toast.error(getErrorMessage(err, t("media.uploadFailed", { defaultValue: "Upload failed." })));
    }
  };

  const handleDelete = async (id, uploadedById) => {
    if (!canDeleteAny && uploadedById !== user?.id) {
      toast.error(t("media.deleteForbidden", { defaultValue: "You can only delete your own uploads." }));
      return;
    }
    if (!window.confirm(t("media.confirmDelete", { defaultValue: "Delete this media file?" }))) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t("media.deleted", { defaultValue: "Deleted." }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("media.deleteFailed", { defaultValue: "Delete failed." })));
    }
  };

  const hint = useMemo(
    () => t("media.pickerHint", { defaultValue: "Upload a new image or pick one from the library." }),
    [t]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#12121a]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t("media.libraryTitle", { defaultValue: "Media library" })}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3 dark:border-white/5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("media.search", { defaultValue: "Search by filename…" })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pe-3 ps-9 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--yu-blue-600)]">
            {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {t("media.upload", { defaultValue: "Upload" })}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} disabled={uploadMutation.isPending} />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("dashboard.common.loading", { defaultValue: "Loading…" })}
            </div>
          ) : null}
          {isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getErrorMessage(error, t("media.loadFailed", { defaultValue: "Could not load media." }))}
              <button type="button" onClick={() => void refetch()} className="ms-2 font-bold underline">
                {t("dashboard.common.retry", { defaultValue: "Retry" })}
              </button>
            </div>
          ) : null}
          {!isLoading && !isError && items.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
              <ImageIcon className="h-10 w-10" />
              <p className="text-sm font-medium">{t("media.empty", { defaultValue: "No media yet. Upload your first image." })}</p>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                <button type="button" className="block w-full" onClick={() => onSelect?.(item.url)}>
                  <img src={resolveMediaUrl(item.url)} alt={item.originalName || ""} className="aspect-square w-full object-cover" />
                </button>
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <p className="truncate text-[10px] font-medium text-slate-500" title={item.originalName}>
                    {item.originalName}
                  </p>
                  {(canDeleteAny || item.uploadedById === user?.id) && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id, item.uploadedById)}
                      className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm dark:border-white/5">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg px-3 py-1.5 font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10">
              {t("dashboard.common.prev", { defaultValue: "Previous" })}
            </button>
            <span className="text-slate-500">
              {page} / {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg px-3 py-1.5 font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10">
              {t("dashboard.common.next", { defaultValue: "Next" })}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
