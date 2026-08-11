import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Headphones, Play, Search } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import { StudentBadge, StudentToolbar, studentFieldClass, studentSelectClass, studentBtnPrimary } from "../../components/student/ui";
import { useStudentRecordings } from "../../features/student/recordings/hooks";
import { getErrorMessage } from "../../api/error";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

const THUMB_GRADIENTS = [
  "from-[var(--yu-blue-950)] to-[var(--yu-blue-700)]",
  "from-slate-700 to-slate-500",
  "from-[var(--yu-blue-600)] to-[var(--yu-blue-500)]",
];

function RecordingCard({ item, gradientClass }) {
  const { t } = useTranslation();
  const href = `/student/recordings/${item.sourceType}/${item.id}`;

  return (
    <Link
      to={href}
      className="group flex flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/90 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--yu-blue-200)] hover:shadow-[var(--shadow-md)] dark:border-white/8 dark:bg-[#0F1E38]/85"
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradientClass}`} style={{ paddingTop: "56.25%" }}>
        {resolveMediaUrl(item.thumbnailUrl) ? (
          <img src={resolveMediaUrl(item.thumbnailUrl)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {item.courseTitle ? (
          <StudentBadge tone="blue">{item.courseTitle}</StudentBadge>
        ) : null}
        <h3 className="mt-2 text-base font-black leading-snug text-slate-900 line-clamp-2 dark:text-white">{item.title}</h3>
        <p className="mt-2 text-xs font-medium text-slate-500">
          {t("student.recordings.typeLesson", { defaultValue: "Lesson video" })}
          {item.durationText ? ` · ${item.durationText}` : ""}
        </p>
      </div>
    </Link>
  );
}

export default function RecordingsLibrary() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading, isError, error, refetch } = useStudentRecordings();
  const recordings = data?.recordings ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recordings.filter((r) => {
      const matchSearch =
        !q ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.courseTitle || "").toLowerCase().includes(q);
      const matchType = !typeFilter || r.sourceType === typeFilter;
      return matchSearch && matchType;
    });
  }, [recordings, search, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={t("student.recordings.title", { defaultValue: "Recordings" })}
        subtitle={t("student.recordings.subtitle", { defaultValue: "Watch lesson videos from your courses." })}
      />

      <StudentToolbar>
        <div className="relative flex-1">
          <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("recordings.searchPlaceholder")}
            className={`${studentFieldClass} ps-10`}
          />
        </div>
        <div className="relative w-full sm:w-52">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={studentSelectClass}>
            <option value="">{t("student.recordings.filterAll", { defaultValue: "All types" })}</option>
            <option value="RECORDED_LESSON">{t("student.recordings.typeLesson", { defaultValue: "Lesson videos" })}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </StudentToolbar>

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}

      {isError ? (
        <EmptyState
          title={t("student.recordings.loadError", { defaultValue: "Could not load recordings" })}
          message={getErrorMessage(error, t("student.recordings.loadError", { defaultValue: "Could not load recordings." }))}
          icon={Headphones}
          action={
            <button type="button" onClick={() => void refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry")}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && recordings.length === 0 ? (
        <EmptyState
          title={t("student.recordings.empty", { defaultValue: "No recordings available yet." })}
          message={t("student.recordings.subtitle", { defaultValue: "Watch lesson videos from your courses." })}
          icon={Headphones}
        />
      ) : null}

      {!isLoading && !isError && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <RecordingCard key={`${item.sourceType}-${item.id}`} item={item} gradientClass={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]} />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && recordings.length > 0 && filtered.length === 0 ? (
        <EmptyState
          title={t("recordings.empty", { defaultValue: "No matches" })}
          message={t("recordings.searchPlaceholder", { defaultValue: "Try a different search." })}
          icon={Search}
        />
      ) : null}
    </div>
  );
}
