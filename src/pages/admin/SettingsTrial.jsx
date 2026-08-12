import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FlaskConical, Loader2, MonitorSmartphone, Save, Search, ShieldOff, RotateCcw } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import {
  useAdminTrial,
  useAdminTrialSessions,
  useReplaceAdminTrialCourses,
  useRestoreAdminTrialSession,
  useRevokeAdminTrialSession,
  useUpdateAdminTrialSettings,
} from "../../features/admin/trial/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";

function Toggle({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          enabled ? "bg-[var(--yu-blue-700)]" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function statusBadge(status, isRtl) {
  const map = {
    ACTIVE: { label: isRtl ? "نشطة" : "Active", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
    EXPIRED: { label: isRtl ? "منتهية" : "Expired", className: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300" },
    REVOKED: { label: isRtl ? "موقوفة" : "Stopped", className: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300" },
  };
  const item = map[status] || map.EXPIRED;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${item.className}`}>{item.label}</span>;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

export default function SettingsTrial() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data, isLoading } = useAdminTrial();
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 100 });
  const updateSettings = useUpdateAdminTrialSettings();
  const replaceCourses = useReplaceAdminTrialCourses();
  const revokeSession = useRevokeAdminTrialSession();
  const restoreSession = useRestoreAdminTrialSession();

  const [form, setForm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [sessionStatus, setSessionStatus] = useState("ALL");
  const [sessionQ, setSessionQ] = useState("");
  const [sessionPage, setSessionPage] = useState(1);

  const sessionsQuery = useAdminTrialSessions({
    status: sessionStatus,
    page: sessionPage,
    limit: 15,
    q: sessionQ,
  });

  useEffect(() => {
    if (!data?.settings) return;
    setForm({ ...data.settings });
    setSelectedIds(
      (data.courses || [])
        .map((c) => c.course?.id || c.courseId)
        .filter(Boolean)
    );
  }, [data]);

  const allCourses = coursesData?.courses || [];
  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return allCourses;
    return allCourses.filter((c) => String(c.title || "").toLowerCase().includes(q));
  }, [allCourses, courseSearch]);

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveSettings = async () => {
    if (!form) return;
    try {
      await updateSettings.mutateAsync({
        enabled: form.enabled,
        durationDays: Number(form.durationDays),
        popupEnabled: form.popupEnabled,
        title: form.title,
        titleAr: form.titleAr,
        subtitle: form.subtitle,
        subtitleAr: form.subtitleAr,
        ctaLabel: form.ctaLabel,
        ctaLabelAr: form.ctaLabelAr,
        dismissDays: Number(form.dismissDays),
      });
      toast.success(t("adminPages.trial.saved", { defaultValue: isRtl ? "تم حفظ إعدادات التجربة" : "Trial settings saved" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.trial.saveFailed", { defaultValue: "Save failed" })));
    }
  };

  const saveCourses = async () => {
    try {
      await replaceCourses.mutateAsync(
        selectedIds.map((courseId, index) => ({
          courseId,
          displayOrder: index,
          isActive: true,
        }))
      );
      toast.success(t("adminPages.trial.coursesSaved", { defaultValue: isRtl ? "تم حفظ كورسات التجربة" : "Trial courses saved" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.trial.saveFailed", { defaultValue: "Save failed" })));
    }
  };

  const toggleCourse = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const stopDevice = async (id) => {
    const reason = window.prompt(
      isRtl ? "سبب الإيقاف (اختياري):" : "Stop reason (optional):",
      isRtl ? "إيقاف من الإدارة" : "Stopped by administrator"
    );
    if (reason === null) return;
    try {
      await revokeSession.mutateAsync({ id, reason: reason || undefined });
      toast.success(isRtl ? "تم إيقاف التجربة على الجهاز فوراً" : "Trial stopped on device immediately");
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل الإيقاف" : "Failed to stop"));
    }
  };

  const restoreDevice = async (id) => {
    try {
      await restoreSession.mutateAsync(id);
      toast.success(isRtl ? "تمت إعادة تفعيل التجربة على الجهاز" : "Trial restored on device");
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل الاستعادة" : "Failed to restore"));
    }
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("dashboard.common.loading")}
      </div>
    );
  }

  const counts = sessionsQuery.data?.counts || { active: 0, expired: 0, revoked: 0, all: 0 };
  const sessions = sessionsQuery.data?.sessions || [];
  const pagination = sessionsQuery.data?.pagination;

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.trial.title", { defaultValue: isRtl ? "التجربة المجانية" : "Free trial" })}
        subtitle={t("adminPages.trial.subtitle", {
          defaultValue: isRtl
            ? "تحكم في الظهور والمدة والكورسات، وأوقف التجربة على أي جهاز مباشرة"
            : "Control popup, duration, courses — and stop trial on any device instantly",
        })}
        actions={
          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={updateSettings.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("dashboard.common.save", { defaultValue: isRtl ? "حفظ" : "Save" })}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <FlaskConical className="h-4 w-4" />
            {t("adminPages.trial.config", { defaultValue: isRtl ? "الإعدادات" : "Configuration" })}
          </div>
          <Toggle
            label={t("adminPages.trial.enabled", { defaultValue: isRtl ? "تفعيل التجربة" : "Enable free trial" })}
            description={t("adminPages.trial.enabledHint", {
              defaultValue: isRtl ? "عند الإيقاف لن يستطيع الزوار بدء تجربة" : "When off, visitors cannot start a trial",
            })}
            enabled={Boolean(form.enabled)}
            onChange={() => patch("enabled", !form.enabled)}
          />
          <Toggle
            label={t("adminPages.trial.popupEnabled", { defaultValue: isRtl ? "إظهار البوب أب" : "Show popup" })}
            description={t("adminPages.trial.popupHint", {
              defaultValue: isRtl ? "بوب أب عند زيارة الموقع للزوار غير المسجلين" : "Homepage popup for logged-out visitors",
            })}
            enabled={Boolean(form.popupEnabled)}
            onChange={() => patch("popupEnabled", !form.popupEnabled)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("adminPages.trial.durationDays", { defaultValue: isRtl ? "مدة التجربة (أيام)" : "Duration (days)" })}>
              <input
                type="number"
                min={1}
                max={90}
                className={inputClass}
                value={form.durationDays}
                onChange={(e) => patch("durationDays", e.target.value)}
              />
            </Field>
            <Field label={t("adminPages.trial.dismissDays", { defaultValue: isRtl ? "أيام إخفاء البوب بعد الرفض" : "Hide popup after dismiss (days)" })}>
              <input
                type="number"
                min={0}
                max={365}
                className={inputClass}
                value={form.dismissDays}
                onChange={(e) => patch("dismissDays", e.target.value)}
              />
            </Field>
          </div>
          <Field label={t("adminPages.trial.titleEn", { defaultValue: "Title (EN)" })}>
            <input className={inputClass} value={form.title} onChange={(e) => patch("title", e.target.value)} />
          </Field>
          <Field label={t("adminPages.trial.titleAr", { defaultValue: "Title (AR)" })}>
            <input className={inputClass} value={form.titleAr} onChange={(e) => patch("titleAr", e.target.value)} dir="rtl" />
          </Field>
          <Field label={t("adminPages.trial.subtitleEn", { defaultValue: "Subtitle (EN)" })}>
            <textarea
              rows={2}
              className={`${inputClass} h-auto py-2`}
              value={form.subtitle}
              onChange={(e) => patch("subtitle", e.target.value)}
            />
          </Field>
          <Field label={t("adminPages.trial.subtitleAr", { defaultValue: "Subtitle (AR)" })}>
            <textarea
              rows={2}
              className={`${inputClass} h-auto py-2`}
              value={form.subtitleAr}
              onChange={(e) => patch("subtitleAr", e.target.value)}
              dir="rtl"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("adminPages.trial.ctaEn", { defaultValue: "CTA (EN)" })}>
              <input className={inputClass} value={form.ctaLabel} onChange={(e) => patch("ctaLabel", e.target.value)} />
            </Field>
            <Field label={t("adminPages.trial.ctaAr", { defaultValue: "CTA (AR)" })}>
              <input className={inputClass} value={form.ctaLabelAr} onChange={(e) => patch("ctaLabelAr", e.target.value)} dir="rtl" />
            </Field>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {t("adminPages.trial.coursesTitle", { defaultValue: isRtl ? "كورسات التجربة" : "Trial courses" })}
              </p>
              <p className="text-xs text-slate-500">
                {t("adminPages.trial.coursesHint", {
                  defaultValue: isRtl
                    ? `${selectedIds.length} كورس محدد`
                    : `${selectedIds.length} course(s) selected`,
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void saveCourses()}
              disabled={replaceCourses.isPending}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold disabled:opacity-60 dark:border-white/10"
            >
              {replaceCourses.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {t("adminPages.trial.saveCourses", { defaultValue: isRtl ? "حفظ الكورسات" : "Save courses" })}
            </button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              placeholder={t("dashboard.common.search")}
              className={`${inputClass} ps-9`}
            />
          </div>

          <div className="max-h-[28rem] space-y-2 overflow-y-auto pe-1">
            {filteredCourses.map((course) => {
              const checked = selectedIds.includes(course.id);
              return (
                <label
                  key={course.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                    checked
                      ? "border-[var(--yu-blue-700)]/40 bg-[var(--yu-blue-700)]/5"
                      : "border-slate-200 dark:border-white/10"
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleCourse(course.id)} className="h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{course.title}</p>
                    <p className="text-[11px] text-slate-500">{course.isActive ? "Active" : "Inactive"} · {course.status}</p>
                  </div>
                </label>
              );
            })}
            {filteredCourses.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t("dashboard.admin.courses.emptyTitle")}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <MonitorSmartphone className="h-4 w-4" />
              {isRtl ? "أجهزة التجربة" : "Trial devices"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {isRtl
                ? "كل جهاز يأخذ تجربة واحدةواحدة** بساعة فعلية. الإيقاف يقطع الوصول فوراً."
                : "Each device gets one real-time trial clock. Stopping cuts access immediately."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              {counts.active} {isRtl ? "نشطة" : "active"}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-white/10 dark:text-slate-300">
              {counts.expired} {isRtl ? "منتهية" : "expired"}
            </span>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
              {counts.revoked} {isRtl ? "موقوفة" : "stopped"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: isRtl ? "الكل" : "All" },
            { id: "ACTIVE", label: isRtl ? "نشطة" : "Active" },
            { id: "EXPIRED", label: isRtl ? "منتهية" : "Expired" },
            { id: "REVOKED", label: isRtl ? "موقوفة" : "Stopped" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSessionStatus(tab.id);
                setSessionPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                sessionStatus === tab.id
                  ? "bg-[var(--yu-blue-700)] text-white"
                  : "border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={sessionQ}
              onChange={(e) => {
                setSessionQ(e.target.value);
                setSessionPage(1);
              }}
              placeholder={isRtl ? "بحث IP / جهاز / بصمة…" : "Search IP / device / fingerprint…"}
              className={`${inputClass} h-9 ps-9 text-xs`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500 dark:border-white/10">
              <tr>
                <th className="px-2 py-2 font-bold">{isRtl ? "الجهاز" : "Device"}</th>
                <th className="px-2 py-2 font-bold">IP</th>
                <th className="px-2 py-2 font-bold">{isRtl ? "بدأت" : "Started"}</th>
                <th className="px-2 py-2 font-bold">{isRtl ? "تنتهي" : "Expires"}</th>
                <th className="px-2 py-2 font-bold">{isRtl ? "آخر ظهور" : "Last seen"}</th>
                <th className="px-2 py-2 font-bold">{isRtl ? "الحالة" : "Status"}</th>
                <th className="px-2 py-2 font-bold">{isRtl ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-white/5">
                  <td className="px-2 py-3 align-top">
                    <p className="font-semibold text-slate-900 dark:text-white">{row.deviceName || row.os || "Browser"}</p>
                    <p className="text-[11px] text-slate-500">{row.os || "—"} · {row.fingerprintShort}…</p>
                  </td>
                  <td className="px-2 py-3 align-top text-xs text-slate-600 dark:text-slate-300">{row.ipAddress || "—"}</td>
                  <td className="px-2 py-3 align-top text-xs">{formatDate(row.startedAt)}</td>
                  <td className="px-2 py-3 align-top text-xs">{formatDate(row.expiresAt)}</td>
                  <td className="px-2 py-3 align-top text-xs">{formatDate(row.lastSeenAt)}</td>
                  <td className="px-2 py-3 align-top">{statusBadge(row.status, isRtl)}</td>
                  <td className="px-2 py-3 align-top">
                    {row.status === "REVOKED" ? (
                      <button
                        type="button"
                        disabled={restoreSession.isPending}
                        onClick={() => void restoreDevice(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold dark:border-white/10"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {isRtl ? "استعادة" : "Restore"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={revokeSession.isPending || row.status === "EXPIRED"}
                        onClick={() => void stopDevice(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                      >
                        <ShieldOff className="h-3 w-3" />
                        {isRtl ? "إيقاف" : "Stop"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessionsQuery.isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("dashboard.common.loading")}
            </div>
          ) : null}
          {!sessionsQuery.isLoading && sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {isRtl ? "لا توجد أجهزة بعد." : "No devices yet."}
            </p>
          ) : null}
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={sessionPage <= 1}
              onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold disabled:opacity-40 dark:border-white/10"
            >
              {isRtl ? "السابق" : "Prev"}
            </button>
            <span className="text-xs text-slate-500">
              {sessionPage} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={sessionPage >= pagination.totalPages}
              onClick={() => setSessionPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold disabled:opacity-40 dark:border-white/10"
            >
              {isRtl ? "التالي" : "Next"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
