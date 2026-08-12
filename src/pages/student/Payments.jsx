import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  StudentBadge,
  StudentTableShell,
  studentBtnPrimary,
} from "../../components/student/ui";
import { useMyPayments } from "../../features/student/financials/hooks";
import { openMyPaymentProof } from "../../features/student/financials/api";
import { getErrorMessage } from "../../api/error";

const STATUS_TONE = {
  PENDING: "amber",
  APPROVED: "emerald",
  PAID: "emerald",
  REJECTED: "rose",
  FAILED: "rose",
};

function formatAmount(amount, currency = "USD") {
  const n = Number(amount) || 0;
  return `${Math.round(n).toLocaleString()} ${currency}`;
}

function hasViewableReceipt(receiptUrl) {
  if (!receiptUrl || typeof receiptUrl !== "string") return false;
  if (receiptUrl.startsWith("INSTANT_FREE")) return false;
  return receiptUrl.includes("/uploads/payment-proofs/") || /^https?:\/\//i.test(receiptUrl);
}

export default function Payments() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data: payments = [], isLoading, isError, error, refetch } = useMyPayments();
  const [openingId, setOpeningId] = useState(null);

  const handleViewReceipt = async (payment) => {
    if (!hasViewableReceipt(payment?.receiptUrl)) return;
    // External absolute receipts (rare) can open directly.
    if (/^https?:\/\//i.test(payment.receiptUrl) && !payment.receiptUrl.includes("/uploads/payment-proofs/")) {
      window.open(payment.receiptUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setOpeningId(payment.id);
    try {
      await openMyPaymentProof(payment.id);
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          t("student.payments.receiptOpenError", { defaultValue: isRtl ? "تعذر فتح الإيصال" : "Could not open receipt" })
        )
      );
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.payments.title", { defaultValue: "Payments" })}
        subtitle={t("student.payments.subtitle", { defaultValue: "Track your course purchase requests and receipts." })}
      />

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <EmptyState
          title={t("student.payments.loadError", { defaultValue: "Could not load payments." })}
          message={getErrorMessage(error, t("student.payments.loadError", { defaultValue: "Could not load payments." }))}
          icon={CreditCard}
          action={
            <button type="button" onClick={() => void refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry")}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && payments.length === 0 ? (
        <EmptyState
          title={t("student.payments.empty", { defaultValue: "No payment requests yet." })}
          message={t("student.payments.subtitle", { defaultValue: "Track your course purchase requests and receipts." })}
          icon={CreditCard}
          action={
            <Link to="/explore" className={studentBtnPrimary}>
              {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
            </Link>
          }
        />
      ) : null}

      {!isLoading && !isError && payments.length > 0 ? (
        <StudentTableShell>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-start text-xs uppercase tracking-wide text-slate-500 dark:border-white/8">
                <th className="px-5 py-3.5 font-bold">{t("student.payments.colCourse", { defaultValue: "Course / item" })}</th>
                <th className="px-5 py-3.5 font-bold">{t("student.payments.colAmount", { defaultValue: "Amount" })}</th>
                <th className="px-5 py-3.5 font-bold">{t("student.payments.colStatus", { defaultValue: "Status" })}</th>
                <th className="px-5 py-3.5 font-bold">{t("student.payments.colDate", { defaultValue: "Date" })}</th>
                <th className="px-5 py-3.5 font-bold">{t("student.payments.colReceipt", { defaultValue: "Receipt" })}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const label =
                  p.course?.title ||
                  (isRtl ? p.coursePackage?.titleAr || p.coursePackage?.title : p.coursePackage?.title || p.coursePackage?.titleAr) ||
                  t("student.payments.unknownItem", { defaultValue: "Payment" });
                const status = String(p.status || "PENDING").toUpperCase();
                const canView = hasViewableReceipt(p.receiptUrl);
                const busy = openingId === p.id;
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{label}</td>
                    <td className="px-5 py-3.5 font-medium tabular-nums" dir="ltr">{formatAmount(p.amount, p.currency || "USD")}</td>
                    <td className="px-5 py-3.5">
                      <StudentBadge tone={STATUS_TONE[status] || "slate"}>{status}</StudentBadge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {(p.updatedAt || p.createdAt)
                        ? new Date(p.updatedAt || p.createdAt).toLocaleDateString(isRtl ? "ar" : undefined)
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {canView ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleViewReceipt(p)}
                          className="inline-flex items-center gap-1 font-bold text-[var(--yu-blue-700)] hover:underline disabled:opacity-60 dark:text-[var(--yu-blue-400)]"
                        >
                          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          {t("student.payments.viewReceipt", { defaultValue: "View" })}
                          {!busy ? <ExternalLink className="h-3.5 w-3.5" /> : null}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </StudentTableShell>
      ) : null}
    </div>
  );
}
