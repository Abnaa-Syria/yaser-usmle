import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import {
  useAdminSubscriptions,
  useAdminSubscriptionLookups,
  useCreateAdminSubscription,
  useUpdateAdminSubscriptionStatus,
} from "../../features/admin/subscriptions/hooks";
import { getErrorMessage } from "../../api/error";

const STATUS_OPTIONS = [
  { value: "ACTIVE", labelAr: "نشط", labelEn: "Active" },
  { value: "PENDING_PAYMENT", labelAr: "بانتظار الدفع", labelEn: "Pending payment" },
  { value: "EXPIRED", labelAr: "منتهي", labelEn: "Expired" },
  { value: "CANCELED", labelAr: "ملغى", labelEn: "Canceled" },
];

function statusLabel(status, isRtl) {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  if (!found) return status || "—";
  return isRtl ? found.labelAr : found.labelEn;
}

export default function Subscriptions() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data, isLoading, isError, error, refetch } = useAdminSubscriptions();
  const { data: lookups } = useAdminSubscriptionLookups();
  const createMutation = useCreateAdminSubscription();
  const statusMutation = useUpdateAdminSubscriptionStatus();

  const subscriptions = Array.isArray(data) ? data : data?.subscriptions || [];
  const students = lookups?.students || [];
  const packages = lookups?.packages || [];

  const [studentId, setStudentId] = useState("");
  const [planId, setPlanId] = useState("");
  const [message, setMessage] = useState("");

  const rows = useMemo(() => subscriptions, [subscriptions]);

  const create = () => {
    setMessage("");
    if (!studentId || !planId) {
      setMessage(isRtl ? "اختر الطالب والخطة" : "Select student and plan");
      return;
    }
    createMutation.mutate(
      { studentId, planId, status: "ACTIVE" },
      {
        onSuccess: () => {
          setMessage(isRtl ? "تم إنشاء الاشتراك" : "Subscription created");
          setStudentId("");
          setPlanId("");
        },
        onError: (err) => setMessage(getErrorMessage(err, "Failed to create subscription")),
      }
    );
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.subscriptions.title", { defaultValue: "Subscriptions" })}
        subtitle={t("adminPages.subscriptions.subtitle", { defaultValue: "Manage user subscription access" })}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
        <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-white">
          {isRtl ? "منح اشتراك يدوياً" : "Grant subscription"}
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">{isRtl ? "الطالب" : "Student"}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName || s.name || s.email}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            <option value="">{isRtl ? "الخطة / الباقة" : "Plan / Package"}</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.title}
                {p.durationMonths ? ` (${p.durationMonths} ${isRtl ? "شهر" : "mo"})` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={create}
            disabled={createMutation.isPending}
            className="rounded-lg bg-[var(--yu-blue-700)] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {createMutation.isPending ? "..." : isRtl ? "إنشاء" : "Create"}
          </button>
        </div>
        {message ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
        {isLoading ? <p className="p-4 text-sm text-slate-500">{isRtl ? "جاري التحميل..." : "Loading..."}</p> : null}
        {isError ? (
          <p className="p-4 text-sm text-red-500">
            {getErrorMessage(error, "Failed to load")}{" "}
            <button type="button" className="underline" onClick={() => refetch()}>
              {isRtl ? "إعادة المحاولة" : "Retry"}
            </button>
          </p>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-start dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-semibold">{isRtl ? "المستخدم" : "User"}</th>
                <th className="px-4 py-3 font-semibold">{isRtl ? "الخطة" : "Plan"}</th>
                <th className="px-4 py-3 font-semibold">{isRtl ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-semibold">{isRtl ? "يبدأ" : "Starts"}</th>
                <th className="px-4 py-3 font-semibold">{isRtl ? "ينتهي" : "Expires"}</th>
                <th className="px-4 py-3 font-semibold">{isRtl ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const student = row.student || row.user;
                const plan = row.plan;
                const endsAt = row.endDate || row.expiresAt;
                const startsAt = row.startDate;
                return (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-white/5">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {student?.fullName || student?.email || row.studentId || "—"}
                      </div>
                      {student?.email && student?.fullName ? (
                        <div className="text-xs text-slate-400">{student.email}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {plan?.name || plan?.title || row.planId || "—"}
                      {plan?.durationMonths != null ? (
                        <span className="ms-1 text-xs text-slate-400">
                          ({plan.durationMonths} {isRtl ? "شهر" : "mo"})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          row.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : row.status === "PENDING_PAYMENT"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                              : row.status === "EXPIRED"
                                ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                        }`}
                      >
                        {statusLabel(row.status, isRtl)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {startsAt ? new Date(startsAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {endsAt ? new Date(endsAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded border border-slate-200 px-2 py-1 text-xs dark:border-white/10 dark:bg-[#0F0F13]"
                        value={row.status || "ACTIVE"}
                        disabled={statusMutation.isPending}
                        onChange={(e) =>
                          statusMutation.mutate({ id: row.id, status: e.target.value })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {isRtl ? s.labelAr : s.labelEn}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {isRtl ? "لا توجد اشتراكات" : "No subscriptions yet"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
