import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Back link to a course lecture when opened from CourseView with query params.
 */
export default function BackToLessonBanner({ courseId, lessonId, className = "" }) {
  const { t } = useTranslation();
  if (!courseId || !lessonId) return null;
  const to = `/student/courses/${encodeURIComponent(courseId)}/learn?lessonId=${encodeURIComponent(lessonId)}`;
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-[var(--yu-blue-200)] bg-[var(--yu-blue-50)]/70 px-4 py-3 text-sm text-[var(--yu-blue-900)] dark:border-[var(--yu-blue-500)]/30 dark:bg-[var(--yu-blue-700)]/15 dark:text-[var(--yu-blue-100)] ${className}`}
    >
      <Link
        to={to}
        className="inline-flex items-center gap-2 font-bold text-[var(--yu-blue-800)] underline-offset-2 hover:underline dark:text-[var(--yu-blue-200)]"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("learning.backToLesson", { defaultValue: "Back to lecture" })}
      </Link>
    </div>
  );
}
