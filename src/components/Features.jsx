import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { pickLocalized } from "../utils/cmsLocale";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

const FALLBACK_ITEMS = [
  {
    key: "structuredCourses",
    to: "/explore",
    number: "01",
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "flashcards",
    to: "/login",
    number: "02",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "quizzes",
    to: "/login",
    number: "03",
    imageUrl:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "studyPlan",
    to: "/login",
    number: "04",
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
];

const LAYOUT = [
  "lg:col-span-7 lg:row-span-2 min-h-[420px] lg:min-h-[560px]",
  "lg:col-span-5 min-h-[260px]",
  "lg:col-span-5 min-h-[260px]",
  "lg:col-span-12 min-h-[280px] lg:min-h-[320px]",
];

function isDirectVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function youtubeId(url) {
  if (!url) return "";
  // Strip bidi/invisible marks that sometimes sneak in from paste (Arabic keyboards, etc.)
  const cleaned = String(url).replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g, "");
  const match = cleaned.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match?.[1] || "";
}

function FeatureMedia({ imageUrl, videoUrl, title, featured }) {
  const video = resolveMediaUrl(videoUrl);
  const image = resolveMediaUrl(imageUrl);
  const yt = youtubeId(videoUrl || "");
  const poster = image || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : "");

  return (
    <>
      {poster ? (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div
          className={`absolute inset-0 ${
            featured
              ? "bg-[linear-gradient(145deg,#07111F_0%,#1B4FBF_55%,#0B2A5A_100%)]"
              : "bg-[linear-gradient(145deg,#0F2448_0%,#1B4FBF_100%)]"
          }`}
          aria-hidden
        />
      )}

      {video && isDirectVideo(video) ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={video}
          muted
          loop
          playsInline
          autoPlay
          poster={poster || undefined}
          aria-label={title}
        />
      ) : null}

      {yt ? (
        <iframe
          title={title || "Feature video"}
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.35] object-cover"
          src={`https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${yt}&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="lazy"
        />
      ) : null}
    </>
  );
}

export default function Features({ cmsContent = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const c = cmsContent && typeof cmsContent === "object" ? cmsContent : null;

  const eyebrow =
    pickLocalized(c?.eyebrow, lang) ||
    t("features.eyebrow", { defaultValue: isRtl ? "منظومة تعلم متكاملة" : "A complete learning system" });
  const titleStart =
    pickLocalized(c?.titleStart, lang) ||
    t("features.titleStart", { defaultValue: isRtl ? "كل ما تحتاجه" : "Everything you need" });
  const titleAccent =
    pickLocalized(c?.titleAccent, lang) ||
    t("features.titleAccent", { defaultValue: isRtl ? "للنجاح في USMLE" : "to pass USMLE" });
  const subtitle =
    pickLocalized(c?.subtitle, lang) ||
    t("features.subtitle", {
      defaultValue: isRtl
        ? "منصة متكاملة تجمع المحتوى الطبي، والاختبارات، والبطاقات الدراسية، وخطط المراجعة في مكان واحد"
        : "An integrated platform combining medical content, quizzes, flashcards, and review plans in one place",
    });

  const cmsItems = Array.isArray(c?.items) ? c.items : [];
  const items =
    cmsItems.length > 0
      ? cmsItems.map((item, index) => {
          const fallback = FALLBACK_ITEMS[index % FALLBACK_ITEMS.length];
          // Respect an explicitly cleared CMS link (""). Only fall back when the field is absent.
          const to =
            typeof item.to === "string" ? item.to.trim() : item.to == null ? fallback.to || "" : String(item.to).trim();
          return {
            key: item.id || `f-${index}`,
            to,
            featured: index === 0,
            number: item.number || String(index + 1).padStart(2, "0"),
            title:
              pickLocalized(item.title, lang) ||
              t(`features.items.${fallback.key}.title`, { defaultValue: "" }),
            description:
              pickLocalized(item.description, lang) ||
              t(`features.items.${fallback.key}.description`, { defaultValue: "" }),
            // Prefer CMS media; Unsplash fallback only when CMS left both empty.
            imageUrl: item.imageUrl || (!item.videoUrl ? fallback.imageUrl : "") || "",
            videoUrl: item.videoUrl || "",
          };
        })
      : FALLBACK_ITEMS.map((item) => ({
          ...item,
          title: t(`features.items.${item.key}.title`),
          description: t(`features.items.${item.key}.description`),
          videoUrl: "",
        }));

  return (
    <section className="relative overflow-hidden bg-[#F8FAFD] py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(27,79,191,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(8,145,178,0.10), transparent 50%)",
        }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 22 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
          }}
          className="mb-12 max-w-3xl lg:mb-16"
        >
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--yu-blue-700)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {eyebrow}
          </p>
          <h2 className="text-3xl font-black leading-[1.15] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
            {titleStart}{" "}
            <span className="bg-gradient-to-l from-[var(--yu-blue-700)] to-cyan-600 bg-clip-text text-transparent">
              {titleAccent}
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          {items.map((item, index) => {
            const layout = LAYOUT[index] || LAYOUT[LAYOUT.length - 1];
            const resolvedVideo = resolveMediaUrl(item.videoUrl);
            const hasVideo = Boolean(
              (resolvedVideo && isDirectVideo(resolvedVideo)) || youtubeId(item.videoUrl || "")
            );
            const horizontal = index === 3;

            const cardClass = `group relative flex h-full min-h-[inherit] overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-[#07111F] shadow-[0_20px_50px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--yu-blue-400)]/40 hover:shadow-[0_28px_60px_rgba(27,79,191,0.22)] ${
              horizontal ? "flex-col sm:flex-row" : "flex-col"
            }`;
            const media = (
              <>
                {/* Featured: absolute only (do not also set relative — Tailwind conflict collapses height to 0). */}
                <div
                  className={
                    horizontal
                      ? "relative min-h-[200px] w-full overflow-hidden sm:min-h-full sm:w-[42%]"
                      : item.featured
                        ? "absolute inset-0 overflow-hidden"
                        : "relative min-h-[180px] w-full flex-[1.15] overflow-hidden"
                  }
                >
                  <FeatureMedia
                    imageUrl={item.imageUrl}
                    videoUrl={item.videoUrl}
                    title={item.title}
                    featured={item.featured}
                  />
                  <div
                    className={`absolute inset-0 ${
                      item.featured || horizontal
                        ? "bg-gradient-to-t from-[#07111F] via-[#07111F]/55 to-[#07111F]/10"
                        : "bg-gradient-to-t from-[#07111F] via-[#07111F]/35 to-transparent"
                    }`}
                  />
                  {hasVideo ? (
                    <span className="absolute end-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md">
                      <Play className="ms-0.5 h-4 w-4 fill-current" />
                    </span>
                  ) : null}
                  <span className="absolute start-4 top-4 text-4xl font-black tracking-tight text-white/25 sm:text-5xl">
                    {item.number}
                  </span>
                </div>

                <div
                  className={`relative z-10 flex flex-col justify-end ${
                    item.featured
                      ? "mt-auto min-h-[50%] p-7 sm:p-9"
                      : horizontal
                        ? "flex-1 p-6 sm:p-8"
                        : "p-6 sm:p-7"
                  }`}
                >
                  <h3
                    className={`font-black tracking-tight text-white ${
                      item.featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-3 font-medium leading-7 text-slate-300 ${
                      item.featured ? "max-w-xl text-sm sm:text-base" : "line-clamp-3 text-sm"
                    }`}
                  >
                    {item.description}
                  </p>
                  {item.to ? (
                    <span className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold text-cyan-300 transition group-hover:gap-3">
                      {t("common.learnMore", { defaultValue: isRtl ? "اعرف المزيد" : "Learn more" })}
                      <Arrow className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </div>
              </>
            );

            return (
              <motion.div
                key={item.key}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: index * 0.05 } },
                }}
                className={layout}
              >
                {item.to ? (
                  <Link to={item.to} className={cardClass}>
                    {media}
                  </Link>
                ) : (
                  <div className={cardClass}>{media}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
