import { useEffect, useMemo, useState } from "react";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { buildYouTubeEmbedUrl, youtubePosterCandidates } from "../../utils/youtubeEmbed";

/**
 * Platform-branded shell over YouTube: custom poster + play until click,
 * then privacy-enhanced youtube-nocookie iframe (minimal branding params).
 *
 * @param {{
 *   videoId: string,
 *   title?: string,
 *   posterUrl?: string | null,
 *   className?: string,
 *   brandLabel?: string,
 * }} props
 */
export default function PlatformYouTubePlayer({
  videoId,
  title = "Lesson video",
  posterUrl = null,
  className = "",
  brandLabel,
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [started, setStarted] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);

  useEffect(() => {
    setStarted(false);
    setPosterIndex(0);
  }, [videoId]);

  const posters = useMemo(() => {
    const list = youtubePosterCandidates(videoId);
    if (posterUrl && !list.includes(posterUrl)) return [posterUrl, ...list];
    return list;
  }, [videoId, posterUrl]);

  const activePoster = posters[Math.min(posterIndex, posters.length - 1)];
  const playLabel =
    brandLabel ||
    t("courseView.playLesson", {
      defaultValue: isRtl ? "تشغيل الدرس" : "Play lesson",
    });

  if (started) {
    return (
      <iframe
        title={title}
        src={buildYouTubeEmbedUrl(videoId, { autoplay: true })}
        className={`absolute inset-0 h-full w-full border-0 ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStarted(true)}
      className={`group absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-950 text-start ${className}`}
      aria-label={playLabel}
    >
      {activePoster ? (
        <img
          src={activePoster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          onError={() => setPosterIndex((i) => (i + 1 < posters.length ? i + 1 : i))}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--yu-blue-900)] via-slate-950 to-[var(--yu-blue-700)]" />
      )}

      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(2,8,23,0.55)_70%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/90 to-transparent" aria-hidden />

      <span className="pointer-events-none absolute start-4 top-4 rounded-lg bg-[var(--yu-blue-700)]/90 px-2.5 py-1 text-[11px] font-black tracking-wide text-white shadow-lg backdrop-blur-sm">
        Yaser USMLE
      </span>

      <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yu-blue-700)] text-white shadow-[0_12px_40px_-8px_rgba(29,78,216,0.85)] ring-4 ring-white/20 transition group-hover:scale-105 group-hover:bg-[var(--yu-blue-600)] sm:h-20 sm:w-20">
        <Play className="ms-0.5 h-7 w-7 fill-current sm:h-8 sm:w-8" />
      </span>

      <span className="pointer-events-none absolute inset-x-4 bottom-4 line-clamp-2 text-sm font-bold text-white drop-shadow sm:text-base">
        {title}
      </span>
    </button>
  );
}
