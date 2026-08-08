import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronDown, Loader2, Play } from "lucide-react";
import { useTrialCourseUnits } from "../../features/trial/hooks";
import TrialLessonVideoPlayer, { lessonHasPlayableVideo } from "../../components/trial/TrialLessonVideoPlayer";
import { sanitizeRichHtml } from "../../utils/htmlContent";
import { getErrorMessage } from "../../api/error";

export default function TrialCourseLearn() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { id: courseId } = useParams();
  const ctx = useOutletContext() || {};
  const expired = Boolean(ctx.expired);
  const { data: units = [], isLoading, isError, error, refetch } = useTrialCourseUnits(courseId);

  const flatLessons = useMemo(
    () =>
      (units || []).flatMap((u) =>
        (u.sections || []).flatMap((section) =>
          (section.lessons || []).map((l) => ({
            ...l,
            unitTitle: u.title,
            sectionTitle: section.title || null,
          }))
        )
      ),
    [units]
  );

  const [activeLesson, setActiveLesson] = useState(null);
  const [openUnits, setOpenUnits] = useState(() => new Set());

  useEffect(() => {
    if (!flatLessons.length) return;
    if (activeLesson && flatLessons.some((l) => l.id === activeLesson.id)) return;
    setActiveLesson(flatLessons[0]);
  }, [flatLessons, activeLesson]);

  useEffect(() => {
    if (units?.length) setOpenUnits(new Set(units.map((u) => u.id)));
  }, [units]);

  if (expired) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-black text-slate-900 dark:text-white">
          {t("trial.bannerExpired", { defaultValue: isRtl ? "انتهت فترة التجربة المجانية" : "Your free trial has ended" })}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link to="/signup" className="rounded-xl bg-[var(--yu-blue-700)] px-4 py-2 text-sm font-black text-white">
            {t("auth.signup.title", { defaultValue: "Sign up" })}
          </Link>
          <Link to="/trial" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold dark:border-white/10">
            {t("trial.backDash", { defaultValue: isRtl ? "لوحة التجربة" : "Trial home" })}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("dashboard.common.loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm font-bold text-red-600">{getErrorMessage(error, "Failed to load course")}</p>
        <button type="button" onClick={() => void refetch()} className="mt-3 text-sm font-bold text-[var(--yu-blue-700)]">
          {t("takeExam.retry", { defaultValue: "Retry" })}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Link to="/trial" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t("trial.backDash", { defaultValue: isRtl ? "لوحة التجربة" : "Trial home" })}
        </Link>

        <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
          {activeLesson && lessonHasPlayableVideo(activeLesson) ? (
            <TrialLessonVideoPlayer
              lessonId={activeLesson.id}
              title={activeLesson.title}
              videoUrl={activeLesson.videoUrl}
              vdoCipherVideoId={activeLesson.vdoCipherVideoId}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">
              {t("courseView.noVideo", { defaultValue: "No video for this lesson." })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">{activeLesson?.title || "—"}</h1>
          {activeLesson?.unitTitle ? <p className="mt-1 text-xs font-bold text-slate-500">{activeLesson.unitTitle}</p> : null}
          {activeLesson?.content ? (
            <div
              className="course-rich-html mt-4 space-y-2 text-sm leading-relaxed text-slate-600 [&_a]:text-[var(--yu-blue-700)] [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(activeLesson.content) }}
            />
          ) : null}
          {(activeLesson?.resources || []).length ? (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-white/8">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                {t("courseView.resources", { defaultValue: isRtl ? "الموارد" : "Resources" })}
              </p>
              {activeLesson.resources.map((r) => (
                <a
                  key={r.id}
                  href={r.fileUrl || r.externalUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm font-semibold text-[var(--yu-blue-700)] hover:underline"
                >
                  {r.title}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <aside className="h-fit max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/8 dark:bg-[#1A1A22]">
        <p className="mb-2 px-2 text-xs font-black uppercase tracking-wider text-slate-500">
          {t("courseDetails.curriculum.title", { defaultValue: isRtl ? "المنهج" : "Curriculum" })}
        </p>
        <div className="space-y-2">
          {(units || []).map((unit) => {
            const open = openUnits.has(unit.id);
            return (
              <div key={unit.id} className="rounded-xl border border-slate-100 dark:border-white/8">
                <button
                  type="button"
                  onClick={() =>
                    setOpenUnits((prev) => {
                      const next = new Set(prev);
                      if (next.has(unit.id)) next.delete(unit.id);
                      else next.add(unit.id);
                      return next;
                    })
                  }
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm font-bold text-slate-800 dark:text-white"
                >
                  <span className="line-clamp-1">{unit.title}</span>
                  <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? (
                  <div className="space-y-1 border-t border-slate-100 px-2 py-2 dark:border-white/8">
                    {(unit.sections || []).flatMap((section) =>
                      (section.lessons || []).map((lesson) => {
                        const active = activeLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLesson({ ...lesson, unitTitle: unit.title, sectionTitle: section.title })}
                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-xs font-semibold ${
                              active
                                ? "bg-[var(--yu-blue-700)] text-white"
                                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                            }`}
                          >
                            <Play className="h-3 w-3 shrink-0" />
                            <span className="line-clamp-2">{lesson.title}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
