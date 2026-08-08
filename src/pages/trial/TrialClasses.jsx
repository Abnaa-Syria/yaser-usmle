import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Play } from "lucide-react";
import { useTrialMe } from "../../features/trial/hooks";

const FALLBACK =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=85&w=800&auto=format&fit=crop";

export default function TrialClasses() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const ctx = useOutletContext() || {};
  const { data: me } = useTrialMe();
  const expired = ctx.expired || me?.expired;
  const courses = me?.courses || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--yu-blue-600)]">
          {t("trial.badge", { defaultValue: isRtl ? "تجربة مجانية" : "Free trial" })}
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{t("sidebarNav.items.myCourses")}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {t("trial.classesSubtitle", {
            defaultValue: isRtl
              ? "كورسات تجربتك كما تظهر للطالب — يختارها الأدمن من إعدادات التجربة."
              : "Your trial courses as a student would see them — curated by admin trial settings.",
          })}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const title = isRtl ? course.titleAr || course.title : course.title;
          const desc = isRtl ? course.shortDescriptionAr || course.shortDescription : course.shortDescription;
          return (
            <article
              key={course.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
            >
              <div className="relative aspect-[16/9] bg-slate-100 dark:bg-white/5">
                <img src={course.thumbnail || course.coverImage || FALLBACK} alt="" className="h-full w-full object-cover" />
                <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black text-white">
                  <BookOpen className="h-3 w-3" />
                  {t("trial.badge")}
                </span>
              </div>
              <div className="space-y-3 p-4">
                <h2 className="line-clamp-2 text-base font-black text-slate-900 dark:text-white">{title}</h2>
                {desc ? <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-500">{desc}</p> : null}
                {expired ? (
                  <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/5">
                    {t("trial.locked", { defaultValue: isRtl ? "مقفل" : "Locked" })}
                  </span>
                ) : (
                  <Link
                    to={`/trial/courses/${course.id}/learn`}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] text-xs font-black text-white"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {t("trial.startLearning", { defaultValue: isRtl ? "ابدأ التعلم" : "Start learning" })}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!courses.length ? (
        <p className="py-16 text-center text-sm text-slate-500">
          {t("trial.noCourses", { defaultValue: isRtl ? "لا توجد كورسات في التجربة حالياً." : "No trial courses configured yet." })}
        </p>
      ) : null}
    </div>
  );
}
