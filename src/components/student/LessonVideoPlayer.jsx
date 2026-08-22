import { useEffect, useRef } from "react";
import { Loader2, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLessonPlayback } from "../../features/student/playback/hooks";
import { getErrorMessage } from "../../api/error";
import { extractYouTubeId } from "../../utils/youtubeEmbed";
import PlatformYouTubePlayer from "./PlatformYouTubePlayer";

const VDO_API_SCRIPT = "https://player.vdocipher.com/v2/api.js";

/** @typedef {{ percent: number, currentTime: number, duration: number, timeSpentDelta: number }} LessonWatchProgress */

let vdoScriptPromise = null;

function loadVdoPlayerApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.VdoPlayer) return Promise.resolve(window.VdoPlayer);
  if (vdoScriptPromise) return vdoScriptPromise;

  vdoScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${VDO_API_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.VdoPlayer));
      existing.addEventListener("error", () => reject(new Error("Failed to load VdoCipher API")));
      if (window.VdoPlayer) resolve(window.VdoPlayer);
      return;
    }
    const script = document.createElement("script");
    script.src = VDO_API_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.VdoPlayer);
    script.onerror = () => reject(new Error("Failed to load VdoCipher API"));
    document.head.appendChild(script);
  });

  return vdoScriptPromise;
}

/**
 * Secure lesson player with VdoCipher progress events + platform YouTube facade.
 * @param {{
 *   lessonId: string,
 *   title?: string,
 *   videoUrl?: string | null,
 *   vdoCipherVideoId?: string | null,
 *   className?: string,
 *   onProgress?: (p: LessonWatchProgress) => void,
 *   onEnded?: () => void,
 * }} props
 */
export default function LessonVideoPlayer({
  lessonId,
  title = "Lesson video",
  videoUrl = null,
  vdoCipherVideoId = null,
  className = "",
  onProgress,
  onEnded,
}) {
  const { t } = useTranslation();
  const iframeRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const lastPositionRef = useRef(0);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onProgressRef.current = onProgress;
    onEndedRef.current = onEnded;
  }, [onProgress, onEnded]);

  const needsAuthPlayback = Boolean(vdoCipherVideoId?.trim() || videoUrl?.trim());
  const { data, isLoading, isError, error, refetch, isFetching } = useLessonPlayback(lessonId, {
    enabled: needsAuthPlayback,
  });

  const embedUrl = data?.embedUrl || null;
  const isVdoCipher = data?.provider === "vdocipher";
  const youtubeId =
    data?.provider === "youtube"
      ? data.videoId || extractYouTubeId(data.embedUrl) || extractYouTubeId(data.url)
      : extractYouTubeId(embedUrl) || extractYouTubeId(data?.url) || extractYouTubeId(videoUrl);
  const isYouTube = Boolean(youtubeId) && !isVdoCipher;
  const hasSource = needsAuthPlayback;

  useEffect(() => {
    if (!isVdoCipher || !embedUrl || !iframeRef.current) return undefined;

    let cancelled = false;
    let removeTimeUpdate = null;
    let removeEnded = null;
    let player = null;

    const bind = async () => {
      try {
        const VdoPlayer = await loadVdoPlayerApi();
        if (cancelled || !iframeRef.current || !VdoPlayer?.getInstance) return;

        player = VdoPlayer.getInstance(iframeRef.current);
        const video = player?.video;
        if (!video?.addEventListener) return;

        const handleTimeUpdate = () => {
          const currentTime = Number(video.currentTime) || 0;
          const duration = Number(video.duration) || 0;
          if (!duration || duration <= 0) return;

          const now = Date.now();
          const elapsedMs = now - (lastSentAtRef.current || now);
          if (lastSentAtRef.current && elapsedMs < 12_000) return;

          const deltaSec = Math.max(
            0,
            Math.min(30, Math.round((elapsedMs || 0) / 1000) || Math.max(0, currentTime - lastPositionRef.current))
          );
          lastSentAtRef.current = now;
          lastPositionRef.current = currentTime;

          const percent = Math.min(100, Math.round((currentTime / duration) * 100));
          onProgressRef.current?.({
            percent,
            currentTime,
            duration,
            timeSpentDelta: deltaSec || 1,
          });
        };

        const handleEnded = () => {
          const duration = Number(video.duration) || 0;
          const currentTime = Number(video.currentTime) || duration;
          onProgressRef.current?.({
            percent: 100,
            currentTime,
            duration,
            timeSpentDelta: 1,
          });
          onEndedRef.current?.();
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("ended", handleEnded);
        removeTimeUpdate = () => video.removeEventListener("timeupdate", handleTimeUpdate);
        removeEnded = () => video.removeEventListener("ended", handleEnded);
      } catch {
        // Legacy iframe / API unavailable — progress falls back to manual complete.
      }
    };

    const timer = window.setTimeout(() => {
      void bind();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      removeTimeUpdate?.();
      removeEnded?.();
      lastSentAtRef.current = 0;
      lastPositionRef.current = 0;
    };
  }, [isVdoCipher, embedUrl, lessonId]);

  if (!hasSource) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-50 to-white py-16 ${className}`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yu-blue-100">
          <Play className="h-7 w-7 text-yu-blue-700" />
        </div>
        <p className="text-sm font-medium text-slate-500">
          {t("courseView.videoPlaceholder", { defaultValue: "No video for this lesson." })}
        </p>
      </div>
    );
  }

  if (isLoading || (isFetching && !embedUrl && !isYouTube)) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-slate-300 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-white/80" />
        <p className="text-xs font-medium text-white/70">
          {t("courseView.loadingVideo", { defaultValue: "Loading secure video…" })}
        </p>
      </div>
    );
  }

  if (isError || (!embedUrl && !isYouTube)) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center ${className}`}>
        <p className="text-sm font-medium text-rose-300">
          {getErrorMessage(error, t("courseView.videoLoadError", { defaultValue: "Could not load video." }))}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
        >
          {t("takeExam.retry", { defaultValue: "Retry" })}
        </button>
      </div>
    );
  }

  if (isYouTube && youtubeId) {
    return (
      <PlatformYouTubePlayer
        videoId={youtubeId}
        title={title}
        posterUrl={data?.posterUrl || null}
        className={className}
      />
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title={title}
      src={embedUrl}
      className={`absolute inset-0 h-full w-full border-0 ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      allowFullScreen
    />
  );
}

/** @param {{ videoUrl?: string | null, vdoCipherVideoId?: string | null }} lesson */
export function lessonHasPlayableVideo(lesson) {
  return Boolean(lesson?.vdoCipherVideoId?.trim() || lesson?.videoUrl?.trim());
}
