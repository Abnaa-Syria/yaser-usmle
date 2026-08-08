import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, UserPlus } from "lucide-react";

const FEATURE_LABELS = {
  recordings: { en: "Recordings", ar: "التسجيلات" },
  exams: { en: "Exams", ar: "الاختبارات" },
  flashcards: { en: "Flashcards", ar: "البطاقات" },
  "study-plan": { en: "Study plan", ar: "خطة الدراسة" },
  qna: { en: "Q&A", ar: "الأسئلة والأجوبة" },
  progress: { en: "Progress", ar: "التقدّم" },
  certificates: { en: "Certificates", ar: "الشهادات" },
  tickets: { en: "Support tickets", ar: "التذاكر" },
  settings: { en: "Settings", ar: "الإعدادات" },
};

export default function TrialLockedFeature() {
  const { feature } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const meta = FEATURE_LABELS[feature] || { en: "This feature", ar: "هذه الميزة" };
  const label = isRtl ? meta.ar : meta.en;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
        <Lock className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{label}</h1>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
        {t("trial.lockedPageBody", {
          feature: label,
          defaultValue: isRtl
            ? `${label} جزء من تجربة الطالب الكاملة بعد إنشاء حساب. في التجربة المجانية يمكنك مشاهدة الكورسات المختارة والتعلّم منها.`
            : `${label} unlocks with a full student account. In the free trial you can still watch and learn from curated courses.`,
        })}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/signup"
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--yu-blue-700)] px-5 text-sm font-black text-white"
        >
          <UserPlus className="h-4 w-4" />
          {t("trial.saveProgress", { defaultValue: isRtl ? "أنشئ حساباً" : "Create account" })}
        </Link>
        <Link
          to="/trial/classes"
          className="inline-flex h-11 items-center rounded-2xl border border-slate-200 px-5 text-sm font-bold dark:border-white/10"
        >
          {t("sidebarNav.items.myCourses")}
        </Link>
      </div>
    </div>
  );
}
