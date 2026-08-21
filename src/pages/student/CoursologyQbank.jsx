import { useTranslation } from "react-i18next";
import { ExternalLink, Library, Sparkles, Target, ClipboardList } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { StudentSurface, studentBtnPrimary } from "../../components/student/ui";
import { COURSOLOGY_QBANK_URL } from "../../config/siteLinks";

const HIGHLIGHTS = [
  {
    icon: ClipboardList,
    titleAr: "تدريب على الأسئلة",
    titleEn: "Question practice",
    bodyAr: "تدرب بأسلوب قريب من امتحان USMLE وراجع نقاط الضعف بوضوح.",
    bodyEn: "Practice in a USMLE-style format and review weak areas clearly.",
  },
  {
    icon: Target,
    titleAr: "تركيز على الإتقان",
    titleEn: "Mastery-focused",
    bodyAr: "استخدم بنك الأسئلة لتعزيز الفهم والتطبيق السريري خطوة بخطوة.",
    bodyEn: "Use the Qbank to strengthen understanding and clinical application step by step.",
  },
  {
    icon: Sparkles,
    titleAr: "مكمل لمنصتك",
    titleEn: "Complements your courses",
    bodyAr: "افتح بنك أسئلة كورسوجلي كأداة إضافية إلى جانب كورسات Yaser USMLE.",
    bodyEn: "Open Coursology Qbanks as an extra tool alongside your Yaser USMLE courses.",
  },
];

export default function CoursologyQbank() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        eyebrow={t("student.coursology.eyebrow", { defaultValue: isAr ? "شريك تدريبي" : "Practice partner" })}
        title={t("student.coursology.title", {
          defaultValue: isAr ? "بنك أسئلة كورسوجلي" : "Coursology Qbanks",
        })}
        subtitle={t("student.coursology.subtitle", {
          defaultValue: isAr
            ? "منصة أسئلة خارجية مكملة لتحضيرك لـ USMLE Step 1 — افتحها مباشرة من هنا."
            : "An external question bank that complements your USMLE Step 1 prep — open it directly from here.",
        })}
      />

      <StudentSurface className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(27,79,191,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(245,158,11,0.08), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--yu-blue-200)] bg-[var(--yu-blue-50)] px-3 py-1 text-[11px] font-bold text-[var(--yu-blue-800)] dark:border-[var(--yu-blue-400)]/35 dark:bg-[#163056] dark:text-[#93C5FD]">
              <Library className="h-3.5 w-3.5 shrink-0" />
              Coursology
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t("student.coursology.heroTitle", {
                defaultValue: isAr ? "جاهز للتدريب على بنك الأسئلة؟" : "Ready to practice with the Qbank?",
              })}
            </h2>
            <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
              {t("student.coursology.heroBody", {
                defaultValue: isAr
                  ? "بنك أسئلة كورسوجلي أداة مستقلة تساعدك على التمرين والمراجعة. اضغط الزر للانتقال إلى الموقع الرسمي."
                  : "Coursology Qbanks is a standalone practice tool for drills and review. Tap the button to open the official site.",
              })}
            </p>
            <a
              href={COURSOLOGY_QBANK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${studentBtnPrimary} mt-2 w-full sm:w-auto`}
            >
              {t("student.coursology.cta", {
                defaultValue: isAr ? "زيارة بنك الأسئلة" : "Visit Qbank",
              })}
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {COURSOLOGY_QBANK_URL.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
      </StudentSurface>

      <div className="grid gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <StudentSurface key={item.titleEn} className="space-y-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/25 dark:text-[var(--yu-blue-300)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{isAr ? item.titleAr : item.titleEn}</h3>
              <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-300">
                {isAr ? item.bodyAr : item.bodyEn}
              </p>
            </StudentSurface>
          );
        })}
      </div>
    </div>
  );
}
