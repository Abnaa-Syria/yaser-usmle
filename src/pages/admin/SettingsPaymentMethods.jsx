import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { CreditCard, ImageUp, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminSettings, useUpdateAdminSettings } from "../../features/admin/settings/hooks";
import { uploadPaymentMethodAsset } from "../../features/admin/settings/api";
import { getErrorMessage } from "../../api/error";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import {
  DEFAULT_PAYMENT_METHODS_CONFIG,
  PAYMENT_METHODS_CONFIG_KEY,
  normalizePaymentMethodsConfig,
} from "../../utils/paymentMethodsConfig";

function emptyMethod() {
  return {
    id: `METHOD_${Date.now()}`,
    type: "manual",
    enabled: true,
    titleAr: "",
    titleEn: "",
    shortAr: "",
    shortEn: "",
    instructionsAr: "",
    instructionsEn: "",
    details: [],
    warningsAr: [],
    warningsEn: [],
    stepsAr: [],
    stepsEn: [],
    qrImageUrl: "",
    externalUrl: "",
    externalButtonLabelAr: "الدفع بالبطاقة البنكية",
    externalButtonLabelEn: "Pay by bank card",
  };
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#1E293B] dark:text-white";
const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#1E293B] dark:text-white";

export default function SettingsPaymentMethods() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const { data, isLoading, isError, error, refetch } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();
  const [config, setConfig] = useState(() => structuredClone(DEFAULT_PAYMENT_METHODS_CONFIG));
  const [activeCountryId, setActiveCountryId] = useState("EG");
  const [uploadingKey, setUploadingKey] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (data === undefined) return;
    const rows = Array.isArray(data) ? data : [];
    const row = rows.find((s) => s.key === PAYMENT_METHODS_CONFIG_KEY);
    const next = normalizePaymentMethodsConfig(row?.value ?? DEFAULT_PAYMENT_METHODS_CONFIG);
    setConfig(next);
    setActiveCountryId((prev) => next.countries.find((c) => c.id === prev)?.id || next.countries[0]?.id || "EG");
    setHydrated(true);
  }, [data]);

  const activeCountry = config.countries.find((c) => c.id === activeCountryId) || config.countries[0];

  const updateCountry = (countryId, updater) => {
    setConfig((prev) => ({
      ...prev,
      countries: prev.countries.map((country) => (country.id === countryId ? updater(country) : country)),
    }));
  };

  const updateMethod = (countryId, methodIndex, patch) => {
    updateCountry(countryId, (country) => ({
      ...country,
      methods: country.methods.map((method, idx) => (idx === methodIndex ? { ...method, ...patch } : method)),
    }));
  };

  const handleSave = () => {
    const payload = {
      [PAYMENT_METHODS_CONFIG_KEY]: normalizePaymentMethodsConfig(config),
    };
    updateMutation.mutate(payload, {
      onSuccess: () => toast.success(isRtl ? "تم حفظ طرق الدفع" : "Payment methods saved"),
      onError: (e) => toast.error(getErrorMessage(e, isRtl ? "تعذّر الحفظ" : "Save failed")),
    });
  };

  const handleResetDefaults = () => {
    setConfig(structuredClone(DEFAULT_PAYMENT_METHODS_CONFIG));
    setActiveCountryId("EG");
    toast.success(isRtl ? "تمت استعادة القيم الافتراضية — احفظ لتطبيقها" : "Defaults restored — save to apply");
  };

  const handleUploadQr = async (countryId, methodIndex, file) => {
    if (!file) return;
    const key = `${countryId}-${methodIndex}`;
    setUploadingKey(key);
    try {
      const uploaded = await uploadPaymentMethodAsset(file);
      if (!uploaded?.url) throw new Error("No URL");
      updateMethod(countryId, methodIndex, { qrImageUrl: uploaded.url });
      toast.success(isRtl ? "تم رفع صورة QR" : "QR image uploaded");
    } catch (e) {
      toast.error(getErrorMessage(e, isRtl ? "فشل رفع الصورة" : "Upload failed"));
    } finally {
      setUploadingKey("");
    }
  };

  if (isLoading || !hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {getErrorMessage(error, "Failed to load settings")}
        <button type="button" className="ms-3 font-bold underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-5xl space-y-6 pb-12">
      <PageHeader
        title={t("sidebarNav.items.paymentMethods", { defaultValue: isRtl ? "طرق الدفع" : "Payment methods" })}
        subtitle={
          isRtl
            ? "عدّل الدول وطرق الدفع والنصوص وروابط Stripe وصور QR — تظهر فورًا في صفحة الدفع."
            : "Edit countries, methods, copy, Stripe links, and QR images — shown live on checkout."
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--yu-blue-600)] disabled:opacity-60"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isRtl ? "حفظ" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200"
        >
          <RotateCcw className="h-4 w-4" />
          {isRtl ? "استعادة الافتراضي" : "Reset defaults"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {config.countries.map((country) => (
          <button
            key={country.id}
            type="button"
            onClick={() => setActiveCountryId(country.id)}
            className={[
              "rounded-xl border px-3 py-2 text-sm font-bold transition",
              country.id === activeCountry?.id
                ? "border-[var(--yu-blue-400)] bg-[var(--yu-blue-50)] text-[var(--yu-blue-800)] dark:bg-[var(--yu-blue-700)]/20 dark:text-white"
                : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300",
            ].join(" ")}
          >
            {isRtl ? country.labelAr : country.labelEn} ({country.id})
          </button>
        ))}
      </div>

      {activeCountry ? (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1E293B]">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={isRtl ? "الاسم بالعربية" : "Arabic label"}>
              <input
                className={inputClass}
                value={activeCountry.labelAr}
                onChange={(e) => updateCountry(activeCountry.id, (c) => ({ ...c, labelAr: e.target.value }))}
              />
            </Field>
            <Field label={isRtl ? "الاسم بالإنجليزية" : "English label"}>
              <input
                className={inputClass}
                value={activeCountry.labelEn}
                onChange={(e) => updateCountry(activeCountry.id, (c) => ({ ...c, labelEn: e.target.value }))}
              />
            </Field>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={activeCountry.enabled !== false}
                  onChange={(e) => updateCountry(activeCountry.id, (c) => ({ ...c, enabled: e.target.checked }))}
                />
                {isRtl ? "مفعّلة" : "Enabled"}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {activeCountry.methods.map((method, methodIndex) => {
              const uploadKey = `${activeCountry.id}-${methodIndex}`;
              return (
                <article
                  key={`${method.id}-${methodIndex}`}
                  className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                      <CreditCard className="h-4 w-4" />
                      {method.id}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={method.enabled !== false}
                          onChange={(e) => updateMethod(activeCountry.id, methodIndex, { enabled: e.target.checked })}
                        />
                        {isRtl ? "مفعّلة" : "Enabled"}
                      </label>
                      <select
                        className={inputClass}
                        value={method.type}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { type: e.target.value })}
                      >
                        <option value="manual">{isRtl ? "تحويل يدوي" : "Manual"}</option>
                        <option value="external">{isRtl ? "رابط خارجي (Stripe)" : "External (Stripe)"}</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          updateCountry(activeCountry.id, (c) => ({
                            ...c,
                            methods: c.methods.filter((_, idx) => idx !== methodIndex),
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1.5 text-xs font-bold text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isRtl ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="ID">
                      <input
                        className={inputClass}
                        value={method.id}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { id: e.target.value.trim() })}
                      />
                    </Field>
                    <Field label={isRtl ? "عنوان AR" : "Title AR"}>
                      <input
                        className={inputClass}
                        value={method.titleAr}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { titleAr: e.target.value })}
                      />
                    </Field>
                    <Field label={isRtl ? "عنوان EN" : "Title EN"}>
                      <input
                        className={inputClass}
                        value={method.titleEn}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { titleEn: e.target.value })}
                      />
                    </Field>
                    <Field label={isRtl ? "وصف قصير AR" : "Short AR"}>
                      <input
                        className={inputClass}
                        value={method.shortAr}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { shortAr: e.target.value })}
                      />
                    </Field>
                    <Field label={isRtl ? "وصف قصير EN" : "Short EN"}>
                      <input
                        className={inputClass}
                        value={method.shortEn}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { shortEn: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={isRtl ? "التعليمات AR" : "Instructions AR"}>
                      <textarea
                        className={textareaClass}
                        value={method.instructionsAr}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { instructionsAr: e.target.value })}
                      />
                    </Field>
                    <Field label={isRtl ? "التعليمات EN" : "Instructions EN"}>
                      <textarea
                        className={textareaClass}
                        value={method.instructionsEn}
                        onChange={(e) => updateMethod(activeCountry.id, methodIndex, { instructionsEn: e.target.value })}
                      />
                    </Field>
                  </div>

                  <Field label={isRtl ? "التفاصيل (سطر لكل: تسميةAR|تسميةEN|القيمة)" : "Details (one per line: labelAR|labelEN|value)"}>
                    <textarea
                      className={textareaClass}
                      value={(method.details || [])
                        .map((d) => `${d.labelAr || ""}|${d.labelEn || ""}|${d.value || ""}`)
                        .join("\n")}
                      onChange={(e) => {
                        const details = e.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .map((line) => {
                            const [labelAr = "", labelEn = "", ...rest] = line.split("|");
                            return { labelAr: labelAr.trim(), labelEn: labelEn.trim(), value: rest.join("|").trim() };
                          });
                        updateMethod(activeCountry.id, methodIndex, { details });
                      }}
                    />
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={isRtl ? "تحذيرات AR (سطر لكل تحذير)" : "Warnings AR (one per line)"}>
                      <textarea
                        className={textareaClass}
                        value={(method.warningsAr || []).join("\n")}
                        onChange={(e) =>
                          updateMethod(activeCountry.id, methodIndex, {
                            warningsAr: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    </Field>
                    <Field label={isRtl ? "تحذيرات EN" : "Warnings EN"}>
                      <textarea
                        className={textareaClass}
                        value={(method.warningsEn || []).join("\n")}
                        onChange={(e) =>
                          updateMethod(activeCountry.id, methodIndex, {
                            warningsEn: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    </Field>
                    <Field label={isRtl ? "خطوات AR" : "Steps AR"}>
                      <textarea
                        className={textareaClass}
                        value={(method.stepsAr || []).join("\n")}
                        onChange={(e) =>
                          updateMethod(activeCountry.id, methodIndex, {
                            stepsAr: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    </Field>
                    <Field label={isRtl ? "خطوات EN" : "Steps EN"}>
                      <textarea
                        className={textareaClass}
                        value={(method.stepsEn || []).join("\n")}
                        onChange={(e) =>
                          updateMethod(activeCountry.id, methodIndex, {
                            stepsEn: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    </Field>
                  </div>

                  {method.type === "external" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Stripe / external URL">
                        <input
                          className={inputClass}
                          value={method.externalUrl}
                          onChange={(e) => updateMethod(activeCountry.id, methodIndex, { externalUrl: e.target.value })}
                        />
                      </Field>
                      <Field label={isRtl ? "نص الزر AR" : "Button label AR"}>
                        <input
                          className={inputClass}
                          value={method.externalButtonLabelAr}
                          onChange={(e) =>
                            updateMethod(activeCountry.id, methodIndex, { externalButtonLabelAr: e.target.value })
                          }
                        />
                      </Field>
                      <Field label={isRtl ? "نص الزر EN" : "Button label EN"}>
                        <input
                          className={inputClass}
                          value={method.externalButtonLabelEn}
                          onChange={(e) =>
                            updateMethod(activeCountry.id, methodIndex, { externalButtonLabelEn: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-white/15">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {isRtl ? "صورة QR (اختياري)" : "QR image (optional)"}
                      </p>
                      {method.qrImageUrl ? (
                        <img
                          src={resolveMediaUrl(method.qrImageUrl)}
                          alt=""
                          className="h-40 w-40 rounded-xl object-contain bg-slate-50 dark:bg-[#0C1829]"
                        />
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--yu-blue-700)] px-3 py-2 text-xs font-bold text-white">
                          {uploadingKey === uploadKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}
                          {isRtl ? "رفع صورة" : "Upload image"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="sr-only"
                            disabled={uploadingKey === uploadKey}
                            onChange={(e) => void handleUploadQr(activeCountry.id, methodIndex, e.target.files?.[0])}
                          />
                        </label>
                        <input
                          className={`${inputClass} max-w-md`}
                          placeholder="/uploads/payment-methods/..."
                          value={method.qrImageUrl}
                          onChange={(e) => updateMethod(activeCountry.id, methodIndex, { qrImageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              updateCountry(activeCountry.id, (c) => ({
                ...c,
                methods: [...c.methods, emptyMethod()],
              }))
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200"
          >
            <Plus className="h-4 w-4" />
            {isRtl ? "إضافة طريقة دفع" : "Add payment method"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
