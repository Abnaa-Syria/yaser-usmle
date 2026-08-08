import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Save, ShieldCheck, User } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import {
  StudentSurface,
  studentBtnPrimary,
  studentFieldClass,
} from "../components/student/ui";
import useAuthStore from "../store/authStore";
import { useChangePassword, useProfileMe, useUpdateProfile } from "../features/student/profile/hooks";
import { getErrorMessage } from "../api/error";
import ProfileAvatarEditor from "../components/profile/ProfileAvatarEditor";

/* ── Zod schemas ── */
const profileSchema = z.object({
  fullName: z.string().min(3, "settings.errors.fullNameMin"),
  phone: z
    .string()
    .refine((v) => v === "" || /^\+?[0-9]{7,15}$/.test(String(v)), "settings.errors.phoneMin"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "settings.errors.required"),
    newPassword: z
      .string()
      .min(8, "settings.errors.passwordMin")
      .regex(/[a-zA-Z]/, "settings.errors.passwordMin")
      .regex(/[0-9]/, "settings.errors.passwordMin"),
    confirmPassword: z.string().min(1, "settings.errors.required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "settings.errors.passwordMatch",
    path: ["confirmPassword"],
  });

/* ── Reusable input ── */
function Field({ label, error, type = "text", placeholder, rightElement, className = "", ...rest }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`${studentFieldClass} py-3 pe-10 ps-4 ${error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10" : ""} ${className}`}
          {...rest}
        />
        {rightElement && (
          <div className="absolute end-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function PasswordField({ label, error, placeholder, ...rest }) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();
  return (
    <Field
      label={label}
      error={error}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      rightElement={
        <button type="button" onClick={() => setShow((v) => !v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...rest}
    />
  );
}

/* ── Nav items ── */
const NAV = [
  { key: "profile",       icon: User,         label: "settings.nav.profile"  },
  { key: "security",      icon: ShieldCheck,  label: "settings.nav.security" },
];

/* ── Profile section ── */
function ProfileSection() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading: profileLoading } = useProfileMe(Boolean(user));
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? "", phone: user?.phone ?? "" },
  });

  useEffect(() => {
    if (profile) {
      reset({ 
        fullName: profile.fullName ?? "", 
        phone: profile.phone ?? "", 
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values) => {
    setApiErr("");
    try {
      const payload = {
        fullName: values.fullName.trim(),
        ...(values.phone && String(values.phone).trim() !== "" ? { phone: String(values.phone).trim() } : {}),
      };
      await updateProfile.mutateAsync(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setApiErr(getErrorMessage(e, t("settings.errors.saveFailed", { defaultValue: "Could not save profile." })));
    }
  };

  if (profileLoading && !profile) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <StudentSurface className="bg-slate-50/80 dark:bg-[#0C1829]/60">
        <ProfileAvatarEditor />
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/8">
          <p className="text-base font-black text-slate-900 dark:text-white">{user?.fullName}</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
      </StudentSurface>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label={t("settings.profile.fullName")}
          placeholder={t("settings.profile.fullNamePlaceholder")}
          error={errors.fullName && t(errors.fullName.message)}
          {...register("fullName")}
        />
        <Field
          label={t("settings.profile.email")}
          type="email"
          value={user?.email ?? ""}
          readOnly
          className="cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-[#0C1829]/80 dark:text-slate-500"
          placeholder={t("settings.profile.emailPlaceholder")}
        />
        <Field
          label={t("settings.profile.phone")}
          placeholder={t("settings.profile.phonePlaceholder")}
          error={errors.phone && t(errors.phone.message)}
          {...register("phone")}
        />
      </div>

      {apiErr ? <p className="text-sm text-rose-600 dark:text-rose-400">{apiErr}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty || isSubmitting || updateProfile.isPending}
          className={studentBtnPrimary}
        >
          <Save className="h-4 w-4" />
          {isSubmitting || updateProfile.isPending ? t("settings.saving") : t("settings.save")}
        </button>
        {saved && <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{t("settings.saved")}</span>}
      </div>
    </form>
  );
}

/* ── Security section ── */
function SecuritySection() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const [saved, setSaved] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (values) => {
    setApiErr("");
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });
      reset();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setApiErr(getErrorMessage(e, t("settings.errors.passwordFailed", { defaultValue: "Could not update password." })));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
        <Lock className="h-4 w-4 text-[var(--yu-blue-700)]" />
        {t("settings.security.changePassword")}
      </div>
      <PasswordField
        label={t("settings.security.currentPassword")}
        placeholder={t("settings.security.currentPasswordPlaceholder")}
        error={errors.currentPassword && t(errors.currentPassword.message)}
        {...register("currentPassword")}
      />
      <PasswordField
        label={t("settings.security.newPassword")}
        placeholder={t("settings.security.newPasswordPlaceholder")}
        error={errors.newPassword && t(errors.newPassword.message)}
        {...register("newPassword")}
      />
      <PasswordField
        label={t("settings.security.confirmPassword")}
        placeholder={t("settings.security.confirmPasswordPlaceholder")}
        error={errors.confirmPassword && t(errors.confirmPassword.message)}
        {...register("confirmPassword")}
      />
      {apiErr ? <p className="text-sm text-rose-600 dark:text-rose-400">{apiErr}</p> : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || changePassword.isPending}
          className={studentBtnPrimary}
        >
          <Save className="h-4 w-4" />
          {isSubmitting || changePassword.isPending ? t("settings.saving") : t("settings.save")}
        </button>
        {saved && <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{t("settings.saved")}</span>}
      </div>
    </form>
  );
}

/* ── Notifications section ── */
const NOTIF_KEYS = ["classReminders", "examAlerts", "progressReports", "promotions"];

function NotificationsSection() {
  const { t } = useTranslation();
  const [toggles, setToggles] = useState(
    Object.fromEntries(NOTIF_KEYS.map((k) => [k, k !== "promotions"]))
  );

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("settings.notifs.description")}</p>
      {NOTIF_KEYS.map((key) => (
        <div
          key={key}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5 dark:border-white/8 dark:bg-[#0C1829]/60"
        >
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t(`settings.notifs.${key}.title`)}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t(`settings.notifs.${key}.desc`)}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={toggles[key]}
            onClick={() => setToggles((prev) => ({ ...prev, [key]: !prev[key] }))}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--yu-blue-700)] focus:ring-offset-2
              ${toggles[key] ? "bg-[var(--yu-blue-700)]" : "bg-slate-300 dark:bg-white/15"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200
                ${toggles[key] ? "start-[22px]" : "start-0.5"}`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

const SECTIONS = { profile: ProfileSection, security: SecuritySection };

export default function Settings() {
  const { t }       = useTranslation();
  const [tab, setTab] = useState("profile");
  const ActiveSection = SECTIONS[tab];

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <>
            {t("settings.titlePrefix")}{" "}
            <span className="text-[var(--yu-blue-700)]">{t("settings.titleAccent")}</span>
          </>
        }
        subtitle={t("settings.subtitle")}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex overflow-x-auto gap-1 rounded-[1.35rem] border border-slate-200/80 bg-white/90 p-2 shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-white/8 dark:bg-[#0F1E38]/85 lg:w-52 lg:shrink-0 lg:flex-col lg:overflow-x-visible">
          {NAV.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition-colors
                ${tab === key
                  ? "bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-300)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(label)}
            </button>
          ))}
        </nav>

        <StudentSurface className="flex-1">
          <h2 className="mb-6 text-lg font-black tracking-tight text-slate-900 dark:text-white">{t(`settings.nav.${tab}`)}</h2>
          <ActiveSection />
        </StudentSurface>
      </div>
    </div>
  );
}
