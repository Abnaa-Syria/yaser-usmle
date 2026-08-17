import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Check,
  CreditCard,
  Globe2,
  Receipt,
  Smartphone,
  Store,
} from "lucide-react";
import { StudentSurface } from "../student/ui";
import {
  DEFAULT_PAYMENT_COUNTRY,
  PAYMENT_COUNTRIES,
  getDefaultMethodForCountry,
  getMethodsForCountry,
} from "../../features/student/financials/paymentMethods";

const METHOD_ICONS = {
  VODAFONE_CASH: Smartphone,
  INSTAPAY: Smartphone,
  CARD: CreditCard,
  SARAFA: Store,
  AL_HARAM: Building2,
  FAWATEER: Receipt,
};

const METHOD_TONES = {
  VODAFONE_CASH: "from-red-500/15 to-red-400/5 text-red-700 dark:text-red-300",
  INSTAPAY: "from-violet-500/15 to-violet-400/5 text-violet-700 dark:text-violet-300",
  CARD: "from-[var(--yu-blue-700)]/15 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-300)]",
  SARAFA: "from-amber-500/15 to-amber-400/5 text-amber-700 dark:text-amber-300",
  AL_HARAM: "from-emerald-500/15 to-emerald-400/5 text-emerald-700 dark:text-emerald-300",
  FAWATEER: "from-teal-500/15 to-teal-400/5 text-teal-700 dark:text-teal-300",
};

const COUNTRY_FLAGS = {
  EG: "🇪🇬",
  IQ: "🇮🇶",
  SY: "🇸🇾",
  OTHER: "🌍",
};

export default function CheckoutPaymentSection({
  paymentCountry,
  onPaymentCountryChange,
  paymentMethod,
  onPaymentMethodChange,
  courseInstructions,
}) {
  const { t } = useTranslation();
  const country = paymentCountry || DEFAULT_PAYMENT_COUNTRY;
  const methods = getMethodsForCountry(country);
  const selectedMethod = methods.includes(paymentMethod) ? paymentMethod : getDefaultMethodForCountry(country);

  useEffect(() => {
    if (!methods.includes(paymentMethod)) {
      onPaymentMethodChange(getDefaultMethodForCountry(country));
    }
  }, [country, methods, paymentMethod, onPaymentMethodChange]);

  const MethodIcon = METHOD_ICONS[selectedMethod] || CreditCard;
  const methodTone = METHOD_TONES[selectedMethod] || METHOD_TONES.CARD;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {t("checkout.regional.countryLabel")}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
          {t("checkout.regional.countryHint")}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PAYMENT_COUNTRIES.map((entry) => {
            const active = entry.id === country;
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
                <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">
                  {t(`checkout.regional.countries.${entry.id}`)}
                </p>
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
              <p className="mt-0.5 text-base font-black text-slate-900 dark:text-white">
                {t(`checkout.regional.methods.${selectedMethod}.title`)}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {methods.map((methodId) => {
              const Icon = METHOD_ICONS[methodId] || CreditCard;
              const active = methodId === selectedMethod;
              const tone = METHOD_TONES[methodId] || METHOD_TONES.CARD;
              return (
                <button
                  key={methodId}
                  type="button"
                  onClick={() => onPaymentMethodChange(methodId)}
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
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">
                      {t(`checkout.regional.methods.${methodId}.title`)}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {t(`checkout.regional.methods.${methodId}.short`)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-[#0C1829]/70">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t("checkout.regional.instructionsTitle")}
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-200">
              {t(`checkout.regional.methods.${selectedMethod}.instructions`)}
            </p>
          </div>

          {courseInstructions?.instructions ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-500/10">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                {courseInstructions.methodLabel || t("checkout.regional.courseNoteTitle")}
              </p>
              <p className="mt-1 text-sm font-medium text-amber-900 dark:text-amber-200">
                {courseInstructions.instructions}
              </p>
              {courseInstructions.destinationUrl ? (
                <a
                  href={courseInstructions.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--yu-blue-700)] hover:underline dark:text-[var(--yu-blue-400)]"
                >
                  <Globe2 className="h-4 w-4" />
                  {t("checkout.openPaymentDestination", { defaultValue: "Open payment destination" })}
                </a>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("checkout.regional.proofReminder")}
          </p>
        </div>
      </StudentSurface>
    </div>
  );
}
