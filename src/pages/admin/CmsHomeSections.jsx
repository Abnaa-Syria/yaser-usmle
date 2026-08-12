import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import { useAdminSections, useUpsertSectionByKey } from "../../features/admin/cms/hooks";
import { getErrorMessage } from "../../api/error";
import { joinLocalized, pickLocalized, splitLocalized } from "../../utils/cmsLocale";
import ImageField from "../../components/ui/ImageField";

const field =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";
const area =
  "min-h-24 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200";
const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";

const SECTION_TABS = [
  { id: "FEATURES", label: "Features", preview: "/" },
  { id: "HOW_IT_WORKS", label: "How it works", preview: "/" },
  { id: "TESTIMONIALS", label: "Testimonials", preview: "/" },
  { id: "CTA", label: "Homepage CTA", preview: "/" },
  { id: "SEO", label: "Homepage SEO", preview: "/" },
  { id: "ABOUT_HERO", label: "About hero", preview: "/about" },
  { id: "ABOUT_TEACH", label: "About teach cards", preview: "/about" },
  { id: "ABOUT_JOIN", label: "About join band", preview: "/about" },
  { id: "EXPLORE_HERO", label: "Explore hero", preview: "/explore" },
  { id: "PACKAGES_HERO", label: "Packages hero", preview: "/packages" },
  { id: "INSTRUCTORS_HERO", label: "Instructors hero", preview: "/instructors" },
  { id: "EVENTS_HERO", label: "Events hero", preview: "/events" },
  { id: "BLOGS_HERO", label: "Blogs hero", preview: "/blogs" },
];

function LPair({ labelEn, labelAr, en, ar, onEn, onAr, multiline = false }) {
  const Input = multiline ? "textarea" : "input";
  const cls = multiline ? area : field;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label className={labelCls}>{labelEn}</label>
        <Input value={en} onChange={(e) => onEn(e.target.value)} className={cls} dir="ltr" />
      </div>
      <div>
        <label className={labelCls}>{labelAr}</label>
        <Input value={ar} onChange={(e) => onAr(e.target.value)} className={cls} dir="rtl" />
      </div>
    </div>
  );
}

function emptyItem() {
  return {
    id: `item-${Date.now()}`,
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    to: "",
    imageUrl: "",
    videoUrl: "",
  };
}

function emptyTestimonial() {
  return {
    id: `t-${Date.now()}`,
    nameEn: "",
    nameAr: "",
    roleEn: "",
    roleAr: "",
    textEn: "",
    textAr: "",
    imageUrl: "",
    rating: 5,
  };
}

function contentToForm(key, content) {
  const c = content && typeof content === "object" && !Array.isArray(content) ? content : {};
  const loc = (v) => splitLocalized(v);
  const base = {
    isVisible: true,
    eyebrowEn: loc(c.eyebrow).en,
    eyebrowAr: loc(c.eyebrow).ar,
    titleEn: loc(c.title || c.titleStart || c.titlePrefix || c.heroPrefix).en,
    titleAr: loc(c.title || c.titleStart || c.titlePrefix || c.heroPrefix).ar,
    titleAccentEn: loc(c.titleAccent || c.heroAccent).en,
    titleAccentAr: loc(c.titleAccent || c.heroAccent).ar,
    subtitleEn: loc(c.subtitle).en,
    subtitleAr: loc(c.subtitle).ar,
    descriptionEn: loc(c.description).en,
    descriptionAr: loc(c.description).ar,
    primaryLabelEn: loc(c.primaryLabel || c.primaryCtaLabel || c.footerCtaLabel).en,
    primaryLabelAr: loc(c.primaryLabel || c.primaryCtaLabel || c.footerCtaLabel).ar,
    primaryTo: c.primaryTo || c.primaryCtaTo || c.footerCtaHref || "",
    secondaryLabelEn: loc(c.secondaryLabel || c.secondaryCtaLabel).en,
    secondaryLabelAr: loc(c.secondaryLabel || c.secondaryCtaLabel).ar,
    secondaryTo: c.secondaryTo || c.secondaryCtaTo || "",
    footerTitleEn: loc(c.footerTitle).en,
    footerTitleAr: loc(c.footerTitle).ar,
    footerSubtitleEn: loc(c.footerSubtitle).en,
    footerSubtitleAr: loc(c.footerSubtitle).ar,
    searchPlaceholderEn: loc(c.searchPlaceholder).en,
    searchPlaceholderAr: loc(c.searchPlaceholder).ar,
    heroQuoteEn: loc(c.heroQuote).en,
    heroQuoteAr: loc(c.heroQuote).ar,
    teamPhoto: typeof c.teamPhoto === "string" ? c.teamPhoto : "",
    ogImage: typeof c.ogImage === "string" ? c.ogImage : "",
    path: typeof c.path === "string" ? c.path : "",
    items: [],
  };

  if (key === "TESTIMONIALS") {
    base.items = Array.isArray(c.items)
      ? c.items.map((item, i) => ({
          id: item.id || `t-${i}`,
          nameEn: loc(item.name).en,
          nameAr: loc(item.name).ar,
          roleEn: loc(item.role).en,
          roleAr: loc(item.role).ar,
          textEn: loc(item.text).en,
          textAr: loc(item.text).ar,
          imageUrl: item.imageUrl || "",
          rating: Number(item.rating) || 5,
        }))
      : [];
  } else if (["FEATURES", "HOW_IT_WORKS", "ABOUT_TEACH", "EXPLORE_HERO", "BLOGS_HERO", "PACKAGES_HERO"].includes(key)) {
    const list = Array.isArray(c.items) ? c.items : Array.isArray(c.steps) ? c.steps : Array.isArray(c.pillars) ? c.pillars : [];
    base.items = list.map((item, i) => ({
      id: item.id || item.key || `item-${i}`,
      titleEn: loc(item.title).en,
      titleAr: loc(item.title).ar,
      descriptionEn: loc(item.description || item.body).en,
      descriptionAr: loc(item.description || item.body).ar,
      to: item.to || item.href || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
      number: item.number || "",
      tone: item.tone || "",
      icon: item.icon || "",
    }));
  }

  return base;
}

function formToContent(key, form) {
  const L = (en, ar) => joinLocalized(en, ar);
  if (key === "SEO") {
    return {
      title: L(form.titleEn, form.titleAr),
      description: L(form.subtitleEn, form.subtitleAr),
      ogImage: form.ogImage || "",
      path: form.path || "/",
    };
  }
  if (key === "CTA") {
    return {
      eyebrow: L(form.eyebrowEn, form.eyebrowAr),
      title: L(form.titleEn, form.titleAr),
      subtitle: L(form.subtitleEn, form.subtitleAr),
      primaryLabel: L(form.primaryLabelEn, form.primaryLabelAr),
      primaryTo: form.primaryTo || "/signup",
      secondaryLabel: L(form.secondaryLabelEn, form.secondaryLabelAr),
      secondaryTo: form.secondaryTo || "/explore",
    };
  }
  if (key === "ABOUT_HERO") {
    return {
      eyebrow: L(form.eyebrowEn, form.eyebrowAr),
      heroPrefix: L(form.titleEn, form.titleAr),
      heroAccent: L(form.titleAccentEn, form.titleAccentAr),
      subtitle: L(form.subtitleEn, form.subtitleAr),
      heroQuote: L(form.heroQuoteEn, form.heroQuoteAr),
      primaryCtaLabel: L(form.primaryLabelEn, form.primaryLabelAr),
      primaryCtaTo: form.primaryTo || "/explore",
      secondaryCtaLabel: L(form.secondaryLabelEn, form.secondaryLabelAr),
      secondaryCtaTo: form.secondaryTo || "/contact",
      teamPhoto: form.teamPhoto || "",
    };
  }
  if (key === "ABOUT_JOIN") {
    return {
      title: L(form.titleEn, form.titleAr),
      subtitle: L(form.subtitleEn, form.subtitleAr),
      primaryCtaLabel: L(form.primaryLabelEn, form.primaryLabelAr),
      primaryCtaTo: form.primaryTo || "/signup",
      secondaryCtaLabel: L(form.secondaryLabelEn, form.secondaryLabelAr),
      secondaryCtaTo: form.secondaryTo || "/explore",
    };
  }
  if (key === "TESTIMONIALS") {
    return {
      titlePrefix: L(form.titleEn, form.titleAr),
      titleAccent: L(form.titleAccentEn, form.titleAccentAr),
      subtitle: L(form.subtitleEn, form.subtitleAr),
      items: form.items.map((item) => ({
        id: item.id,
        name: L(item.nameEn, item.nameAr),
        role: L(item.roleEn, item.roleAr),
        text: L(item.textEn, item.textAr),
        imageUrl: item.imageUrl || "",
        rating: Number(item.rating) || 5,
      })),
    };
  }
  if (key === "HOW_IT_WORKS") {
    return {
      eyebrow: L(form.eyebrowEn, form.eyebrowAr),
      titleStart: L(form.titleEn, form.titleAr),
      titleAccent: L(form.titleAccentEn, form.titleAccentAr),
      subtitle: L(form.subtitleEn, form.subtitleAr),
      steps: form.items.map((item) => ({
        id: item.id,
        title: L(item.titleEn, item.titleAr),
        description: L(item.descriptionEn, item.descriptionAr),
        icon: item.icon || "",
        imageUrl: item.imageUrl || "",
      })),
      footerTitle: L(form.footerTitleEn, form.footerTitleAr),
      footerSubtitle: L(form.footerSubtitleEn, form.footerSubtitleAr),
      footerCtaLabel: L(form.primaryLabelEn, form.primaryLabelAr),
      footerCtaHref: form.primaryTo || "#courses",
    };
  }
  if (key === "FEATURES" || key === "ABOUT_TEACH") {
    return {
      eyebrow: L(form.eyebrowEn, form.eyebrowAr),
      titleStart: L(form.titleEn, form.titleAr),
      titleAccent: L(form.titleAccentEn, form.titleAccentAr),
      subtitle: L(form.subtitleEn, form.subtitleAr),
      items: form.items.map((item) => ({
        id: item.id,
        title: L(item.titleEn, item.titleAr),
        description: L(item.descriptionEn, item.descriptionAr),
        to: item.to || "",
        imageUrl: item.imageUrl || "",
        videoUrl: item.videoUrl || "",
        number: item.number || "",
        tone: item.tone || "",
        icon: item.icon || "",
      })),
    };
  }
  // Catalog heroes
  return {
    eyebrow: L(form.eyebrowEn, form.eyebrowAr),
    titlePrefix: L(form.titleEn, form.titleAr),
    titleAccent: L(form.titleAccentEn, form.titleAccentAr),
    subtitle: L(form.subtitleEn, form.subtitleAr),
    searchPlaceholder: L(form.searchPlaceholderEn, form.searchPlaceholderAr),
    pillars: form.items.map((item) => ({
      id: item.id,
      title: L(item.titleEn, item.titleAr),
      body: L(item.descriptionEn, item.descriptionAr),
      icon: item.icon || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
    })),
  };
}

export default function CmsHomeSections() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("FEATURES");
  const [notice, setNotice] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [form, setForm] = useState(() => contentToForm("FEATURES", {}));

  const { data: sections = [] } = useAdminSections();
  const upsert = useUpsertSectionByKey();
  const current = useMemo(() => sections.find((s) => s.key === tab), [sections, tab]);

  // Reset form only when the saved section identity/version changes — not on every
  // React Query object identity churn (that was wiping unsaved image/video uploads).
  useEffect(() => {
    setForm(contentToForm(tab, current?.content));
    setIsVisible(current?.isVisible !== false);
  }, [tab, current?.id, current?.updatedAt]);

  const meta = SECTION_TABS.find((s) => s.id === tab);

  const save = async () => {
    setNotice(null);
    try {
      await upsert.mutateAsync({
        key: tab,
        body: {
          content: formToContent(tab, form),
          isVisible,
        },
      });
      setNotice({ type: "success", message: t("adminPages.cmsPages.saved", { defaultValue: "Saved." }) });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    }
  };

  const setItem = (id, patch) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));

  return (
    <PermissionGate permission="cms:manage" fallback={<p className="text-sm text-slate-500">No access</p>}>
      <section className="space-y-6">
        <PageHeader
          title={t("adminPages.cmsHomeSections.title", { defaultValue: "Homepage & page heroes" })}
          subtitle={t("adminPages.cmsHomeSections.subtitle", {
            defaultValue: "Edit bilingual marketing sections and catalog heroes used on the public site.",
          })}
        />

        <Notice type={notice?.type} message={notice?.message} />

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className={`${card} h-fit space-y-1 p-3`}>
            {SECTION_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition ${
                  tab === item.id
                    ? "bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)]"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </aside>

          <div className={`${card} space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{meta?.label}</h2>
                <p className="text-xs text-slate-500">{tab}</p>
              </div>
              <div className="flex items-center gap-3">
                {meta?.preview ? (
                  <Link
                    to={meta.preview}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Preview
                  </Link>
                ) : null}
                <label className="inline-flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
                  Visible
                </label>
              </div>
            </div>

            <LPair
              labelEn="Eyebrow / Title (EN)"
              labelAr="Eyebrow / Title (AR)"
              en={form.eyebrowEn || form.titleEn}
              ar={form.eyebrowAr || form.titleAr}
              onEn={(v) =>
                setForm((p) =>
                  tab === "SEO" || tab === "CTA" || tab === "ABOUT_JOIN"
                    ? { ...p, titleEn: v }
                    : ["FEATURES", "HOW_IT_WORKS", "ABOUT_HERO", "EXPLORE_HERO", "PACKAGES_HERO", "INSTRUCTORS_HERO", "EVENTS_HERO", "BLOGS_HERO", "TESTIMONIALS"].includes(tab)
                      ? tab === "TESTIMONIALS"
                        ? { ...p, titleEn: v }
                        : { ...p, eyebrowEn: v }
                      : { ...p, titleEn: v }
                )
              }
              onAr={(v) =>
                setForm((p) =>
                  tab === "SEO" || tab === "CTA" || tab === "ABOUT_JOIN"
                    ? { ...p, titleAr: v }
                    : ["FEATURES", "HOW_IT_WORKS", "ABOUT_HERO", "EXPLORE_HERO", "PACKAGES_HERO", "INSTRUCTORS_HERO", "EVENTS_HERO", "BLOGS_HERO", "TESTIMONIALS"].includes(tab)
                      ? tab === "TESTIMONIALS"
                        ? { ...p, titleAr: v }
                        : { ...p, eyebrowAr: v }
                      : { ...p, titleAr: v }
                )
              }
            />

            <LPair
              labelEn="Main title (EN)"
              labelAr="Main title (AR)"
              en={form.titleEn}
              ar={form.titleAr}
              onEn={(v) => setForm((p) => ({ ...p, titleEn: v }))}
              onAr={(v) => setForm((p) => ({ ...p, titleAr: v }))}
            />

            <LPair
              labelEn="Accent title (EN)"
              labelAr="Accent title (AR)"
              en={form.titleAccentEn}
              ar={form.titleAccentAr}
              onEn={(v) => setForm((p) => ({ ...p, titleAccentEn: v }))}
              onAr={(v) => setForm((p) => ({ ...p, titleAccentAr: v }))}
            />

            <LPair
              labelEn="Subtitle / description (EN)"
              labelAr="Subtitle / description (AR)"
              en={form.subtitleEn}
              ar={form.subtitleAr}
              onEn={(v) => setForm((p) => ({ ...p, subtitleEn: v }))}
              onAr={(v) => setForm((p) => ({ ...p, subtitleAr: v }))}
              multiline
            />

            {(tab === "CTA" || tab === "ABOUT_HERO" || tab === "ABOUT_JOIN" || tab === "HOW_IT_WORKS") && (
              <>
                <LPair
                  labelEn="Primary CTA label (EN)"
                  labelAr="Primary CTA label (AR)"
                  en={form.primaryLabelEn}
                  ar={form.primaryLabelAr}
                  onEn={(v) => setForm((p) => ({ ...p, primaryLabelEn: v }))}
                  onAr={(v) => setForm((p) => ({ ...p, primaryLabelAr: v }))}
                />
                <div>
                  <label className={labelCls}>Primary CTA link</label>
                  <input className={field} value={form.primaryTo} onChange={(e) => setForm((p) => ({ ...p, primaryTo: e.target.value }))} dir="ltr" />
                </div>
                <LPair
                  labelEn="Secondary CTA label (EN)"
                  labelAr="Secondary CTA label (AR)"
                  en={form.secondaryLabelEn}
                  ar={form.secondaryLabelAr}
                  onEn={(v) => setForm((p) => ({ ...p, secondaryLabelEn: v }))}
                  onAr={(v) => setForm((p) => ({ ...p, secondaryLabelAr: v }))}
                />
                <div>
                  <label className={labelCls}>Secondary CTA link</label>
                  <input className={field} value={form.secondaryTo} onChange={(e) => setForm((p) => ({ ...p, secondaryTo: e.target.value }))} dir="ltr" />
                </div>
              </>
            )}

            {tab === "ABOUT_HERO" ? (
              <>
                <LPair
                  labelEn="Quote (EN)"
                  labelAr="Quote (AR)"
                  en={form.heroQuoteEn}
                  ar={form.heroQuoteAr}
                  onEn={(v) => setForm((p) => ({ ...p, heroQuoteEn: v }))}
                  onAr={(v) => setForm((p) => ({ ...p, heroQuoteAr: v }))}
                  multiline
                />
                <ImageField
                  label="Team photo"
                  value={form.teamPhoto}
                  onChange={(url) => setForm((p) => ({ ...p, teamPhoto: url }))}
                />
              </>
            ) : null}

            {tab === "HOW_IT_WORKS" ? (
              <LPair
                labelEn="Footer title (EN)"
                labelAr="Footer title (AR)"
                en={form.footerTitleEn}
                ar={form.footerTitleAr}
                onEn={(v) => setForm((p) => ({ ...p, footerTitleEn: v }))}
                onAr={(v) => setForm((p) => ({ ...p, footerTitleAr: v }))}
              />
            ) : null}

            {["EXPLORE_HERO", "PACKAGES_HERO", "INSTRUCTORS_HERO", "EVENTS_HERO", "BLOGS_HERO"].includes(tab) ? (
              <LPair
                labelEn="Search placeholder (EN)"
                labelAr="Search placeholder (AR)"
                en={form.searchPlaceholderEn}
                ar={form.searchPlaceholderAr}
                onEn={(v) => setForm((p) => ({ ...p, searchPlaceholderEn: v }))}
                onAr={(v) => setForm((p) => ({ ...p, searchPlaceholderAr: v }))}
              />
            ) : null}

            {tab === "SEO" ? (
              <>
                <div>
                  <label className={labelCls}>OG image URL</label>
                  <input className={field} value={form.ogImage} onChange={(e) => setForm((p) => ({ ...p, ogImage: e.target.value }))} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>Path</label>
                  <input className={field} value={form.path} onChange={(e) => setForm((p) => ({ ...p, path: e.target.value }))} dir="ltr" />
                </div>
              </>
            ) : null}

            {["FEATURES", "HOW_IT_WORKS", "TESTIMONIALS", "ABOUT_TEACH", "EXPLORE_HERO", "BLOGS_HERO", "PACKAGES_HERO"].includes(tab) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Items</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        items: [...p.items, tab === "TESTIMONIALS" ? emptyTestimonial() : emptyItem()],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--yu-blue-700)] px-3 py-1.5 text-xs font-bold text-[var(--yu-blue-700)]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
                {form.items.map((item, index) => (
                  <div key={item.id} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                      <button type="button" onClick={() => setForm((p) => ({ ...p, items: p.items.filter((x) => x.id !== item.id) }))}>
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                      </button>
                    </div>
                    {tab === "TESTIMONIALS" ? (
                      <>
                        <LPair labelEn="Name EN" labelAr="Name AR" en={item.nameEn} ar={item.nameAr} onEn={(v) => setItem(item.id, { nameEn: v })} onAr={(v) => setItem(item.id, { nameAr: v })} />
                        <LPair labelEn="Role EN" labelAr="Role AR" en={item.roleEn} ar={item.roleAr} onEn={(v) => setItem(item.id, { roleEn: v })} onAr={(v) => setItem(item.id, { roleAr: v })} />
                        <LPair labelEn="Text EN" labelAr="Text AR" en={item.textEn} ar={item.textAr} onEn={(v) => setItem(item.id, { textEn: v })} onAr={(v) => setItem(item.id, { textAr: v })} multiline />
                      </>
                    ) : (
                      <>
                        <LPair labelEn="Title EN" labelAr="Title AR" en={item.titleEn} ar={item.titleAr} onEn={(v) => setItem(item.id, { titleEn: v })} onAr={(v) => setItem(item.id, { titleAr: v })} />
                        <LPair labelEn="Body EN" labelAr="Body AR" en={item.descriptionEn} ar={item.descriptionAr} onEn={(v) => setItem(item.id, { descriptionEn: v })} onAr={(v) => setItem(item.id, { descriptionAr: v })} multiline />
                        <div>
                          <label className={labelCls}>Link (optional — leave empty for no navigation)</label>
                          <input className={field} value={item.to || ""} onChange={(e) => setItem(item.id, { to: e.target.value })} dir="ltr" placeholder="/explore" />
                        </div>
                      </>
                    )}
                    <ImageField
                      label="Image"
                      value={item.imageUrl || ""}
                      onChange={(url) => setItem(item.id, { imageUrl: url })}
                    />
                    {tab === "FEATURES" ? (
                      <div>
                        <label className={labelCls}>Video URL (mp4 / webm / YouTube — optional)</label>
                        <input
                          className={field}
                          value={item.videoUrl || ""}
                          onChange={(e) => setItem(item.id, { videoUrl: e.target.value })}
                          dir="ltr"
                          placeholder="https://youtube.com/watch?v=… or https://…/clip.mp4"
                        />
                        <p className="mt-1.5 text-[11px] text-slate-400">
                          YouTube or direct mp4/webm. Image is used as poster/fallback when present.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-white/10">
              <button
                type="button"
                disabled={upsert.isPending}
                onClick={save}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save section
              </button>
            </div>
          </div>
        </div>
      </section>
    </PermissionGate>
  );
}

// silence unused import in case tree-shaking complains in some setups
void pickLocalized;
