import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, User } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import EmptyState from "../components/dashboard/EmptyState";
import { StudentSurface, studentBtnGhost, studentBtnPrimary } from "../components/student/ui";
import PrivateSessionPayModal, { formatSessionPrice } from "../components/student/PrivateSessionPayModal";
import { useAvailableBookingSlots } from "../features/student/bookings/hooks";

export default function BookPrivate() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [searchParams] = useSearchParams();
  const instructorFilter = searchParams.get("instructor");
  const { data: slots = [], isLoading, isError, refetch } = useAvailableBookingSlots(120);
  const [msg, setMsg] = useState("");
  const [paySlot, setPaySlot] = useState(null);

  const filtered = instructorFilter
    ? slots.filter((s) => s.instructor?.id === instructorFilter)
    : slots;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bookSession.title")}
        subtitle={t("bookSession.subtitle")}
        actions={
          <Link to="/instructors" className={studentBtnGhost}>
            {t("publicInstructors.backToList", { defaultValue: "Browse instructors" })}
          </Link>
        }
      />

      {msg ? (
        <StudentSurface className="border-emerald-200/80 bg-emerald-50/60 text-sm font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-300">
          {msg}
        </StudentSurface>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <EmptyState
          title={t("bookSession.loadError")}
          message={t("takeExam.retry", { defaultValue: "Retry" })}
          icon={Calendar}
          action={
            <button type="button" className={studentBtnPrimary} onClick={() => void refetch()}>
              {t("takeExam.retry")}
            </button>
          }
        />
      ) : null}

      <ul className="space-y-3">
        {filtered.map((s) => (
          <li key={s.id}>
            <StudentSurface className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--yu-blue-700)]/12 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-400)]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <User className="h-4 w-4 text-slate-400" />
                    {s.instructor?.fullName || "—"}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {new Date(s.startTime).toLocaleString()} → {new Date(s.endTime).toLocaleString()}
                  </p>
                  {s.price > 0 ? (
                    <p className="mt-1 text-sm font-black text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-400)]">
                      {formatSessionPrice(s.price, isRtl)}
                    </p>
                  ) : null}
                </div>
              </div>
              <button type="button" onClick={() => setPaySlot(s)} className={studentBtnPrimary}>
                {t("bookSession.book")}
              </button>
            </StudentSurface>
          </li>
        ))}
      </ul>

      {!isLoading && !isError && filtered.length === 0 ? (
        <EmptyState
          title={t("bookSession.empty")}
          message={t("bookSession.subtitle")}
          icon={Calendar}
          action={
            <Link to="/instructors" className={studentBtnPrimary}>
              {t("publicInstructors.backToList", { defaultValue: "Browse instructors" })}
            </Link>
          }
        />
      ) : null}

      {paySlot ? (
        <PrivateSessionPayModal
          slot={paySlot}
          isRtl={isRtl}
          onClose={() => setPaySlot(null)}
          onSuccess={() => {
            setPaySlot(null);
            setMsg(t("bookSession.success"));
            void refetch();
          }}
        />
      ) : null}
    </div>
  );
}
