import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/dashboard/PageHeader";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import { getErrorMessage, unwrapResponse } from "../../api/error";

async function fetchRequests(status) {
  const res = await client.get(endpoints.admin.deviceReplacements, {
    params: status ? { status } : undefined,
  });
  return unwrapResponse(res) || [];
}

export default function AdminDeviceReplacements() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const [status, setStatus] = useState("PENDING");
  const qc = useQueryClient();
  const { data: rows = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "device-replacements", status],
    queryFn: () => fetchRequests(status),
  });

  const approve = useMutation({
    mutationFn: (id) => client.post(endpoints.admin.deviceReplacementApprove(id), {}),
    onSuccess: () => {
      toast.success(isAr ? "تمت الموافقة" : "Approved");
      qc.invalidateQueries({ queryKey: ["admin", "device-replacements"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const reject = useMutation({
    mutationFn: (id) => client.post(endpoints.admin.deviceReplacementReject(id), {}),
    onSuccess: () => {
      toast.success(isAr ? "تم الرفض" : "Rejected");
      qc.invalidateQueries({ queryKey: ["admin", "device-replacements"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("adminPages.deviceReplacements.title", {
          defaultValue: isAr ? "طلبات استبدال الأجهزة" : "Device replacement requests",
        })}
        subtitle={t("adminPages.deviceReplacements.subtitle", {
          defaultValue: isAr
            ? "الطلاب محدودون بجهازين موثوقين. وافق أو ارفض طلبات الاستبدال."
            : "Students are limited to 2 trusted devices. Approve or reject replacement requests.",
        })}
      />

      <div className="flex flex-wrap gap-2">
        {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
          <button
            key={s || "ALL"}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              status === s ? "bg-[var(--yu-blue-700)] text-white" : "border border-slate-200 dark:border-white/10"
            }`}
          >
            {s || (isAr ? "الكل" : "All")}
          </button>
        ))}
        <button type="button" onClick={() => refetch()} className="rounded-xl border px-3 py-2 text-xs font-bold">
          Refresh
        </button>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {isError ? <p className="text-sm text-red-600">Could not load requests.</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/8 dark:bg-[#1A1A22]">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No requests.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-0 md:grid-cols-[1fr_auto] dark:border-white/8">
              <div className="space-y-1 text-sm">
                <p className="font-bold text-slate-900 dark:text-white">
                  {row.student?.fullName || "—"}{" "}
                  <span className="text-xs font-medium text-slate-500">({row.student?.email})</span>
                </p>
                <p className="text-xs text-slate-500">
                  Remove: {row.oldDevice?.deviceName || row.oldDevice?.os || row.oldDeviceId}
                </p>
                <p className="text-xs text-slate-500">
                  Add: {row.newDeviceName || row.newOs || row.newFingerprint?.slice(0, 12)}
                </p>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  {row.status} · {new Date(row.createdAt).toLocaleString()}
                </p>
                {row.student?.id ? (
                  <Link to={`/admin/students/${row.student.id}`} className="text-xs font-bold text-[var(--yu-blue-700)] hover:underline">
                    Open student
                  </Link>
                ) : null}
              </div>
              {row.status === "PENDING" ? (
                <div className="flex flex-wrap items-start gap-2">
                  <button
                    type="button"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate(row.id)}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={reject.isPending}
                    onClick={() => reject.mutate(row.id)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
