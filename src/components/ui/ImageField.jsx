import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderOpen, ImageIcon, Loader2, Link2, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import MediaPickerModal from "./MediaPickerModal";
import { useUploadMedia } from "../../features/media/hooks";
import { getErrorMessage } from "../../api/error";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

/**
 * Unified image field: upload, pick from library, or paste external URL.
 * @param {{ value: string, onChange: (url: string) => void, label?: string, required?: boolean, className?: string }} props
 */
export default function ImageField({ value = "", onChange, label, required = false, className = "" }) {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const uploadMutation = useUploadMedia();

  const preview = resolveMediaUrl(value);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const asset = await uploadMutation.mutateAsync(file);
      onChange?.(asset?.url || "");
      toast.success(t("media.uploaded", { defaultValue: "Image uploaded." }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("media.uploadFailed", { defaultValue: "Upload failed." })));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label ? (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="" className="h-40 w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-xs font-bold text-white backdrop-blur hover:bg-black/70"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("media.clear", { defaultValue: "Clear" })}
            </button>
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-400">
            <ImageIcon className="h-8 w-8" />
            <p className="text-xs font-medium">{t("media.noImage", { defaultValue: "No image selected" })}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-3 dark:border-white/10">
          <button
            type="button"
            disabled={uploadMutation.isPending}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--yu-blue-700)] px-3 py-2 text-xs font-bold text-white hover:bg-[var(--yu-blue-600)] disabled:opacity-50"
          >
            {uploadMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {t("media.upload", { defaultValue: "Upload" })}
          </button>
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {t("media.fromLibrary", { defaultValue: "Library" })}
          </button>
          <button
            type="button"
            onClick={() => setShowUrl((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200"
          >
            <Link2 className="h-3.5 w-3.5" />
            {t("media.url", { defaultValue: "URL" })}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
        </div>

        {showUrl ? (
          <div className="border-t border-slate-200 px-3 pb-3 dark:border-white/10">
            <input
              value={value || ""}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder="https://… or /uploads/…"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              dir="ltr"
            />
          </div>
        ) : null}
      </div>

      <MediaPickerModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => {
          onChange?.(url);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
}
