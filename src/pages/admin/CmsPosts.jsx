import { ExternalLink, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAdminPosts, useCreatePost, useDeletePost, useUpdatePost } from "../../features/admin/cms/hooks";
import { getErrorMessage } from "../../api/error";
import ImageField from "../../components/ui/ImageField";
import RichTextEditor from "../../components/editor/RichTextEditor";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import { contentToHtml } from "../../utils/postContent";

function slugFromTitle(title) {
  const base = String(title || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (base.length >= 3) return base;
  return `post-${Date.now().toString(36)}`;
}

function CmsPosts() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminPosts({ page: 1, limit: 48 });
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  const [title, setTitle] = useState("");
  const [thumbNew, setThumbNew] = useState("");
  const [categoryNew, setCategoryNew] = useState("BLOG");
  const [editing, setEditing] = useState(null);
  const [bodyLang, setBodyLang] = useState("ar");
  const [form, setForm] = useState({
    title: "",
    titleAr: "",
    slug: "",
    thumbnail: "",
    published: false,
    category: "BLOG",
    bodyHtml: "",
    bodyHtmlAr: "",
  });

  const posts = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (!editing) return;
    setBodyLang("ar");
    setForm({
      title: editing.title || "",
      titleAr: editing.titleAr || "",
      slug: editing.slug || "",
      thumbnail: editing.thumbnail || "",
      published: Boolean(editing.published),
      category: editing.category || "BLOG",
      bodyHtml: contentToHtml(editing.content),
      bodyHtmlAr: contentToHtml(editing.contentAr),
    });
  }, [editing]);

  const openLive = (slug) => {
    const path = `/blogs/${encodeURIComponent(slug)}`;
    window.open(`${window.location.origin}${path}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.cmsPosts.title")} subtitle={t("adminPages.cmsPosts.subtitle")} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("adminPages.cmsPosts.titlePlaceholder")}
            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          />
          <div className="sm:max-w-md sm:flex-1">
            <ImageField
              label={t("adminPages.cmsPosts.thumbnailUrl")}
              value={thumbNew}
              onChange={setThumbNew}
            />
          </div>
          <select
            value={categoryNew}
            onChange={(e) => setCategoryNew(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          >
            <option value="BLOG">✍️ {t("adminPages.cmsPosts.catBlog", { defaultValue: "Blog" })}</option>
            <option value="NEWS">📰 {t("adminPages.cmsPosts.catNews", { defaultValue: "News" })}</option>
            <option value="INVESTIGATION">🔍 {t("adminPages.cmsPosts.catInvestigation", { defaultValue: "Investigation" })}</option>
          </select>
          <button
            type="button"
            disabled={!title.trim() || createMutation.isPending}
            onClick={() => {
              const slug = slugFromTitle(title);
              createMutation.mutate(
                {
                  title: title.trim(),
                  slug,
                  content: { format: "html", body: "" },
                  published: false,
                  category: categoryNew,
                  ...(thumbNew.trim() ? { thumbnail: thumbNew.trim() } : {}),
                },
                {
                  onSuccess: () => {
                    setTitle("");
                    setThumbNew("");
                    setCategoryNew("BLOG");
                  },
                }
              );
            }}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[var(--yu-blue-700)] px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("adminPages.cmsPosts.create")}
          </button>
        </div>
        {createMutation.isError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{getErrorMessage(createMutation.error)}</p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
          {t("adminPages.cmsPosts.loading")}
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-[var(--yu-blue-700)]/10 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-[var(--yu-blue-700)]/10 dark:text-red-300">
          {getErrorMessage(error, "Failed to load posts.")}{" "}
          <button type="button" onClick={() => refetch()} className="ms-2 underline">
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !posts.length ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          {t("adminPages.cmsPosts.empty")}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((p) => (
          <div
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]"
          >
            {p.thumbnail ? (
              <div className="h-32 overflow-hidden bg-slate-100 dark:bg-white/5">
                <img src={resolveMediaUrl(p.thumbnail)} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-24 bg-gradient-to-br from-slate-100 to-white dark:from-white/5 dark:to-transparent" />
            )}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {p?.author?.fullName || "—"} • {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge label={p.published ? "Published" : "Draft"} tone={p.published ? "success" : "warning"} />
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                  p.category === "NEWS"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : p.category === "INVESTIGATION"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }`}>
                  {p.category === "NEWS" ? "📰 أخبار" : p.category === "INVESTIGATION" ? "🔍 تحقيق" : "✍️ مدونة"}
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-slate-500">{p.slug}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateMutation.mutate({ id: p.id, body: { published: !p.published } })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  {p.published ? t("adminPages.cmsPosts.unpublish") : t("adminPages.cmsPosts.publish")}
                </button>
                <button
                  type="button"
                  onClick={() => openLive(p.slug)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t("adminPages.cmsPosts.viewLive")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <Pencil className="h-3 w-3" />
                  {t("adminPages.cmsPosts.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(t("adminPages.cmsPosts.confirmDelete"))) return;
                    deleteMutation.mutate(p.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3 w-3" />
                  {t("adminPages.common.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/45 p-3 sm:p-6">
          <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1A1A22]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("adminPages.cmsPosts.drawerTitle")}</h3>
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">{t("adminPages.cmsPosts.fieldTitle")} (EN)</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    {t("adminPages.cmsPosts.fieldTitleAr", { defaultValue: "Title (Arabic)" })}
                  </label>
                  <input
                    value={form.titleAr}
                    onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">{t("adminPages.cmsPosts.slug")}</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">{t("adminPages.cmsPosts.category", { defaultValue: "Category" })}</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="BLOG">✍️ {t("adminPages.cmsPosts.catBlog", { defaultValue: "Blog" })}</option>
                    <option value="NEWS">📰 {t("adminPages.cmsPosts.catNews", { defaultValue: "News" })}</option>
                    <option value="INVESTIGATION">🔍 {t("adminPages.cmsPosts.catInvestigation", { defaultValue: "Investigation" })}</option>
                  </select>
                </div>
              </div>
              <ImageField
                label={t("adminPages.cmsPosts.thumbnailUrl")}
                value={form.thumbnail}
                onChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
              />
              <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                />
                {t("adminPages.cmsPosts.publishedLabel")}
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-bold uppercase text-slate-500">{t("adminPages.cmsPosts.body")}</label>
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setBodyLang("ar")}
                      className={`rounded-md px-3 py-1 text-xs font-black ${bodyLang === "ar" ? "bg-[var(--yu-blue-700)] text-white" : "text-slate-600"}`}
                    >
                      عربي
                    </button>
                    <button
                      type="button"
                      onClick={() => setBodyLang("en")}
                      className={`rounded-md px-3 py-1 text-xs font-black ${bodyLang === "en" ? "bg-[var(--yu-blue-700)] text-white" : "text-slate-600"}`}
                    >
                      EN
                    </button>
                  </div>
                </div>
                {bodyLang === "ar" ? (
                  <RichTextEditor
                    key={`${editing.id}-ar`}
                    value={form.bodyHtmlAr}
                    onChange={(html) => setForm((f) => ({ ...f, bodyHtmlAr: html }))}
                    dir="rtl"
                    placeholder={t("adminPages.cmsPosts.editor.placeholderAr", { defaultValue: "اكتب محتوى المقالة، وأضف صورًا أو فيديو من شريط الأدوات." })}
                  />
                ) : (
                  <RichTextEditor
                    key={`${editing.id}-en`}
                    value={form.bodyHtml}
                    onChange={(html) => setForm((f) => ({ ...f, bodyHtml: html }))}
                    dir="ltr"
                    placeholder={t("adminPages.cmsPosts.editor.placeholderEn", { defaultValue: "Write the article. Use the toolbar to add images, video, and formatting." })}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                {updateMutation.isError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{getErrorMessage(updateMutation.error)}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-white/10">
                  {t("adminPages.common.cancel")}
                </button>
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    const slug = form.slug.trim().length >= 3 ? form.slug.trim() : slugFromTitle(form.title || form.titleAr);
                    updateMutation.mutate(
                      {
                        id: editing.id,
                        body: {
                          title: form.title.trim() || form.titleAr.trim(),
                          titleAr: form.titleAr.trim() || null,
                          slug,
                          published: form.published,
                          category: form.category,
                          content: { format: "html", body: form.bodyHtml },
                          contentAr: form.bodyHtmlAr.trim()
                            ? { format: "html", body: form.bodyHtmlAr }
                            : null,
                          ...(form.thumbnail.trim() ? { thumbnail: form.thumbnail.trim() } : { thumbnail: "" }),
                        },
                      },
                      {
                        onSuccess: () => setEditing(null),
                      }
                    );
                  }}
                  className="rounded-lg bg-[var(--yu-blue-700)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("adminPages.cmsPosts.saveChanges")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CmsPosts;
