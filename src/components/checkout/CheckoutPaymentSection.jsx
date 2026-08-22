import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Building2,
  Check,
  CreditCard,
  ExternalLink,
  QrCode,
  Receipt,
  Smartphone,
  Store,
} from "lucide-react";
import { StudentSurface } from "../student/ui";
import { useSiteSettings } from "../../features/public/siteSettings/hooks";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import {
  DEFAULT_PAYMENT_COUNTRY,
  getCountryById,
  getDefaultMethodForCountry,
  getEnabledCountries,
  getEnabledMethods,
  isExternalMethod,
  normalizePaymentMethodsConfig,
} from "../../utils/paymentMethodsConfig";

const METHOD_ICONS = {
  VODAFONE_CASH: Smartphone,
  INSTAPAY: Smartphone,
  INSTAPAY_1: Smartphone,
  INSTAPAY_2: Smartphone,
  CARD: CreditCard,
  SARAFA: Store,
  SARAFA_VODAFONE: Store,
  SUPERQI: QrCode,
  AL_HARAM: Building2,
  AL_HARAM_FOUAD: Building2,
  FAWATEER: Receipt,
};

const METHOD_TONES = {
  VODAFONE_CASH: "from-red-500/15 to-red-400/5 text-red-700 dark:text-red-300",
  INSTAPAY: "from-violet-500/15 to-violet-400/5 text-violet-700 dark:text-violet-300",
  INSTAPAY_1: "from-violet-500/15 to-violet-400/5 text-violet-700 dark:text-violet-300",
  INSTAPAY_2: "from-violet-500/15 to-violet-400/5 text-violet-700 dark:text-violet-300",
  CARD: "from-[var(--yu-blue-700)]/15 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-300)]",
  SARAFA: "from-amber-500/15 to-amber-400/5 text-amber-700 dark:text-amber-300",
  SARAFA_VODAFONE: "from-amber-500/15 to-amber-400/5 text-amber-700 dark:text-amber-300",
  SUPERQI: "from-emerald-500/15 to-emerald-400/5 text-emerald-700 dark:text-emerald-300",
  AL_HARAM: "from-emerald-500/15 to-emerald-400/5 text-emerald-700 dark:text-emerald-300",
  AL_HARAM_FOUAD: "from-emerald-500/15 to-emerald-400/5 text-emerald-700 dark:text-emerald-300",
  FAWATEER: "from-teal-500/15 to-teal-400/5 text-teal-700 dark:text-teal-300",
};

const COUNTRY_FLAGS = {
  EG: "🇪🇬",
  IQ: "🇮🇶",
  SY: "🇸🇾",
  JO: "🇯🇴",
  OTHER: "🌍",
};

function pickLocalized(isRtl, ar, en) {
  return isRtl ? ar || en : en || ar;
}

export default function CheckoutPaymentSection({
  paymentCountry,
  onPaymentCountryChange,
  paymentMethod,
  onPaymentMethodChange,
  onSelectedMethodChange,
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const { settings } = useSiteSettings();
  const config = useMemo(
    () => normalizePaymentMethodsConfig(settings?.paymentMethods),
    [settings?.paymentMethods]
  );
  const countries = useMemo(() => getEnabledCountries(config), [config]);
  const countryId = countries.some((c) => c.id === paymentCountry)
    ? paymentCountry
    : countries[0]?.id || DEFAULT_PAYMENT_COUNTRY;
  const country = getCountryById(config, countryId);
  const methods = getEnabledMethods(country);
  const selectedMethod =
    methods.find((m) => m.id === paymentMethod) || getDefaultMethodForCountry(config, countryId);

  useEffect(() => {
    if (countryId !== paymentCountry) {
      onPaymentCountryChange(countryId);
    }
  }, [countryId, paymentCountry, onPaymentCountryChange]);

  useEffect(() => {
    if (!selectedMethod) return;
    if (selectedMethod.id !== paymentMethod) {
      onPaymentMethodChange(selectedMethod.id);
    }
    onSelectedMethodChange?.(selectedMethod);
  }, [selectedMethod, paymentMethod, onPaymentMethodChange, onSelectedMethodChange]);

  if (!selectedMethod) {
    return (
      <StudentSurface>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t("checkout.regional.noMethods", { defaultValue: "No payment methods configured." })}
        </p>
      </StudentSurface>
    );
  }

  const MethodIcon = METHOD_ICONS[selectedMethod.id] || (isExternalMethod(selectedMethod) ? CreditCard : Smartphone);
  const methodTone = METHOD_TONES[selectedMethod.id] || METHOD_TONES.CARD;
  const title = pickLocalized(isRtl, selectedMethod.titleAr, selectedMethod.titleEn);
  const short = pickLocalized(isRtl, selectedMethod.shortAr, selectedMethod.shortEn);
  const instructions = pickLocalized(isRtl, selectedMethod.instructionsAr, selectedMethod.instructionsEn);
  const warnings = isRtl ? selectedMethod.warningsAr : selectedMethod.warningsEn;
  const steps = isRtl ? selectedMethod.stepsAr : selectedMethod.stepsEn;
  const externalLabel = pickLocalized(
    isRtl,
    selectedMethod.externalButtonLabelAr,
    selectedMethod.externalButtonLabelEn
  );
  const qrUrl = selectedMethod.qrImageUrl ? resolveMediaUrl(selectedMethod.qrImageUrl) : "";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {t("checkout.regional.countryLabel")}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
          {t("checkout.regional.countryHint")}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {countries.map((entry) => {
            const active = entry.id === countryId;
            const label = pickLocalized(isRtl, entry.labelAr, entry.labelEn);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onPaymentCountryChange(entry.id)}
                className={[
                  "group relative overflow-hidden rounded-2xl border px-3 py-3 text-start transition",
                  active
                    ? "border-[var(--yu-blue-400)] bg-gradient-to-br from-[var(--yu-blue-50)] to-white shadow-[var(--shadow-sm)] dark:border-[var(--yu-blue-500)]/60 dark:from-[var(--yu-blue-700)]/20 dark:to-[#0C1829]"
                    : "border-slate-200/90 bg-white/80 hover:border-[var(--yu-blue-200)] dark:border-white/10 dark:bg-white/5 dark:hover:border-[var(--yu-blue-700)]/40",
                ].join(" ")}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {COUNTRY_FLAGS[entry.id] || COUNTRY_FLAGS.OTHER}
                </span>
                <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{label}</p>
                {active ? (
                  <span className="absolute end-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--yu-blue-700)] text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <StudentSurface className="relative overflow-hidden border-[var(--yu-blue-200)]/60 bg-gradient-to-br from-[var(--yu-blue-50)]/70 via-white to-slate-50/80 dark:border-[var(--yu-blue-800)]/40 dark:from-[var(--yu-blue-700)]/10 dark:via-[#0F1E38] dark:to-[#0C1829]/80">
        <div className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-[var(--yu-blue-500)]/10 blur-3xl" aria-hidden />
        <div className="relative space-y-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${methodTone}`}>
              <MethodIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t("checkout.regional.methodsTitle")}
              </p>
              <p className="mt-0.5 text-base font-black text-slate-900 dark:text-white">{title}</p>
              {short ? <p className="mt-0.5 text-xs font-medium text-slate-500">{short}</p> : null}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {methods.map((method) => {
              const Icon = METHOD_ICONS[method.id] || (isExternalMethod(method) ? CreditCard : Smartphone);
              const active = method.id === selectedMethod.id;
              const tone = METHOD_TONES[method.id] || METHOD_TONES.CARD;
              const methodTitle = pickLocalized(isRtl, method.titleAr, method.titleEn);
              const methodShort = pickLocalized(isRtl, method.shortAr, method.shortEn);
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onPaymentMethodChange(method.id)}
                  className={[
                    "flex items-center gap-3 rounded-xl border px-3 py-3 text-start transition",
                    active
                      ? "border-[var(--yu-blue-400)] bg-white shadow-[var(--shadow-sm)] dark:border-[var(--yu-blue-500)]/50 dark:bg-[#0C1829]"
                      : "border-slate-200/80 bg-white/70 hover:border-[var(--yu-blue-200)] dark:border-white/10 dark:bg-white/5",
                  ].join(" ")}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{methodTitle}</span>
                    {methodShort ? (
                      <span className="mt-0.5 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {methodShort}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-[#0C1829]/70">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t("checkout.regional.instructionsTitle")}
            </p>
            {instructions ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-200">
                {instructions}
              </p>
            ) : null}

            {selectedMethod.details?.length ? (
              <dl className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-white/10">
                {selectedMethod.details.map((detail, idx) => (
                  <div key={`${detail.labelEn}-${idx}`} className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="text-xs font-bold text-slate-500">
                      {pickLocalized(isRtl, detail.labelAr, detail.labelEn)}
                    </dt>
                    <dd className="font-mono text-sm font-black text-slate-900 dark:text-white">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          {qrUrl ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0C1829]/70">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t("checkout.regional.qrTitle", { defaultValue: isRtl ? "رمز الدفع QR" : "Payment QR code" })}
              </p>
              <img
                src={qrUrl}
                alt={t("checkout.regional.qrAlt", { defaultValue: "SuperQi QR" })}
                className="h-56 w-56 rounded-2xl object-contain shadow-sm"
              />
            </div>
          ) : null}

          {warnings?.length ? (
            <div className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-500/10">
              {warnings.map((warning) => (
                <p key={warning} className="flex items-start gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{warning}</span>
                </p>
              ))}
            </div>
          ) : null}

          {steps?.length ? (
            <ol className="space-y-2 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-[#0C1829]/70">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--yu-blue-700)] text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {isExternalMethod(selectedMethod) ? (
            <a
              href={selectedMethod.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
            >
              <ExternalLink className="h-4 w-4" />
              {externalLabel || t("checkout.regional.payByCard", { defaultValue: "Pay by bank card" })}
            </a>
          ) : null}

          <p className="text-base font-semibold leading-relaxed text-slate-800 dark:text-slate-100">
            {isExternalMethod(selectedMethod)
              ? t("checkout.regional.cardProofReminder", {
                  defaultValue: isRtl
                    ? "بعد الدفع عبر الرابط، أدخل بياناتك وبريد Stripe وارفع فاتورة الدفع ثم أرسل طلب التفعيل."
                    : "After paying via the link, enter your details and Stripe email, upload the invoice, then submit activation.",
                })
              : t("checkout.regional.proofReminder")}
          </p>
        </div>
      </StudentSurface>
    </div>
  );
}
