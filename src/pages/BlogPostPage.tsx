import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { ArrowLeft, ArrowRight, Clock3, UserRound } from "lucide-react";
import { usePublicPost, usePublicPosts } from "../features/public/hooks";
import { localizedPostFields } from "../utils/cmsLocale";
import SocialShare from "../components/SocialShare";
import PostArticleBody from "../components/blog/PostArticleBody";
import { absoluteUrl, useSeo } from "../utils/seo";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";
import { contentToHtml, excerptFromHtml, readingMinutes } from "../utils/postContent";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1600&q=85";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowRight : ArrowLeft;
  const { data: post, isLoading, isError, error } = usePublicPost(slug);
  const { data: listData } = usePublicPosts({ page: 1, limit: 6 });

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const { title, content } = localizedPostFields(post, i18n.language);
  const html = contentToHtml(content);
  const description = excerptFromHtml(html, 160) || (typeof title === "string" ? title : "");
  const minutes = readingMinutes(html);
  const related = (listData?.posts || []).filter((item: any) => item.slug !== slug).slice(0, 3);

  const categoryLabel = (value?: string) =>
    t(`publicBlogs.categories.${String(value || "BLOG").toLowerCase()}`, {
      defaultValue: t("publicBlogs.categories.blog"),
    });

  const postDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(isRtl ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric" })
      : "";

  useSeo({
    title: title || t("publicBlogs.title"),
    description: description || t("publicBlogs.subtitle"),
    path: slug ? `/blogs/${slug}` : "/blogs",
    image: post?.thumbnail || undefined,
    type: "article",
    noindex: isError && status === 404,
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description,
          image: post.thumbnail ? absoluteUrl(post.thumbnail) : undefined,
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
          author: post.author?.fullName ? { "@type": "Person", name: post.author.fullName } : undefined,
          mainEntityOfPage: absoluteUrl(`/blogs/${slug}`),
        }
      : undefined,
  });

  return (
    <div className="min-h-screen bg-[#f3f7fc] pb-20">
      <div className="bg-[#071a38] pb-16 pt-10 text-white">
        <div className="mx-auto max-w-[980px] px-4 md:px-6">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
            <Link to="/" className="transition hover:text-cyan-200">{t("header.nav.home")}</Link>
            <span>/</span>
            <Link to="/blogs" className="transition hover:text-cyan-200">{t("publicBlogs.title")}</Link>
            <span>/</span>
            <span className="line-clamp-1 text-white">{title || "…"}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-[980px] px-4 md:px-6">
        {isLoading ? <div className="h-[28rem] animate-pulse rounded-[2rem] bg-slate-200" /> : null}

        {isError ? (
          <div className="rounded-[1.75rem] border border-red-100 bg-white p-8 text-sm font-bold text-red-700">
            {status === 404 ? t("publicBlogs.notFound") : t("publicBlogs.loadError")}
          </div>
        ) : null}

        {post ? (
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_55px_rgba(15,23,42,.08)]">
            <div className="relative aspect-[16/8] min-h-[240px] overflow-hidden bg-slate-200">
              <img
                src={resolveMediaUrl(post.thumbnail) || FALLBACK_COVER}
                alt={title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071a38]/70 via-[#071a38]/10 to-transparent" />
              <span className="absolute start-6 top-6 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-black text-blue-800 backdrop-blur">
                {categoryLabel(post.category)}
              </span>
            </div>

            <div className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">{title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
                {post.author?.fullName ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700">
                      <UserRound className="h-4 w-4" />
                    </span>
                    {post.author.fullName}
                  </span>
                ) : null}
                {post.createdAt ? (
                  <time dateTime={post.createdAt} className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {postDate(post.createdAt)}
                  </time>
                ) : null}
                <span>{t("publicBlogs.minutes", { count: minutes, defaultValue: isRtl ? "{{count}} دقائق قراءة" : "{{count}} min read" })}</span>
              </div>

              <div className="mt-10 border-t border-slate-100 pt-8">
                <PostArticleBody content={content} emptyLabel={t("publicBlogs.emptyBody")} />
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-black text-blue-700">
                  <Arrow className="h-4 w-4" />
                  {t("publicBlogs.backToList", { defaultValue: isRtl ? "العودة إلى المدونة" : "Back to blog" })}
                </Link>
                <SocialShare url={typeof window !== "undefined" ? window.location.href : ""} title={title} />
              </div>
            </div>
          </article>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-black text-slate-950">{t("publicBlogs.relatedTitle", { defaultValue: isRtl ? "مقالات ذات صلة" : "Related articles" })}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {related.map((item: any) => {
                const itemTitle = localizedPostFields(item, i18n.language).title;
                return (
                  <Link
                    key={item.id}
                    to={`/blogs/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      <img src={resolveMediaUrl(item.thumbnail) || FALLBACK_COVER} alt={itemTitle} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-black text-slate-900 group-hover:text-blue-700">{itemTitle}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
