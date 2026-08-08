import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Headphones, Loader2, Play } from "lucide-react";
import { useTrialRecordings } from "../../features/trial/hooks";

export default function TrialRecordings() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data: recordings = [], isLoading, isError } = useTrialRecordings();

  return (
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          <Headphones className="h-4 w-4" />
          {t("sidebarNav.items.recordings")}
        </p>
        <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
          {t("trial.recordingsTitle", { defaultValue: isRtl ? "مكتبة التسجيلات التجريبية" : "Trial recordings library" })}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("trial.recordingsHint", {
            defaultValue: isRtl
              ? "كل دروس الفيديو ضمن كورسات تجربتك على هذا الجهاز."
              : "All video lessons from your trial courses on this device.",
          })}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("dashboard.common.loading")}
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {t("trial.sessionBlocked", {
            defaultValue: isRtl ? "تعذّر تحميل التسجيلات — قد تكون التجربة موقوفة على هذا الجهاز." : "Could not load recordings — trial may be stopped on this device.",
          })}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recordings.map((item) => {
          const courseTitle = isRtl ? item.courseTitleAr || item.courseTitle : item.courseTitle;
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/8 dark:bg-[#0F1E38]"
            >
              <div className="space-y-2 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{courseTitle}</p>
                <h3 className="line-clamp-2 text-sm font-black text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-[11px] text-slate-500">
                  {item.unitTitle}
                  {item.sectionTitle ? ` · ${item.sectionTitle}` : ""}
                </p>
                <Link
                  to={item.learnPath}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] text-xs font-black text-white"
                >
                  <Play className="h-3.5 w-3.5" />
                  {t("trial.watch", { defaultValue: isRtl ? "شاهد" : "Watch" })}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {!isLoading && !recordings.length ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10">
          {t("trial.noRecordings", { defaultValue: isRtl ? "لا توجد تسجيلات في كورسات التجربة حالياً." : "No recordings in trial courses yet." })}
        </p>
      ) : null}
    </div>
  );
}
