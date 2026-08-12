import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/error";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import {
  deleteAdminLessonResource,
  fetchAdminLessonResources,
  uploadAdminLessonResource,
} from "../../features/admin/resources/api";

const ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Manage PDF / Word / PowerPoint attachments on a lesson.
 */
export default function LessonResourcesPanel({ lessonId }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    if (!lessonId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await fetchAdminLessonResources(lessonId));
    } catch (err) {
      toast.error(
        getErrorMessage(err, isRtl ? "فشل تحميل الملفات" : "Failed to load files")
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId, isRtl]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !lessonId) return;
    setUploading(true);
    try {
      await uploadAdminLessonResource(lessonId, file, title);
      setTitle("");
      toast.success(isRtl ? "تم رفع الملف" : "File uploaded");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل رفع الملف" : "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isRtl ? "حذف هذا الملف؟" : "Delete this file?")) return;
    setDeletingId(id);
    try {
      await deleteAdminLessonResource(id);
      toast.success(isRtl ? "تم الحذف" : "Deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل الحذف" : "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  if (!lessonId) return null;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-[var(--yu-blue-700)]" />
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            {isRtl ? "ملفات الدرس" : "Lesson files"}
          </p>
          <p className="text-[11px] text-slate-500">
            {isRtl
              ? "PDF · Word · PowerPoint — تظهر للطالب في تبويب المواد"
              : "PDF · Word · PowerPoint — shown to students under Materials"}
          </p>
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {isRtl ? "عنوان الملف (اختياري)" : "File title (optional)"}
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isRtl ? "مثال: ملخص المحاضرة" : "e.g. Lecture handout"}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        />
      </label>

      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--yu-blue-700)]/40 bg-[var(--yu-blue-700)]/5 px-3 py-3 text-sm font-bold text-[var(--yu-blue-700)] transition hover:bg-[var(--yu-blue-700)]/10 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading
          ? isRtl
            ? "جاري الرفع..."
            : "Uploading..."
          : isRtl
            ? "رفع ملف (PDF / Word / PowerPoint)"
            : "Upload file (PDF / Word / PowerPoint)"}
      </button>
      <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={handleUpload} />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("dashboard.common.loading", { defaultValue: "Loading..." })}
        </div>
      ) : items.length === 0 ? (
        <p className="py-2 text-center text-xs text-slate-400">
          {isRtl ? "لا توجد ملفات مرفقة بعد." : "No files attached yet."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#0F0F13]">
          {items.map((item) => {
            const href = resolveMediaUrl(item.fileUrl || item.externalUrl);
            const size = formatBytes(item.fileSizeBytes);
            return (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={href || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-bold text-slate-800 hover:text-[var(--yu-blue-700)] dark:text-slate-100"
                  >
                    {item.title}
                  </a>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {[item.fileType || item.resourceType, size].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
                  aria-label={isRtl ? "حذف" : "Delete"}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
