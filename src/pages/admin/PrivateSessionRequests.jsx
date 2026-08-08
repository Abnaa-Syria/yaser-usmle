import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { getErrorMessage } from "../../api/error";

const STATUSES = ["NEW", "CONTACTED", "CLOSED", "ARCHIVED"];

async function fetchRequests(params = {}) {
  const res = await client.get("/admin/private-session-requests", { params });
  return res?.data?.data ?? [];
}

async function updateRequest(id, body) {
  const res = await client.patch(`/admin/private-session-requests/${id}`, body);
  return res?.data?.data;
}

export default function AdminPrivateSessionRequests() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [status, setStatus] = useState("");
  const [notesById, setNotesById] = useState({});
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "private-session-requests", status],
    queryFn: () => fetchRequests(status ? { status, limit: 50 } : { limit: 50 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "private-session-requests"] });
      toast.success(t("adminPages.privateSessionRequests.updated", { defaultValue: isRtl ? "تم التحديث." : "Updated." }));
    },
    onError: (err) => toast.error(getErrorMessage(err, isRtl ? "تعذّر التحديث." : "Update failed.")),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("adminPages.privateSessionRequests.title", { defaultValue: isRtl ? "طلبات الجلسات الفردية" : "Private session requests" })}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("adminPages.privateSessionRequests.subtitle", {
            defaultValue: isRtl
              ? "تواصل مع الطالب خارج المنصة عبر البريد أو الهاتف، ثم حدّث حالة الطلب."
              : "Contact the student outside the platform by email or phone, then update the request status.",
          })}
        </p>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="">{isRtl ? "كل الحالات" : "All statuses"}</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => refetch()} className="rounded-xl border px-3 py-2 text-sm font-semibold dark:border-slate-700">
          {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <p className="text-sm text-red-600">
          {t("adminPages.privateSessionRequests.loadError", { defaultValue: isRtl ? "تعذّر تحميل الطلبات." : "Could not load requests." })}
        </p>
      ) : null}

      <div className="grid gap-4">
        {requests.length ? (
          requests.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{row.name}</h2>
                  <p className="text-sm text-slate-500">
                    <a href={`mailto:${row.email}`} className="text-[var(--yu-blue-700)] hover:underline">
                      {row.email}
                    </a>
                    {" · "}
                    {row.phone ? (
                      <a href={`tel:${row.phone}`} className="hover:underline" dir="ltr">
                        {row.phone}
                      </a>
                    ) : (
                      isRtl ? "بدون هاتف" : "No phone"
                    )}
                  </p>
                  {row.instructor?.fullName ? (
                    <p className="mt-1 text-xs text-slate-400">
                      {isRtl ? "المحاضر:" : "Instructor:"} {row.instructor.fullName}
                    </p>
                  ) : null}
                  {row.preferredTime ? (
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">{isRtl ? "الوقت المفضّل:" : "Preferred time:"}</span> {row.preferredTime}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {row.status}
                </span>
              </div>
              {row.message ? <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">{row.message}</p> : null}
              <p className="mt-2 text-xs text-slate-400">{row.createdAt ? new Date(row.createdAt).toLocaleString(isRtl ? "ar-EG" : "en-US") : ""}</p>
              <textarea
                value={notesById[row.id] ?? row.adminNotes ?? ""}
                onChange={(e) => setNotesById((current) => ({ ...current, [row.id]: e.target.value }))}
                rows={2}
                className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                placeholder={isRtl ? "ملاحظات الإدارة" : "Admin notes"}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: row.id,
                        body: {
                          status: item,
                          adminNotes: notesById[row.id] ?? row.adminNotes ?? "",
                        },
                      })
                    }
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                      row.status === item ? "border-[var(--yu-blue-700)] text-[var(--yu-blue-700)]" : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : !isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            {t("adminPages.privateSessionRequests.empty", { defaultValue: isRtl ? "لا توجد طلبات بعد." : "No requests yet." })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
