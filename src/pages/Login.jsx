import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AtSign, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthShell from "../components/auth/AuthShell";
import useAuthStore from "../store/authStore";
import client from "../api/client";
import endpoints from "../api/endpoints";
import {
  getErrorDetails,
  getErrorMessage,
  isDeviceAccessError,
  unwrapResponse,
} from "../api/error";
import { getEnrollmentCheckoutPath, getPostLoginRedirectPath } from "../utils/enrollmentIntent";
import { getDeviceFingerprint, getDeviceMetadata } from "../utils/deviceFingerprint";
import { hasAdminAccess, hasPermission } from "../config/permissions";
import { getFirstAllowedAdminPath } from "../config/navigation";
import { buildWhatsAppUrl } from "../config/siteLinks";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import TrialAuthCta from "../components/trial/TrialAuthCta";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 ps-11 pe-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black text-slate-700">{label}</label>
      {children}
      {error ? <p className="text-[11px] font-bold text-red-600">{error}</p> : null}
    </div>
  );
}

export default function Login() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const Arrow = i18n.dir() === "rtl" ? ArrowLeft : ArrowRight;
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const { settings } = useSiteSettings();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [deviceLimit, setDeviceLimit] = useState(null);
  const [selectedOldDeviceId, setSelectedOldDeviceId] = useState("");
  const [replaceBusy, setReplaceBusy] = useState(false);
  const [replaceMsg, setReplaceMsg] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", remember: false },
  });

  const whatsappUrl = buildWhatsAppUrl(
    settings.phoneNumber,
    isAr
      ? "مرحباً، أحتاج مساعدة في استبدال جهاز الدخول على حسابي في Yaser USMLE (وصلت لحد الجهازين الموثوقين)."
      : "Hello, I need help replacing a trusted login device on my Yaser USMLE account (I reached the 2-device limit)."
  );

  const finishLogin = (user) => {
    const roleName = String(user?.role?.name || user?.role || "").trim().toUpperCase();
    if (hasAdminAccess(user)) {
      navigate(getFirstAllowedAdminPath((perm) => hasPermission(user, perm)), { replace: true });
      return;
    }
    if (roleName === "INSTRUCTOR") {
      navigate("/instructor", { replace: true });
      return;
    }
    const enrollmentCheckout = getEnrollmentCheckoutPath(location.search);
    if (enrollmentCheckout) {
      navigate(enrollmentCheckout, { replace: true });
      return;
    }
    const redirectPath = getPostLoginRedirectPath(location.search);
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
      return;
    }
    navigate("/student", { replace: true });
  };

  const onSubmit = async ({ identifier, password }) => {
    setServerError("");
    setDeviceLimit(null);
    setReplaceMsg("");
    try {
      const deviceFingerprint = await getDeviceFingerprint();
      const meta = getDeviceMetadata();
      const user = await login({
        identifier,
        password,
        deviceFingerprint,
        deviceName: meta.deviceName,
        os: meta.os,
        userAgent: meta.userAgent,
      });
      finishLogin(user);
    } catch (err) {
      const details = getErrorDetails(err);
      if (isDeviceAccessError(err)) {
        const devices = Array.isArray(details?.devices) ? details.devices : [];
        setDeviceLimit({
          ...(details && typeof details === "object" ? details : {}),
          devices,
        });
        setSelectedOldDeviceId(devices[0]?.id || "");
        setServerError(
          t("auth.login.deviceLimit", {
            defaultValue: isAr
              ? "وصلت لحد جهازين موثوقين. اختر جهازاً لإزالته واطلب إضافة هذا الجهاز، أو تواصل معنا عبر واتساب."
              : "You reached the 2-device limit. Choose a device to remove and request adding this one, or contact us on WhatsApp.",
          })
        );
        return;
      }
      setServerError(getErrorMessage(err, t("auth.errors.loginFailed")));
    }
  };

  const submitReplacement = async () => {
    if (!selectedOldDeviceId) return;
    setReplaceBusy(true);
    setReplaceMsg("");
    try {
      const { identifier, password } = getValues();
      const deviceFingerprint = await getDeviceFingerprint();
      const meta = getDeviceMetadata();
      const res = await client.post(endpoints.auth.deviceReplacementRequest, {
        identifier,
        password,
        oldDeviceId: selectedOldDeviceId,
        deviceFingerprint,
        deviceName: meta.deviceName,
        os: meta.os,
      });
      const data = unwrapResponse(res);
      setReplaceMsg(
        data?.alreadyPending
          ? t("auth.login.replacePending", {
              defaultValue: isAr ? "لديك طلب قيد المراجعة بالفعل." : "You already have a pending request.",
            })
          : t("auth.login.replaceSubmitted", {
              defaultValue: isAr
                ? "تم إرسال الطلب. سجّل الدخول بعد موافقة الإدارة، أو تواصل معنا عبر واتساب لتسريع الحل."
                : "Request submitted. Log in again after admin approval, or contact us on WhatsApp to speed things up.",
            })
      );
      if (data?.id) {
        setDeviceLimit((prev) => (prev ? { ...prev, pendingRequestId: data.id } : prev));
      }
    } catch (err) {
      setReplaceMsg(getErrorMessage(err, t("auth.errors.loginFailed")));
    } finally {
      setReplaceBusy(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t("auth.login.noAccount")}{" "}
          <Link to={`/signup${location.search}`} className="font-black text-blue-700 hover:underline">
            {t("auth.login.signUpLink")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <TrialAuthCta />
        {serverError ? (
          <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
            {serverError}
          </div>
        ) : null}

        {deviceLimit ? (
          <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
            <div>
              <p className="flex items-center gap-2 text-sm font-black text-amber-950 dark:text-amber-100">
                <Smartphone className="h-4 w-4 shrink-0" />
                {t("auth.login.trustedDevices", {
                  defaultValue: isAr ? "استبدال جهاز موثوق" : "Replace a trusted device",
                })}
              </p>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-amber-900/80 dark:text-amber-100/80">
                {isAr
                  ? "اختر الجهاز الذي تريد حذفه من الحساب، ثم اطلب إضافة الجهاز الحالي. بعد موافقة الإدارة يمكنك تسجيل الدخول."
                  : "Pick the device to remove from your account, then request adding this device. After admin approval you can sign in."}
              </p>
            </div>

            {deviceLimit.devices?.length ? (
              <div className="space-y-2">
                {deviceLimit.devices.map((d) => (
                  <label
                    key={d.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-xs transition ${
                      selectedOldDeviceId === d.id
                        ? "border-blue-500 bg-white shadow-sm dark:border-blue-400 dark:bg-[#0F0F13]"
                        : "border-amber-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="oldDevice"
                      checked={selectedOldDeviceId === d.id}
                      onChange={() => setSelectedOldDeviceId(d.id)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-bold text-slate-900 dark:text-white">
                        {d.deviceName || d.os || d.fingerprintShort}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {d.os ? `${d.os} · ` : ""}
                        {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-amber-300 px-3 py-3 text-[11px] font-semibold text-amber-900 dark:border-amber-500/40 dark:text-amber-100">
                {isAr
                  ? "تعذّر تحميل قائمة الأجهزة. استخدم واتساب للتواصل مع الدعم."
                  : "Could not load trusted devices. Contact support on WhatsApp."}
              </p>
            )}

            <button
              type="button"
              disabled={replaceBusy || !selectedOldDeviceId}
              onClick={() => void submitReplacement()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-700 text-xs font-black text-white transition hover:bg-amber-800 disabled:opacity-60"
            >
              {replaceBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              {t("auth.login.requestReplace", {
                defaultValue: isAr
                  ? "اطلب حذف الجهاز المحدد وإضافة هذا الجهاز"
                  : "Request removing selected device and adding this one",
              })}
            </button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-xs font-black text-white transition hover:bg-[#1ebe57]"
              >
                <MessageCircle className="h-4 w-4" />
                {t("auth.login.whatsappHelp", {
                  defaultValue: isAr ? "تواصل معنا عبر واتساب لحل مشكلتك" : "Contact us on WhatsApp to solve this",
                })}
              </a>
            ) : (
              <p className="text-center text-[11px] font-semibold text-amber-900/70 dark:text-amber-100/70">
                {isAr
                  ? "رقم واتساب الدعم غير مضبوط حالياً — راجع إعدادات الموقع أو صفحة تواصل معنا."
                  : "Support WhatsApp number is not configured yet — set it in site settings."}
              </p>
            )}

            {replaceMsg ? <p className="text-[11px] font-bold text-amber-950 dark:text-amber-100">{replaceMsg}</p> : null}
            {deviceLimit.pendingRequestId ? (
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {t("auth.login.pendingId", {
                  defaultValue: isAr
                    ? `طلب معلّق قيد المراجعة: ${String(deviceLimit.pendingRequestId).slice(0, 8)}…`
                    : `Pending request under review: ${String(deviceLimit.pendingRequestId).slice(0, 8)}…`,
                  id: deviceLimit.pendingRequestId,
                })}
              </p>
            ) : null}
          </div>
        ) : null}

        <Field
          label={t("auth.login.identifierLabel", { defaultValue: isAr ? "البريد أو اسم المستخدم" : "Email or username" })}
          error={
            errors.identifier
              ? t("auth.login.identifierRequired", {
                  defaultValue: isAr ? "البريد أو اسم المستخدم مطلوب" : "Email or username is required",
                })
              : ""
          }
        >
          <div className="relative">
            <AtSign className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoComplete="username"
              placeholder={t("auth.login.identifierPlaceholder", {
                defaultValue: isAr ? "email@example.com أو username" : "email@example.com or username",
              })}
              className={`${inputClass} ${errors.identifier ? "border-red-400" : ""}`}
              {...register("identifier")}
            />
          </div>
        </Field>

        <Field label={t("auth.login.passwordLabel")} error={errors.password ? t("auth.login.passwordRequired") : ""}>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("auth.login.passwordPlaceholder")}
              className={`${inputClass} pe-11 ${errors.password ? "border-red-400" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              tabIndex={-1}
              aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
            <input type="checkbox" className="h-4 w-4 rounded accent-blue-700" {...register("remember")} />
            {t("auth.login.rememberMe")}
          </label>
          <Link to="/forgot-password" className="text-xs font-black text-blue-700 hover:underline">
            {t("auth.login.forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#071a38] text-sm font-black text-white shadow-[0_12px_28px_rgba(7,26,56,.2)] transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t("auth.login.submit")}
          {!isSubmitting ? <Arrow className="h-4 w-4" /> : null}
        </button>
        <p className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          {t("auth.login.securityNote")}
        </p>
      </form>
    </AuthShell>
  );
}
