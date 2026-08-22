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

function isDirectVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function youtubeId(url) {
  if (!url) return "";
  const cleaned = String(url).replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g, "");
  const match = cleaned.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match?.[1] || "";
}

function FeatureVisual({ imageUrl, videoUrl, title, number, reverse }) {
  const video = resolveMediaUrl(videoUrl);
  const image = resolveMediaUrl(imageUrl);
  const yt = youtubeId(videoUrl || "");
  const poster = image || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : "");
  const hasVideo = Boolean((video && isDirectVideo(video)) || yt);

  return (
    <div
      className={`relative min-h-[220px] flex-[0.92] overflow-hidden bg-gradient-to-br from-[#D8DEE8] via-[#E8EDF4] to-[#C5D0E0] sm:min-h-[300px] ${
        reverse ? "sm:order-1" : "sm:order-2"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 70% at 70% 30%, rgba(255,255,255,0.65), transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(27,79,191,0.08), transparent 55%)",
        }}
        aria-hidden
      />

      <span
        className={`pointer-events-none absolute top-5 select-none text-[5.5rem] font-black leading-none tracking-tight text-[#07111F]/[0.07] sm:text-[7rem] ${
          reverse ? "start-6 sm:start-8" : "end-6 sm:end-8"
        }`}
        aria-hidden
      >
        {number}
      </span>

      <div className="relative flex h-full min-h-[inherit] items-center justify-center px-6 py-8 sm:px-8 sm:py-10">
        <div className="relative w-full max-w-[340px] transition duration-500 group-hover:-translate-y-1 group-hover:rotate-0 sm:max-w-[380px]">
          {poster ? (
            <img
              src={poster}
              alt=""
              className="w-full rounded-2xl border border-white/70 bg-white object-cover shadow-[0_24px_60px_rgba(15,23,42,0.22)] transition duration-500 group-hover:shadow-[0_32px_70px_rgba(27,79,191,0.28)] [-rotate-2deg] group-hover:rotate-0"
              loading="lazy"
            />
          ) : (
            <div className="aspect-[4/3] w-full rounded-2xl border border-white/70 bg-gradient-to-br from-[#07111F] via-[#1B4FBF] to-[#0B2A5A] shadow-[0_24px_60px_rgba(15,23,42,0.22)] [-rotate-2deg] group-hover:rotate-0" aria-hidden />
          )}

          {video && isDirectVideo(video) ? (
            <video
              className="absolute inset-0 h-full w-full rounded-2xl object-cover [-rotate-2deg] group-hover:rotate-0"
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
              className="pointer-events-none absolute inset-0 h-full w-full scale-[1.2] rounded-2xl object-cover [-rotate-2deg] group-hover:rotate-0"
              src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${yt}&rel=0&modestbranding=1&iv_load_policy=3`}
              allow="autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
            />
          ) : null}

          {hasVideo ? (
            <span className="absolute -end-2 -top-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#07111F]/75 text-white shadow-lg backdrop-blur-md">
              <Play className="ms-0.5 h-4 w-4 fill-current" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ item, index, isRtl, Arrow, learnMoreLabel }) {
  const reverse = index % 2 === 1;
  const textAlign = isRtl ? "text-right" : "text-left";
  const cardClass =
    "group flex min-h-[320px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-[#07111F] shadow-[0_18px_48px_rgba(15,23,42,0.10)] transition duration-500 hover:-translate-y-1 hover:border-[var(--yu-blue-400)]/35 hover:shadow-[0_28px_64px_rgba(27,79,191,0.18)] sm:min-h-[300px] sm:flex-row";

  const body = (
    <>
      <div
        className={`flex flex-[1.08] flex-col justify-center px-7 py-9 sm:px-10 sm:py-11 lg:px-12 ${textAlign} ${
          reverse ? "sm:order-2" : "sm:order-1"
        }`}
      >
        <h3 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-[1.75rem] lg:text-3xl">
          {item.title}
        </h3>
        <p className="mt-4 max-w-xl text-sm font-medium leading-[1.85] text-slate-300/95 sm:text-[0.95rem] lg:text-base">
          {item.description}
        </p>
        {item.to ? (
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-cyan-300 transition duration-300 group-hover:gap-3">
            {learnMoreLabel}
            <Arrow className="h-4 w-4 shrink-0" />
          </span>
        ) : null}
      </div>

      <FeatureVisual
        imageUrl={item.imageUrl}
        videoUrl={item.videoUrl}
        title={item.title}
        number={item.number}
        reverse={reverse}
      />
    </>
  );

  if (item.to) {
    return (
      <Link to={item.to} className={cardClass}>
        {body}
      </Link>
    );
  }

  return <div className={cardClass}>{body}</div>;
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

  const learnMoreLabel = t("common.learnMore", { defaultValue: isRtl ? "اعرف المزيد" : "Learn more" });

  const cmsItems = Array.isArray(c?.items) ? c.items : [];
  const items =
    cmsItems.length > 0
      ? cmsItems.map((item, index) => {
          const fallback = FALLBACK_ITEMS[index % FALLBACK_ITEMS.length];
          const to =
            typeof item.to === "string" ? item.to.trim() : item.to == null ? fallback.to || "" : String(item.to).trim();
          return {
            key: item.id || `f-${index}`,
            to,
            number: item.number || String(index + 1).padStart(2, "0"),
            title:
              pickLocalized(item.title, lang) ||
              t(`features.items.${fallback.key}.title`, { defaultValue: "" }),
            description:
              pickLocalized(item.description, lang) ||
              t(`features.items.${fallback.key}.description`, { defaultValue: "" }),
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
        className="relative mx-auto max-w-[1180px] px-4 md:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 22 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
          }}
          className={`mb-12 max-w-3xl lg:mb-14 ${isRtl ? "ms-auto text-right" : "text-left"}`}
        >
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--yu-blue-700)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {eyebrow}
          </p>
          <h2 className="text-3xl font-black leading-[1.15] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.65rem]">
            {titleStart}{" "}
            <span className="bg-gradient-to-l from-[var(--yu-blue-700)] to-cyan-600 bg-clip-text text-transparent">
              {titleAccent}
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-8 text-slate-600 sm:text-base">{subtitle}</p>
        </motion.div>

        <div className="flex flex-col gap-5 md:gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.key}
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: index * 0.04 } },
              }}
            >
              <FeatureCard item={item} index={index} isRtl={isRtl} Arrow={Arrow} learnMoreLabel={learnMoreLabel} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
