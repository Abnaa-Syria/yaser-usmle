import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, ArrowRight, ArrowLeft, Search, Sparkles, Clock3, UserRound, RotateCcw } from "lucide-react";
import { usePublicPosts } from "../features/public/hooks";
import { useCatalogHero } from "../hooks/useCatalogHero";
import { localizedPostFields } from "../utils/cmsLocale";
import { useSeo } from "../utils/seo";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";
import { postExcerptText, readingMinutes } from "../utils/postContent";

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=85",
];

const CATEGORY_FILTERS = ["ALL", "BLOG", "NEWS", "INVESTIGATION"];

export default function BlogsPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const { data, isLoading, isError } = usePublicPosts({ page, limit: 9, search });
  const hero = useCatalogHero(
    "BLOGS_HERO",
    {
      eyebrow: t("publicBlogs.eyebrow"),
      titlePrefix: t("publicBlogs.heroPrefix"),
      titleAccent: t("publicBlogs.heroAccent"),
      subtitle: t("publicBlogs.subtitle"),
      searchPlaceholder: t("publicBlogs.searchPlaceholder"),
    },
    i18n.language
  );

  const posts = useMemo(() => {
    const all = data?.posts ?? [];
    if (category === "ALL") return all;
    return all.filter((post: any) => String(post.category || "BLOG").toUpperCase() === category);
  }, [data?.posts, category]);
  const meta = data?.meta;
  const featured = page === 1 && !search ? posts[0] : null;
  const remaining = featured ? posts.slice(1) : posts;

  useSeo({
    title: t("publicBlogs.title"),
    description: hero.subtitle || t("publicBlogs.subtitle"),
    path: "/blogs",
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearch("");
    setCategory("ALL");
    setPage(1);
  };

  const categoryLabel = (value?: string) => {
    const key = String(value || "BLOG").toLowerCase();
    return t(`publicBlogs.categories.${key}`, { defaultValue: t("publicBlogs.categories.blog") });
  };

  const postDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(isRtl ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric" })
      : "";

  return (
    <div className="min-h-screen bg-[#f3f7fc] pb-20">
      <section className="relative overflow-hidden bg-[#071a38] pb-24 pt-16 text-white md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -start-44 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -end-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[110px]" aria-hidden />
        <div className="relative mx-auto max-w-[1180px] px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link>
            <span>/</span>
            <span className="text-white">{t("publicBlogs.title")}</span>
          </nav>
          <div className="mt-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-[10px] font-black text-cyan-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              {hero.eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.4rem]">
              {hero.titlePrefix}{" "}
              <span className="bg-gradient-to-l from-cyan-300 to-blue-300 bg-clip-text text-transparent">{hero.titleAccent}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-8 text-slate-300 sm:text-base">{hero.subtitle}</p>
          </div>
          <form onSubmit={handleSearch} className="mt-10 flex max-w-3xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/[.08] p-2 backdrop-blur-xl sm:flex-row">
            <label className="sr-only" htmlFor="blog-search">{t("publicBlogs.searchLabel")}</label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="blog-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={hero.searchPlaceholder || t("publicBlogs.searchPlaceholder")}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#06152f]/80 pe-4 ps-11 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
              />
            </div>
            <button type="submit" className="h-12 rounded-xl bg-white px-6 text-sm font-black text-[#071a38] transition hover:bg-cyan-50">
              {t("publicBlogs.searchButton")}
            </button>
          </form>
        </div>
      </section>

      <main className="relative mx-auto -mt-10 max-w-[1180px] px-4 md:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {CATEGORY_FILTERS.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  active ? "bg-[#071a38] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                }`}
              >
                {item === "ALL" ? t("publicBlogs.allCategories", { defaultValue: isRtl ? "الكل" : "All" }) : categoryLabel(item)}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-[360px] animate-pulse rounded-[2rem] bg-slate-200 lg:col-span-2" />
            <div className="h-[360px] animate-pulse rounded-[2rem] bg-slate-200" />
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-[1.75rem] border border-red-100 bg-white p-10 text-center shadow-sm">
            <BookOpen className="mx-auto h-8 w-8 text-red-300" />
            <p className="mt-4 text-sm font-bold text-red-700">{t("publicBlogs.loadError")}</p>
          </div>
        ) : null}

        {!isLoading && !isError && featured ? (() => {
          const { title } = localizedPostFields(featured, i18n.language);
          const minutes = readingMinutes(featured.excerpt || featured.excerptAr || "");
          return (
            <Link
              to={`/blogs/${featured.slug}`}
              className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_55px_rgba(15,23,42,.1)] lg:grid-cols-[1.2fr_.8fr]"
            >
              <div className="relative min-h-[260px] overflow-hidden bg-slate-200 lg:min-h-[420px]">
                <img
                  src={resolveMediaUrl(featured.thumbnail) || FALLBACK_COVERS[0]}
                  onError={(event) => { event.currentTarget.src = FALLBACK_COVERS[0]; }}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a38]/55 via-transparent to-transparent" />
                <span className="absolute start-5 top-5 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-black text-blue-800 backdrop-blur">
                  {t("publicBlogs.featured")}
                </span>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <span className="text-[10px] font-black uppercase tracking-[.16em] text-blue-700">{categoryLabel(featured.category)}</span>
                <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950 transition group-hover:text-blue-700 sm:text-[2rem]">{title}</h2>
                <p className="mt-4 line-clamp-4 text-sm font-medium leading-7 text-slate-500">
                  {postExcerptText(featured, isRtl, t("publicBlogs.defaultExcerpt"))}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400">
                  {featured.author?.fullName ? <span className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" />{featured.author.fullName}</span> : null}
                  {featured.createdAt ? <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{postDate(featured.createdAt)}</span> : null}
                  <span>{t("publicBlogs.minutes", { count: minutes, defaultValue: isRtl ? "{{count}} دقائق قراءة" : "{{count}} min read" })}</span>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                  {t("publicBlogs.readMore")}
                  <Arrow className="h-4 w-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })() : null}

        {!isLoading && !isError && remaining.length > 0 ? (
          <section className={featured ? "mt-12" : ""}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">{t("publicBlogs.latestEyebrow")}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{t("publicBlogs.latestTitle")}</h2>
              </div>
              {search || category !== "ALL" ? (
                <button type="button" onClick={resetSearch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600">
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("publicBlogs.clearSearch")}
                </button>
              ) : null}
            </div>
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {remaining.map((post: any, index: number) => {
                const { title } = localizedPostFields(post, i18n.language);
                const fallback = FALLBACK_COVERS[(index + 1) % FALLBACK_COVERS.length];
                return (
                  <Link
                    key={post.id}
                    to={`/blogs/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_45px_rgba(15,23,42,.1)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={resolveMediaUrl(post.thumbnail) || fallback}
                        onError={(event) => { event.currentTarget.src = fallback; }}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <span className="absolute start-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[9px] font-black text-blue-800 backdrop-blur">
                        {categoryLabel(post.category)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="line-clamp-2 text-[1.05rem] font-black leading-snug text-slate-950 transition group-hover:text-blue-700">{title}</h3>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm font-medium leading-7 text-slate-500">
                        {postExcerptText(post, isRtl, t("publicBlogs.defaultExcerpt"))}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-[11px] font-bold text-slate-400">{postDate(post.createdAt)}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                          <Arrow className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {!isLoading && !isError && posts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-black text-slate-800">{t("publicBlogs.empty")}</h2>
            {search || category !== "ALL" ? (
              <button type="button" onClick={resetSearch} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#071a38] px-5 py-3 text-xs font-black text-white">
                <RotateCcw className="h-3.5 w-3.5" />
                {t("publicBlogs.clearSearch")}
              </button>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !isError && meta && meta.totalPages > 1 ? (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
              {t("common.previous")}
            </button>
            <span className="rounded-xl bg-[#071a38] px-4 py-2.5 text-xs font-black text-white">{page} / {meta.totalPages}</span>
            <button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
              {t("common.next")}
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
