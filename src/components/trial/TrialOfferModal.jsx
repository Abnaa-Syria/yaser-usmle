import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FlaskConical, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { usePublicTrialConfig, useStartTrial } from "../../features/trial/hooks";
import useAuthStore from "../../store/authStore";
import useTrialStore, { isTrialDismissedWithinDays, setTrialDismissedNow } from "../../store/trialStore";
import { getErrorMessage } from "../../api/error";

/**
 * Guest free-trial offer modal for logged-out visitors.
 */
export default function TrialOfferModal() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const trialActive = useTrialStore((s) => {
    if (!s.accessToken || !s.expiresAt || s.status === "REVOKED") return false;
    return new Date(s.expiresAt).getTime() > Date.now();
  });
  const trialHydrated = useTrialStore((s) => s.hydrated);
  const { data: config, isLoading } = usePublicTrialConfig();
  const startTrial = useStartTrial();
  const [open, setOpen] = useState(false);

  const onAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/trial") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/student");

  useEffect(() => {
    if (isLoading || !trialHydrated) return;
    if (!config?.enabled || !config?.popupEnabled) return;
    if (isAuthenticated || trialActive || onAuthPage) return;
    if (isTrialDismissedWithinDays(config.dismissDays)) return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [config, isLoading, isAuthenticated, trialActive, trialHydrated, onAuthPage]);

  const dismiss = () => {
    setTrialDismissedNow();
    setOpen(false);
  };

  const start = async () => {
    try {
      await startTrial.mutateAsync();
      setOpen(false);
      navigate("/trial");
    } catch (err) {
      toast.error(getErrorMessage(err, t("trial.startFailed", { defaultValue: isRtl ? "تعذر بدء التجربة" : "Could not start trial" })));
    }
  };

  if (!open) return null;

  const title = isRtl ? config?.titleAr || config?.title : config?.title;
  const subtitle = isRtl ? config?.subtitleAr || config?.subtitle : config?.subtitle;
  const cta = isRtl ? config?.ctaLabelAr || config?.ctaLabel : config?.ctaLabel;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-[#12121A]">
        <button
          type="button"
          onClick={dismiss}
          className="absolute end-3 top-3 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
          aria-label={t("common.close", { defaultValue: "Close" })}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-[var(--yu-blue-700)] to-[#0b2a5a] px-6 pb-8 pt-8 text-white">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider">
            <FlaskConical className="h-3.5 w-3.5" />
            {t("trial.badge", { defaultValue: isRtl ? "تجربة مجانية" : "Free trial" })}
          </div>
          <h2 className="text-2xl font-black leading-snug">{title}</h2>
          <p className="mt-2 text-sm font-medium text-white/85">{subtitle}</p>
          {config?.durationDays ? (
            <p className="mt-3 text-xs font-bold text-cyan-100">
              {t("trial.durationLine", {
                days: config.durationDays,
                defaultValue: isRtl ? `${config.durationDays} أيام بدون حساب` : `${config.durationDays} days · no account needed`,
              })}
            </p>
          ) : null}
        </div>

        <div className="space-y-3 px-6 py-5">
          {(config?.courses || []).slice(0, 3).map((course) => (
            <div key={course.id} className="rounded-xl border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/8 dark:text-slate-200">
              {isRtl ? course.titleAr || course.title : course.title}
            </div>
          ))}
          {(config?.courses || []).length > 3 ? (
            <p className="text-xs font-bold text-slate-400">
              +{(config.courses.length - 3).toLocaleString()} {t("trial.moreCourses", { defaultValue: isRtl ? "كورسات أخرى" : "more courses" })}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void start()}
            disabled={startTrial.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--yu-blue-700)] text-sm font-black text-white disabled:opacity-60"
          >
            {startTrial.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cta || t("trial.start", { defaultValue: isRtl ? "ابدأ التجربة المجانية" : "Start free trial" })}
          </button>
          <button type="button" onClick={dismiss} className="h-10 w-full text-sm font-bold text-slate-500 hover:text-slate-800">
            {t("trial.later", { defaultValue: isRtl ? "لاحقاً" : "Maybe later" })}
          </button>
          <p className="text-center text-[11px] text-slate-400">
            {t("trial.orAccount", { defaultValue: isRtl ? "أو" : "or" })}{" "}
            <Link to="/signup" onClick={dismiss} className="font-bold text-[var(--yu-blue-700)] hover:underline">
              {t("trial.createAccount", { defaultValue: isRtl ? "أنشئ حساباً" : "create an account" })}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
