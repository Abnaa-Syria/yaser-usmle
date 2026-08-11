import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, Loader2, Search, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import { useDeleteMedia, useMediaLibrary, useUploadMedia } from "../../features/media/hooks";
import { getErrorMessage } from "../../api/error";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import useAuthStore from "../../store/authStore";
import { APP_ROLES, normalizeRole } from "../../config/permissions";

/**
 * Full-page media library used by admin and instructor.
 */
export default function MediaLibraryPage() {
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

  useEffect(() => setPage(1), [debounced]);

  const { data, isLoading, isError, error, refetch } = useMediaLibrary({
    page,
    limit: 30,
    search: debounced || undefined,
  });
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
      await uploadMutation.mutateAsync(file);
      toast.success(t("media.uploaded", { defaultValue: "Image uploaded." }));
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

  return (
    <section className="space-y-6 pb-10">
      <PageHeader
        title={t("media.libraryTitle", { defaultValue: "Media library" })}
        subtitle={t("media.librarySubtitle", {
          defaultValue: "Upload and manage images shared across courses, CMS, and banners.",
        })}
        actions={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--yu-blue-600)]">
            {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {t("media.upload", { defaultValue: "Upload" })}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} disabled={uploadMutation.isPending} />
          </label>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("media.search", { defaultValue: "Search by filename…" })}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pe-3 ps-10 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
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
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400 dark:border-white/10">
          <ImageIcon className="h-12 w-12" />
          <p className="text-sm font-medium">{t("media.empty", { defaultValue: "No media yet. Upload your first image." })}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
            <img src={resolveMediaUrl(item.url)} alt={item.originalName || ""} className="aspect-square w-full object-cover" />
            <div className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100" title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">{Math.round((item.sizeBytes || 0) / 1024)} KB</p>
              </div>
              {(canDeleteAny || item.uploadedById === user?.id) && (
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id, item.uploadedById)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:opacity-40">
            {t("dashboard.common.prev", { defaultValue: "Previous" })}
          </button>
          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:opacity-40">
            {t("dashboard.common.next", { defaultValue: "Next" })}
          </button>
        </div>
      ) : null}
    </section>
  );
}
