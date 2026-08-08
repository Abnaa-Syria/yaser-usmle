import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";

/**
 * Honest integrations status page — no fake Stripe/Mailchimp save forms.
 * Real integrations are configured via environment variables on the server.
 */
export default function SettingsIntegrations() {
  const { t } = useTranslation();

  const items = [
    {
      name: t("adminPages.integrations.smtpName", { defaultValue: "SMTP Email" }),
      env: "SMTP_HOST / SMTP_USER / SMTP_PASS",
      note: t("adminPages.integrations.smtpNote", {
        defaultValue: "Required for password reset, OTP, and template test sends",
      }),
    },
    {
      name: t("adminPages.integrations.manualName", { defaultValue: "Manual payments" }),
      env: "MANUAL_PAYMENT_*",
      note: t("adminPages.integrations.manualNote", {
        defaultValue: "Bank-transfer instructions shown at checkout — no card gateway in current scope",
      }),
    },
    {
      name: t("adminPages.integrations.webhooksName", { defaultValue: "Payment webhooks" }),
      env: "WEBHOOKS_ENABLED / WEBHOOK_SECRET",
      note: t("adminPages.integrations.webhooksNote", {
        defaultValue: "Disabled by default; requires HMAC signature when enabled",
      }),
    },
    {
      name: t("adminPages.integrations.vdocipherName", { defaultValue: "VdoCipher" }),
      env: "VDOCIPHER_API_SECRET",
      note: t("adminPages.integrations.vdocipherNote", {
        defaultValue: "Secure course video playback — paste Video IDs on lessons; OTP is issued by the backend after purchase check",
      }),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.integrations.title", { defaultValue: "Integrations" })}
        subtitle={t("adminPages.integrations.subtitle", {
          defaultValue: "Configured via server environment variables — no fake UI saves",
        })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <article
            key={it.env}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{it.name}</h3>
            <p className="mt-2 font-mono text-xs text-[var(--yu-blue-700)]">{it.env}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{it.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
