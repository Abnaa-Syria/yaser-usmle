import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, User, Newspaper } from "lucide-react";
import client from "../api/client";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

function NewsSlider() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await client.get("/public/posts");
        const items = res?.data?.data || [];
        setPosts(items);
      } catch (err) {
        console.error("Failed to load news posts", err);
      }
    }
    void loadNews();
  }, []);

  // Static backup news if there are no posts in the database yet
  const defaultNews = [
    {
      id: "1",
      title: "انطلاق دفعة المراجعة المكثفة لـ USMLE Step 1",
      titleEn: "USMLE Step 1 Intensive Review Cohort Is Now Open",
      content: "نعلن لطلاب الطب عن فتح التسجيل في دفعة المراجعة المكثفة، مع خطة منظمة حسب الأنظمة واختبارات دورية وفلاش كاردز عالية الأهمية.",
      contentEn: "Registration is open for our intensive Step 1 review cohort, featuring a systems-based plan, regular quizzes, and high-yield flashcards.",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
      createdAt: new Date().toISOString(),
      author: { fullName: "Yaser USMLE" }
    },
    {
      id: "2",
      title: "إضافة بنك أسئلة جديد للجهاز القلبي الوعائي",
      titleEn: "New Cardiovascular Question Bank Released",
      content: "أضفنا مجموعة جديدة من أسئلة Step 1 بنمط سريري مع شروحات مفصلة تربط الفسيولوجيا بالباثولوجي والفارماكولوجي.",
      contentEn: "We added a new set of clinical-style Step 1 questions with detailed explanations connecting physiology, pathology, and pharmacology.",
      thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      author: { fullName: "الإدارة التعليمية" }
    }
  ];

  const activeNews = posts.length > 0 ? posts : defaultNews;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeNews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeNews.length) % activeNews.length);
  };

  if (activeNews.length === 0) return null;

  const current = activeNews[currentIndex];

  return (
    <section className="py-16 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Newspaper className="h-7 w-7 text-[var(--yu-blue-700)]" />
              {isRtl ? "أخبار وأحداث المنصة" : "Platform News & Events"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRtl ? "ابقَ على اطلاع بأحدث الدورات الطبية والجلسات المباشرة وتحديثات Step 1." : "Stay updated with the latest medical courses, live sessions, and Step 1 resources."}
            </p>
          </div>

          {/* Navigation Controls */}
          {activeNews.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevSlide}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all"
              >
                {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all"
              >
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Highlight Main Post Slide */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 shadow-xl dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="grid md:grid-cols-12 gap-0">
            {/* Image Block */}
            <div className="md:col-span-5 relative h-64 md:h-96">
              <img
                src={resolveMediaUrl(current.thumbnail) || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600"}
                alt="News Thumbnail"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
            </div>

            {/* Content Details Block */}
            <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(current.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {current.author?.fullName || (isRtl ? "مسؤول المنصة" : "Platform Admin")}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white hover:text-[var(--yu-blue-700)] transition-colors leading-tight">
                  {isRtl ? current.title : (current.titleEn || current.title)}
                </h3>

                <p className="text-sm sm:text-base text-slate-650 dark:text-slate-350 leading-relaxed line-clamp-3">
                  {isRtl ? current.content : (current.contentEn || current.content)}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center">
                <a
                  href={`/blog/${current.slug || current.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] hover:bg-[var(--yu-blue-600)] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all duration-200"
                >
                  {isRtl ? "اقرأ الخبر كاملاً" : "Read Full Story"}
                  {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        {activeNews.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {activeNews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx ? "w-8 bg-[var(--yu-blue-700)]" : "w-2.5 bg-slate-300 dark:bg-slate-700"}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default NewsSlider;
