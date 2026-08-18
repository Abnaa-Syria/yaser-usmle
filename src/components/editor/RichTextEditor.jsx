import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Type,
  Underline,
  Undo2,
  Upload,
  Video,
} from "lucide-react";
import MediaPickerModal from "../ui/MediaPickerModal";
import { useUploadMedia } from "../../features/media/hooks";
import { videoEmbedHtml } from "../../utils/postContent";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/error";

const FONT_SIZES = [
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
  { value: "28px", label: "28" },
  { value: "32px", label: "32" },
];

const FONT_FACES = [
  { value: "Alexandria, Inter, sans-serif", labelAr: "الخط الافتراضي", labelEn: "Default" },
  { value: "Georgia, serif", labelAr: "serif", labelEn: "Serif" },
  { value: "Inter, sans-serif", labelAr: "Inter", labelEn: "Inter" },
];

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick?.();
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 ${
        active ? "border-[var(--yu-blue-400)] bg-[var(--yu-blue-50)] text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/20" : "border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value = "", onChange, dir = "ltr", placeholder = "" }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const lastHtml = useRef(value || "");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const uploadMutation = useUploadMedia();

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if ((value || "") !== lastHtml.current) {
      el.innerHTML = value || "";
      lastHtml.current = value || "";
    }
  }, [value]);

  const emit = () => {
    const html = editorRef.current?.innerHTML || "";
    lastHtml.current = html;
    onChange?.(html);
  };

  const run = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const wrapHeading = (tag) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    emit();
  };

  const applyFontSize = (size) => {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("fontSize", false, "7");
    editorRef.current?.querySelectorAll('font[size="7"], span[style*="font-size: xxx-large"]').forEach((node) => {
      node.removeAttribute("size");
      node.style.fontSize = size;
    });
    emit();
  };

  const applyFontFace = (face) => {
    editorRef.current?.focus();
    document.execCommand("fontName", false, face);
    emit();
  };

  const applyColor = (color) => {
    editorRef.current?.focus();
    document.execCommand("foreColor", false, color);
    emit();
  };

  const insertHtml = (html) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    emit();
  };

  const insertLink = () => {
    const url = window.prompt(t("adminPages.cmsPosts.editor.linkPrompt", { defaultValue: isRtl ? "أدخل الرابط" : "Enter URL" }));
    if (!url?.trim()) return;
    run("createLink", url.trim());
  };

  const insertImage = (url) => {
    const src = resolveMediaUrl(url) || url;
    if (!src) return;
    insertHtml(`<img src="${src}" alt="" />`);
  };

  const insertVideo = () => {
    const html = videoEmbedHtml(videoUrl.trim());
    if (!html) {
      toast.error(t("adminPages.cmsPosts.editor.videoInvalid", { defaultValue: isRtl ? "رابط الفيديو غير صالح." : "Invalid video URL." }));
      return;
    }
    insertHtml(html);
    setVideoUrl("");
    setVideoOpen(false);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const asset = await uploadMutation.mutateAsync(file);
      insertImage(asset?.url || "");
      toast.success(t("media.uploaded", { defaultValue: "Image uploaded." }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("media.uploadFailed", { defaultValue: "Upload failed." })));
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0F0F13]">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/90 p-2 dark:border-white/10 dark:bg-white/5">
        <ToolbarButton title="Undo" onClick={() => run("undo")}><Undo2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => run("redo")}><Redo2 className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />
        <ToolbarButton title="H1" onClick={() => wrapHeading("h1")}><Heading1 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="H2" onClick={() => wrapHeading("h2")}><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="H3" onClick={() => wrapHeading("h3")}><Heading3 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Paragraph" onClick={() => wrapHeading("p")}><Type className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />
        <ToolbarButton title="Bold" onClick={() => run("bold")}><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => run("italic")}><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => run("underline")}><Underline className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Strike" onClick={() => run("strikeThrough")}><Strikethrough className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />
        <select
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) applyFontSize(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>{t("adminPages.cmsPosts.editor.size", { defaultValue: isRtl ? "الحجم" : "Size" })}</option>
          {FONT_SIZES.map((size) => (
            <option key={size.value} value={size.value}>{size.label}</option>
          ))}
        </select>
        <select
          className="h-8 max-w-[8.5rem] rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) applyFontFace(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>{t("adminPages.cmsPosts.editor.font", { defaultValue: isRtl ? "الخط" : "Font" })}</option>
          {FONT_FACES.map((face) => (
            <option key={face.value} value={face.value}>{isRtl ? face.labelAr : face.labelEn}</option>
          ))}
        </select>
        <label className="inline-flex h-8 items-center gap-1 rounded-lg border border-transparent px-1 text-[11px] font-bold text-slate-500">
          <input type="color" defaultValue="#0f172a" className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" onChange={(e) => applyColor(e.target.value)} />
        </label>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />
        <ToolbarButton title="Align start" onClick={() => run(dir === "rtl" ? "justifyRight" : "justifyLeft")}><AlignLeft className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => run("justifyCenter")}><AlignCenter className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Align end" onClick={() => run(dir === "rtl" ? "justifyLeft" : "justifyRight")}><AlignRight className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Bullets" onClick={() => run("insertUnorderedList")}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Numbers" onClick={() => run("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Quote" onClick={() => wrapHeading("blockquote")}><Quote className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Divider" onClick={() => insertHtml("<hr />")}><Minus className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Link" onClick={insertLink}><Link2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Image" onClick={() => setLibraryOpen(true)}><ImagePlus className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Upload image" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Video" onClick={() => setVideoOpen((open) => !open)}><Video className="h-4 w-4" /></ToolbarButton>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} />
      </div>

      {videoOpen ? (
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/5">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t("adminPages.cmsPosts.editor.videoPlaceholder", { defaultValue: isRtl ? "رابط يوتيوب أو فيميو أو ملف فيديو" : "YouTube, Vimeo, or video file URL" })}
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-500)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            dir="ltr"
          />
          <button type="button" onClick={insertVideo} className="h-10 rounded-xl bg-[var(--yu-blue-700)] px-4 text-xs font-black text-white">
            {t("adminPages.cmsPosts.editor.insertVideo", { defaultValue: isRtl ? "إدراج الفيديو" : "Insert video" })}
          </button>
        </div>
      ) : null}

      <div
        ref={editorRef}
        className="yu-editor min-h-[280px] max-h-[520px] overflow-y-auto px-4 py-4 text-[15px] leading-8 text-slate-800 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] dark:text-slate-200"
        contentEditable
        dir={dir}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
      />

      <MediaPickerModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => {
          insertImage(url);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
}
