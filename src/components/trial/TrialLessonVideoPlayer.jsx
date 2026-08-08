import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTrialLessonPlayback } from "../../features/trial/hooks";
import { getErrorMessage } from "../../api/error";

const VDO_API_SCRIPT = "https://player.vdocipher.com/v2/api.js";
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

export default function TrialLessonVideoPlayer({
  lessonId,
  title = "Lesson video",
  videoUrl = null,
  vdoCipherVideoId = null,
  className = "",
}) {
  const { t } = useTranslation();
  const iframeRef = useRef(null);
  const needsAuthPlayback = Boolean(vdoCipherVideoId?.trim() || videoUrl?.trim());
  const { data, isLoading, isError, error, refetch } = useTrialLessonPlayback(lessonId, {
    enabled: needsAuthPlayback,
  });

  const embedUrl = data?.embedUrl || null;
  const isVdoCipher = data?.provider === "vdocipher";

  useEffect(() => {
    if (!isVdoCipher || !embedUrl || !iframeRef.current) return undefined;
    let cancelled = false;
    void loadVdoPlayerApi()
      .then((VdoPlayer) => {
        if (cancelled || !iframeRef.current) return;
        try {
          VdoPlayer.getInstance(iframeRef.current);
        } catch {
          /* player may still work via iframe src */
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isVdoCipher, embedUrl]);

  if (!needsAuthPlayback) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-slate-900 text-sm text-slate-300 ${className}`}>
        {t("courseView.noVideo", { defaultValue: "No video for this lesson." })}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-slate-900 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (isError || !embedUrl) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center ${className}`}>
        <p className="text-sm font-medium text-rose-300">
          {getErrorMessage(error, t("courseView.videoLoadError", { defaultValue: "Could not load video." }))}
        </p>
        <button type="button" onClick={() => void refetch()} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
          {t("takeExam.retry", { defaultValue: "Retry" })}
        </button>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title={title}
      src={embedUrl}
      className={`absolute inset-0 h-full w-full border-0 ${className}`}
      allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
}

export function lessonHasPlayableVideo(lesson) {
  return Boolean(lesson?.vdoCipherVideoId?.trim() || lesson?.videoUrl?.trim());
}
