import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthShell from "../components/auth/AuthShell";
import useAuthStore from "../store/authStore";
import { getErrorMessage } from "../api/error";
import { getEnrollmentCheckoutPath } from "../utils/enrollmentIntent";
import TrialAuthCta from "../components/trial/TrialAuthCta";

const signupSchema = z
  .object({
    fullName: z.string().min(3).max(100),
    email: z.string().min(1).email(),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/).or(z.literal("")).optional(),
    acceptedTerms: z.boolean().refine(Boolean),
    password: z
      .string()
      .min(8)
      .regex(/[a-zA-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 ps-11 pe-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black text-slate-700">{label}</label>
      {children}
      {hint && !error ? <p className="text-[10px] font-medium text-slate-400">{hint}</p> : null}
      {error ? <p className="text-[11px] font-bold text-red-600">{error}</p> : null}
    </div>
  );
}

function PasswordStrength({ password }) {
  const { t } = useTranslation();
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[a-zA-Z]/.test(password),
    /[0-9]/.test(password),
  ].filter(Boolean).length;
  const colours = ["bg-red-400", "bg-amber-400", "bg-emerald-500"];
  const labels = [t("auth.signup.strengthWeak"), t("auth.signup.strengthMedium"), t("auth.signup.strengthStrong")];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? colours[score - 1] : "bg-slate-200"}`} />
        ))}
      </div>
      <p className="mt-1.5 text-[9px] font-bold text-slate-400">{t("auth.signup.passwordStrength")}: {labels[Math.max(0, score - 1)]}</p>
    </div>
  );
}

export default function Signup() {
  const { t, i18n } = useTranslation();
  const Arrow = i18n.dir() === "rtl" ? ArrowLeft : ArrowRight;
  const navigate = useNavigate();
  const location = useLocation();
  const registerUser = useAuthStore((s) => s.register);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "", acceptedTerms: false },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const user = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        ...(values.phone ? { phone: values.phone } : {}),
      });
      const roleName = String(user?.role?.name || user?.role || "").trim().toUpperCase();

      if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      if (roleName === "INSTRUCTOR") {
        navigate("/instructor", { replace: true });
        return;
      }

      const enrollmentCheckout = getEnrollmentCheckoutPath(location.search);
      navigate(enrollmentCheckout || "/courses", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, t("auth.errors.registerFailed")));
    }
  };

  return (
    <AuthShell
      title={t("auth.signup.title")}
      subtitle={t("auth.signup.subtitle")}
      footer={
        <p className="text-center text-sm font-medium text-slate-500">
          {t("auth.signup.hasAccount")}{" "}
          <Link to={`/login${location.search}`} className="font-black text-blue-700 hover:underline">
            {t("auth.signup.loginLink")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
          <TrialAuthCta />
        </div>
        {serverError ? (
          <div role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
            {serverError}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("auth.signup.fullNameLabel")} error={errors.fullName ? t("auth.signup.errors.fullName") : ""}>
          <div className="relative">
            <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" autoComplete="name" placeholder={t("auth.signup.fullNamePlaceholder")} className={inputClass} {...register("fullName")} />
          </div>
        </Field>

        <Field label={t("auth.signup.emailLabel")} error={errors.email ? t("auth.signup.errors.email") : ""}>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="email" autoComplete="email" placeholder={t("auth.signup.emailPlaceholder")} className={inputClass} {...register("email")} />
          </div>
        </Field>

        <Field label={t("auth.signup.phoneLabel")} error={errors.phone ? t("auth.signup.errors.phone") : ""} hint={t("auth.signup.phoneHint")}>
          <div className="relative">
            <Phone className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="tel" autoComplete="tel" placeholder={t("auth.signup.phonePlaceholder")} className={inputClass} {...register("phone")} />
          </div>
        </Field>

        <Field label={t("auth.signup.passwordLabel")} error={errors.password ? t("auth.signup.errors.password") : ""}>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("auth.signup.passwordPlaceholder")}
              className={`${inputClass} pe-11`}
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" tabIndex={-1} aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
        </Field>

        <Field label={t("auth.signup.confirmPasswordLabel")} error={errors.confirmPassword ? t("auth.signup.errors.confirmPassword") : ""}>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("auth.signup.confirmPasswordPlaceholder")}
              className={`${inputClass} pe-11`}
              {...register("confirmPassword")}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" tabIndex={-1} aria-label={showConfirm ? t("auth.login.hidePassword") : t("auth.login.showPassword")}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-blue-700" {...register("acceptedTerms")} />
          <span className="text-[11px] font-medium leading-5 text-slate-600">
            {t("auth.signup.acceptPrefix")} <Link to="/terms" target="_blank" className="font-black text-blue-700 hover:underline">{t("auth.signup.termsLink")}</Link> {t("auth.signup.and")} <Link to="/privacy" target="_blank" className="font-black text-blue-700 hover:underline">{t("auth.signup.privacyLink")}</Link>.
          </span>
        </label>
        {errors.acceptedTerms ? <p className="mt-2 text-[11px] font-bold text-red-600">{t("auth.signup.errors.terms")}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#071a38] text-sm font-black text-white shadow-[0_12px_28px_rgba(7,26,56,.2)] transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t("auth.signup.submit")}
          {!isSubmitting ? <Arrow className="h-4 w-4" /> : null}
        </button>
        <p className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />{t("auth.signup.securityNote")}</p>
      </form>
    </AuthShell>
  );
}
