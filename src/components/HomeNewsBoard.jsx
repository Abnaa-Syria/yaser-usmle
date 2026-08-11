import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, GraduationCap, Clock, BookOpen, Loader2, Sparkles, Stethoscope } from "lucide-react";
import client from "../api/client";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

function HomeNewsBoard() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      try {
        const res = await client.get("/public/posts");
        const items = res?.data?.data || [];
        setPosts(items);
      } catch (err) {
        console.error("Failed to load homepage posts", err);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }
    void loadPosts();
  }, []);

  const activePosts = posts;

  const filteredPosts = useMemo(() => {
    if (activeTab === "ALL") return activePosts;
    if (activeTab === "GUIDES") return activePosts.filter((p) => ["STEP1_GUIDE", "BLOG", "INVESTIGATION"].includes(p.category));
    if (activeTab === "STRATEGY") return activePosts.filter((p) => p.category === "STUDY_STRATEGY");
    return activePosts.filter((p) => p.category === activeTab);
  }, [activePosts, activeTab]);

  // Extract featured post (most recent) and grid posts
  const featuredPost = filteredPosts[0] || null;
  const gridPosts = filteredPosts.slice(1, 4); // Show up to 3 secondary posts

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "STEP1_GUIDE":
        return isRtl ? "دليل Step 1" : "Step 1 Guide";
      case "STUDY_STRATEGY":
        return isRtl ? "استراتيجية مذاكرة" : "Study Strategy";
      case "NEWS":
        return isRtl ? "تحديثات المنصة" : "Platform Update";
      case "INVESTIGATION":
        return isRtl ? "رؤية تعليمية" : "Learning Insight";
      case "BLOG":
        return isRtl ? "مقال طبي" : "Medical Article";
      default:
        return isRtl ? "محتوى تعليمي" : "Learning Resource";
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "STEP1_GUIDE":
        return "bg-blue-50 text-blue-700";
      case "STUDY_STRATEGY":
        return "bg-emerald-50 text-emerald-700";
      case "NEWS":
        return "bg-cyan-50 text-cyan-700";
      case "INVESTIGATION":
        return "bg-violet-50 text-violet-700";
      case "BLOG":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getTitle = (post) => isRtl
    ? (post.titleAr || post.title)
    : (post.title || post.titleEn || post.titleAr);

  const getExcerpt = (post) => {
    const localizedContent = isRtl ? (post.contentAr || post.content) : post.content;
    return post.excerpt
      || localizedContent?.body
      || localizedContent?.blocks?.find((block) => block?.text)?.text
      || (isRtl
        ? "محتوى تعليمي مختصر يساعدك على فهم الفكرة وربطها بأسئلة USMLE Step 1."
        : "Focused learning content that helps you understand the concept and connect it to Step 1 questions.");
  };

  const fallbackImage = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=85&w=1200&auto=format&fit=crop";

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackImage;
  };

  const SecondaryCard = ({ post, index, horizontal = false }) => (
    <article className={`group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(15,35,75,.10)] ${
      horizontal ? "grid sm:grid-cols-[42%_1fr]" : "flex h-full flex-col"
    }`}>
      <a href={`/blogs/${post.slug}`} className={`relative block overflow-hidden bg-slate-100 ${horizontal ? "min-h-56 sm:min-h-full" : "h-64 shrink-0 lg:h-[270px]"}`}>
        <img
          src={resolveMediaUrl(post.thumbnail) || fallbackImage}
          onError={handleImageError}
          alt={getTitle(post)}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute start-4 top-4 flex h-9 min-w-9 items-center justify-center rounded-full border border-white/30 bg-slate-950/70 px-2 text-[10px] font-black text-white backdrop-blur-md">
          {String(index + 2).padStart(2, "0")}
        </span>
      </a>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-black ${getCategoryColor(post.category)}`}>
            {getCategoryLabel(post.category)}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {new Date(post.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
          </span>
        </div>
        <h4 className="mt-4 line-clamp-2 text-lg font-black leading-8 text-slate-950 transition group-hover:text-blue-700">
          <a href={`/blogs/${post.slug}`}>{getTitle(post)}</a>
        </h4>
        <p className="mt-3 line-clamp-2 text-xs font-medium leading-6 text-slate-500">{getExcerpt(post)}</p>
        <a href={`/blogs/${post.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-black text-blue-700">
          {isRtl ? "اقرأ المقال" : "Read article"}
          {isRtl ? <ArrowLeft className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
        </a>
      </div>
    </article>
  );

  return (
    <section className="relative overflow-hidden bg-[#f7f9fc] py-20 md:py-28">
      <div className="pointer-events-none absolute -start-32 top-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -end-24 bottom-0 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-black text-blue-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            {isRtl ? "مكتبة Yaser التعليمية" : "The Yaser Learning Library"}
          </span>
          <h2 className="mt-5 text-3xl font-black leading-[1.25] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.75rem]">
            {isRtl ? "افهم الطب، ولا تكتفِ بحفظه" : "Understand medicine. Don't just memorize it."}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
            {isRtl
              ? "محتوى طبي مركز يحوّل المفاهيم الصعبة إلى خطوات واضحة تساعدك في المذاكرة والإجابة بثقة."
              : "Focused medical content that turns difficult concepts into clear steps for studying and answering with confidence."}
          </p>
        </div>

        <div className="mx-auto mb-9 mt-9 flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
          {[
            { id: "ALL", label: isRtl ? "الكل" : "All" },
            { id: "GUIDES", label: isRtl ? "أدلة Step 1" : "Step 1 Guides" },
            { id: "STRATEGY", label: isRtl ? "استراتيجيات المذاكرة" : "Study Strategy" },
            { id: "NEWS", label: isRtl ? "تحديثات المنصة" : "Updates" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-[11px] font-black transition-all ${
                activeTab === tab.id
                  ? "bg-[#102c5c] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-[2rem] border border-slate-200/70 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" aria-label={isRtl ? "جارٍ التحميل" : "Loading"} />
          </div>
        ) : !featuredPost ? (
          <div className="mx-auto flex min-h-72 max-w-2xl flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white text-center">
            <BookOpen className="mb-4 h-10 w-10 text-slate-300" aria-hidden />
            <p className="text-sm font-bold text-slate-500">{isRtl ? "لا يوجد محتوى منشور في هذا التصنيف حالياً." : "No learning resources are available in this category yet."}</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${gridPosts.length > 0 ? "lg:grid-cols-12" : ""}`}>
              <article className={`group relative min-h-[510px] overflow-hidden rounded-[2rem] bg-[#071a38] shadow-[0_24px_65px_rgba(15,35,75,.16)] ${gridPosts.length > 0 ? "lg:col-span-7" : ""}`}>
                <img
                  src={resolveMediaUrl(featuredPost.thumbnail) || fallbackImage}
                  onError={handleImageError}
                  alt={getTitle(featuredPost)}
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06152f] via-[#06152f]/55 to-[#06152f]/5" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-9">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${getCategoryColor(featuredPost.category)}`}>
                      {getCategoryLabel(featuredPost.category)}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/70">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {isRtl ? "قراءة في ٥ دقائق" : "5 min read"}
                    </span>
                  </div>
                  <h3 className="max-w-2xl text-2xl font-black leading-[1.45] text-white sm:text-3xl">{getTitle(featuredPost)}</h3>
                  <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-200 line-clamp-2">{getExcerpt(featuredPost)}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/70">
                      <Stethoscope className="h-4 w-4 text-cyan-300" aria-hidden />
                      {featuredPost.author?.fullName || (isRtl ? "فريق Yaser USMLE التعليمي" : "Yaser USMLE Education Team")}
                    </div>
                    <a href={`/blogs/${featuredPost.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-[#071a38] transition hover:bg-blue-50">
                      {isRtl ? "اقرأ المقال" : "Read article"}
                      {isRtl ? <ArrowLeft className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
                    </a>
                  </div>
                </div>
              </article>

              {gridPosts[0] && (
                <div className="lg:col-span-5">
                  <SecondaryCard post={gridPosts[0]} index={0} />
                </div>
              )}
            </div>

            {gridPosts.length > 1 && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {gridPosts.slice(1).map((post, index) => (
                  <SecondaryCard key={post.id} post={post} index={index + 1} horizontal />
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[1.5rem] border border-blue-100 bg-white px-6 py-5 shadow-sm sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm font-black text-slate-900">{isRtl ? "مزيد من الأدلة والمقالات المصممة لطلاب Step 1" : "More guides and articles created for Step 1 learners"}</p>
              </div>
              <a href="/blogs" className="inline-flex shrink-0 items-center gap-2 text-xs font-black text-blue-700 hover:text-blue-900">
                {isRtl ? "تصفح المكتبة كاملة" : "Browse the full library"}
                {isRtl ? <ArrowLeft className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default HomeNewsBoard;
