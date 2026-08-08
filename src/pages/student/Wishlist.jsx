import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Trash2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import { studentBtnGhost, studentBtnPrimary } from "../../components/student/ui";
import { useToggleWishlist, useWishlist } from "../../features/student/wishlist/hooks";
import { getErrorMessage } from "../../api/error";

export default function Wishlist() {
  const { t } = useTranslation();
  const { data: items = [], isLoading, isError, error, refetch } = useWishlist();
  const toggle = useToggleWishlist();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.wishlist.title", { defaultValue: "Wishlist" })}
        subtitle={t("student.wishlist.subtitle", { defaultValue: "Courses you saved for later." })}
      />

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <EmptyState
          title={t("student.wishlist.loadError", { defaultValue: "Could not load wishlist." })}
          message={getErrorMessage(error, t("student.wishlist.loadError", { defaultValue: "Could not load wishlist." }))}
          icon={Heart}
          action={
            <button type="button" onClick={() => void refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry")}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState
          title={t("student.wishlist.empty", { defaultValue: "Your wishlist is empty." })}
          message={t("student.wishlist.subtitle", { defaultValue: "Courses you saved for later." })}
          icon={Heart}
          action={
            <Link to="/explore" className={studentBtnPrimary}>
              {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
            </Link>
          }
        />
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => {
            const course = row.course || row;
            const courseId = course.id || row.courseId;
            return (
              <article
                key={row.id || courseId}
                className="group flex flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:border-[var(--yu-blue-200)] hover:shadow-[var(--shadow-md)] dark:border-white/8 dark:bg-[#0F1E38]"
              >
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="h-36 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-[linear-gradient(145deg,#0F2448,#1B4FBF)]">
                    <Heart className="h-8 w-8 text-white/35" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-black tracking-tight text-slate-900 dark:text-white">{course.title}</h3>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/courses/${courseId}`} className={`${studentBtnPrimary} flex-1 py-2.5`}>
                      {t("student.wishlist.viewCourse", { defaultValue: "View course" })}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void toggle.mutateAsync({ courseId, isWishlisted: true })}
                      className={`${studentBtnGhost} border-rose-200 px-3 py-2.5 text-rose-500 hover:border-rose-300 hover:text-rose-600 dark:border-rose-900/40 dark:text-rose-400`}
                      aria-label={t("student.wishlist.remove", { defaultValue: "Remove" })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
