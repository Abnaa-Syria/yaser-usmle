import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FlaskConical, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { usePublicTrialConfig, useStartTrial } from "../../features/trial/hooks";
import useTrialStore from "../../store/trialStore";
import { getErrorMessage } from "../../api/error";

/** Compact CTA for Login / Signup when trial is enabled. */
export default function TrialAuthCta() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const { data: config } = usePublicTrialConfig();
  const startTrial = useStartTrial();
  const trialActive = useTrialStore((s) => {
    if (!s.accessToken || !s.expiresAt || s.status === "REVOKED") return false;
    return new Date(s.expiresAt).getTime() > Date.now();
  });

  if (!config?.enabled) return null;

  const title = isRtl ? config.titleAr || config.title : config.title;
  const subtitle = isRtl ? config.subtitleAr || config.subtitle : config.subtitle;
  const cta = isRtl ? config.ctaLabelAr || config.ctaLabel : config.ctaLabel;

  const onStart = async () => {
    if (trialActive) {
      navigate("/trial");
      return;
    }
    try {
      await startTrial.mutateAsync();
      navigate("/trial");
    } catch (err) {
      toast.error(getErrorMessage(err, t("trial.startFailed", { defaultValue: isRtl ? "تعذر بدء التجربة" : "Could not start trial" })));
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--yu-blue-700)]/20 bg-[var(--yu-blue-700)]/5 px-4 py-4">
      <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[var(--yu-blue-700)]">
        <FlaskConical className="h-3.5 w-3.5" />
        {t("trial.badge", { defaultValue: isRtl ? "تجربة مجانية" : "Free trial" })}
        {config.durationDays ? ` · ${config.durationDays}d` : null}
      </div>
      <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{subtitle}</p>
      <button
        type="button"
        onClick={() => void onStart()}
        disabled={startTrial.isPending}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] text-xs font-black text-white disabled:opacity-60"
      >
        {startTrial.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {trialActive
          ? t("trial.continue", { defaultValue: isRtl ? "متابعة التجربة" : "Continue trial" })
          : cta || t("trial.start", { defaultValue: isRtl ? "ابدأ بدون حساب" : "Try without an account" })}
      </button>
    </div>
  );
}
