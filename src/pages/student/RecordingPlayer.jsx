import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Headphones, Loader2, Plus, Trash2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import LessonVideoPlayer, { lessonHasPlayableVideo } from "../../components/student/LessonVideoPlayer";
import { StudentSurface, studentFieldClass, studentBtnPrimary, studentBtnGhost } from "../../components/student/ui";
import {
  useCreatePlaybackNote,
  useDeletePlaybackNote,
  useRecordingDetail,
} from "../../features/student/recordings/hooks";
import { useTrackLessonAccess, useMarkLessonComplete } from "../../features/student/progress/hooks";
import { getErrorMessage } from "../../api/error";

export default function RecordingPlayer() {
  const { t } = useTranslation();
  const { sourceType, id } = useParams();
  const { data: recording, isLoading, isError, error, refetch } = useRecordingDetail(sourceType, id);
  const createNote = useCreatePlaybackNote();
  const deleteNote = useDeletePlaybackNote();
  const trackLessonAccess = useTrackLessonAccess();
  const markComplete = useMarkLessonComplete();
  const [noteText, setNoteText] = useState("");
  const [noteErr, setNoteErr] = useState("");

  const handleAddNote = async () => {
    const content = noteText.trim();
    if (!content) return;
    setNoteErr("");
    try {
      await createNote.mutateAsync({
        sourceType,
        id,
        body: { content, timestampSeconds: 0 },
      });
      setNoteText("");
    } catch (e) {
      setNoteErr(getErrorMessage(e, t("student.recordings.noteError", { defaultValue: "Could not save note." })));
    }
  };

  const handleVideoProgress = (progress) => {
    if (!recording?.courseId || !(recording.lessonId || recording.id)) return;
    trackLessonAccess.mutate({
      lessonId: recording.lessonId || recording.id,
      courseId: recording.courseId,
      watchPercentage: progress.percent,
      lastWatchedPosition: Math.floor(progress.currentTime || 0),
      timeSpentDelta: progress.timeSpentDelta || 0,
    });
  };

  const handleVideoEnded = () => {
    if (!recording?.courseId || !(recording.lessonId || recording.id)) return;
    void markComplete.mutateAsync({
      lessonId: recording.lessonId || recording.id,
      courseId: recording.courseId,
    });
  };

  if (isLoading) {
    return (
      <StudentSurface>
        <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
      </StudentSurface>
    );
  }

  if (isError || !recording) {
    return (
      <EmptyState
        title={t("student.recordings.loadError", { defaultValue: "Recording not found" })}
        message={getErrorMessage(error, t("student.recordings.loadError", { defaultValue: "Recording not found." }))}
        icon={Headphones}
        action={
          <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => void refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry")}
            </button>
            <Link to="/student/recordings" className={studentBtnGhost}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("student.recordings.back", { defaultValue: "Back to library" })}
            </Link>
          </div>
        }
      />
    );
  }

  const notes = recording.notes ?? [];

  return (
    <div className="space-y-6">
      <Link
        to="/student/recordings"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-[var(--yu-blue-700)]"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("student.recordings.back", { defaultValue: "Back to library" })}
      </Link>

      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={recording.title}
        subtitle={recording.subtitle || recording.courseTitle || ""}
      />

      <div className="relative w-full overflow-hidden rounded-[1.35rem] bg-slate-900 shadow-[var(--shadow-md)]" style={{ paddingTop: "56.25%" }}>
        {lessonHasPlayableVideo(recording) || recording.hasVdoCipherVideo ? (
          <LessonVideoPlayer
            lessonId={recording.lessonId || recording.id}
            title={recording.title}
            videoUrl={recording.videoUrl}
            vdoCipherVideoId={recording.vdoCipherVideoId}
            onProgress={handleVideoProgress}
            onEnded={handleVideoEnded}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">{t("courseView.videoPlaceholder")}</div>
        )}
      </div>

      {recording.canTakeNotes !== false ? (
        <StudentSurface>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t("student.recordings.notesTitle", { defaultValue: "Playback notes" })}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {recording.notesEmptyMessage || t("student.recordings.notesHint", { defaultValue: "Jot down key points while you watch." })}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t("student.recordings.notePlaceholder", { defaultValue: "Add a note…" })}
              className={studentFieldClass}
            />
            <button type="button" disabled={createNote.isPending || !noteText.trim()} onClick={() => void handleAddNote()} className={studentBtnPrimary}>
              {createNote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("student.recordings.addNote", { defaultValue: "Add note" })}
            </button>
          </div>
          {noteErr ? <p className="mt-2 text-sm text-rose-600">{noteErr}</p> : null}

          <ul className="mt-4 space-y-2">
            {notes.length === 0 ? (
              <li className="text-sm text-slate-500">{t("student.recordings.noNotes", { defaultValue: "No notes yet." })}</li>
            ) : (
              notes.map((note) => (
                <li
                  key={note.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-[#0C1829]"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-200">{note.content}</p>
                  <button
                    type="button"
                    onClick={() => void deleteNote.mutateAsync({ sourceType, id, noteId: note.id })}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label={t("student.recordings.deleteNote", { defaultValue: "Delete note" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </StudentSurface>
      ) : null}

      {recording.upNext?.length ? (
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-900 dark:text-white">
            {t("student.recordings.upNext", { defaultValue: "Up next" })}
          </h2>
          <ul className="space-y-2">
            {recording.upNext
              .filter((item) => item.status !== "CURRENT")
              .slice(0, 5)
              .map((item) => (
                <li key={`${item.sourceType}-${item.id}`}>
                  <Link
                    to={`/student/recordings/${item.sourceType}/${item.id}`}
                    className="block rounded-[1.15rem] border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[var(--shadow-sm)] transition hover:border-[var(--yu-blue-400)] dark:border-white/10 dark:bg-[#0F1E38] dark:text-slate-200"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
