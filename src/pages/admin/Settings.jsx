import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Save, ShieldAlert, Globe, Lock, Palette, Share2, ImageUp, RotateCcw, Loader2, Layers } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminSettings, useUpdateAdminSettings } from "../../features/admin/settings/hooks";
import { uploadAdminLogo } from "../../features/admin/settings/api";
import { getErrorMessage } from "../../api/error";
import { APP_BRAND } from "../../config/brand";
import { resolveBrandAssetUrl } from "../../components/BrandLogo";

const SK = "dashboard.admin.pages.settings";

function settingToString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function settingToBool(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return fallback;
}

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{title}</h3>
      </div>
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]">
        {children}
      </div>
    </div>
  );
}

function SettingsToggle({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? "bg-[var(--yu-blue-700)]" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function SettingsInputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[var(--yu-blue-700)] focus:ring-1 focus:ring-[#3B82F6]/30 dark:border-white/10 dark:bg-[#1E293B] dark:text-white dark:focus:border-[var(--yu-blue-700)] dark:focus:ring-[#3B82F6]/30"
      />
    </div>
  );
}

function LogoUploadField({ label, description, value, fallback, dark = false, compact = false, uploading, onUpload, onReset }) {
  const { t } = useTranslation();
  const preview = resolveBrandAssetUrl(value || fallback);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
      <div className={`flex min-h-36 items-center justify-center p-6 ${dark ? "bg-[#071a38]" : "bg-slate-50"}`}>
        <img src={preview} alt="" className={compact ? "h-16 w-16 object-contain" : "h-14 max-w-[240px] object-contain"} />
      </div>
      <div className="space-y-4 bg-white p-5 dark:bg-[#1E293B]">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--yu-blue-700)] px-3 py-2 text-xs font-bold text-white transition hover:bg-[var(--yu-blue-600)]">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}
            {uploading ? t(`${SK}.uploading`) : t(`${SK}.uploadLogo`)}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploading} onChange={(event) => onUpload(event.target.files?.[0])} />
          </label>
          {value ? (
            <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300">
              <RotateCcw className="h-3.5 w-3.5" /> {t(`${SK}.useDefault`)}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data, isLoading, isError, error, refetch } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState({
    siteName: APP_BRAND.name,
    siteEmail: "",
    phoneNumber: "",
    socialFacebook: "",
    socialTwitter: "",
    socialInstagram: "",
    socialLinkedin: "",
    logoPrimaryUrl: "",
    logoLightUrl: "",
    logoMarkUrl: "",
    footerTaglineEn: "",
    footerTaglineAr: "",
    footerLocationEn: "",
    footerLocationAr: "",
    enableRegistration: true,
    maintenanceMode: false,
    theme: "dark",
    notifications: true,
    flashcardEasyDays: "30",
    flashcardMediumDays: "7",
    flashcardHardDays: "3",
  });
  const [uploadingLogo, setUploadingLogo] = useState("");

  useEffect(() => {
    if (data === undefined) return;
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) {
      setHydrated(true);
      return;
    }
    const g = (key, fb = "") => {
      const row = rows.find((s) => s.key === key);
      return row ? settingToString(row.value) : fb;
    };
    const phone = g("PHONE_NUMBER") || g("SUPPORT_PHONE");
    setSettings((prev) => ({
      ...prev,
      siteName: g("SITE_NAME", prev.siteName),
      siteEmail: g("CONTACT_EMAIL", prev.siteEmail),
      phoneNumber: phone || prev.phoneNumber,
      socialFacebook: g("SOCIAL_FACEBOOK_URL", prev.socialFacebook),
      socialTwitter: g("SOCIAL_TWITTER_URL", prev.socialTwitter),
      socialInstagram: g("SOCIAL_INSTAGRAM_URL", prev.socialInstagram),
      socialLinkedin: g("SOCIAL_LINKEDIN_URL", prev.socialLinkedin),
      logoPrimaryUrl: g("LOGO_PRIMARY_URL", ""),
      logoLightUrl: g("LOGO_LIGHT_URL", ""),
      logoMarkUrl: g("LOGO_MARK_URL", ""),
      footerTaglineEn: g("FOOTER_TAGLINE_EN", prev.footerTaglineEn),
      footerTaglineAr: g("FOOTER_TAGLINE_AR", prev.footerTaglineAr),
      footerLocationEn: g("FOOTER_LOCATION_EN", prev.footerLocationEn),
      footerLocationAr: g("FOOTER_LOCATION_AR", prev.footerLocationAr),
      enableRegistration: settingToBool(rows.find((s) => s.key === "ENABLE_REGISTRATION")?.value, prev.enableRegistration),
      maintenanceMode: settingToBool(rows.find((s) => s.key === "MAINTENANCE_MODE")?.value, prev.maintenanceMode),
      theme: g("DEFAULT_THEME", prev.theme) || prev.theme,
      notifications: settingToBool(rows.find((s) => s.key === "NOTIFICATIONS_ENABLED")?.value, prev.notifications),
      flashcardEasyDays: g("FLASHCARD_INTERVAL_EASY_DAYS", prev.flashcardEasyDays) || prev.flashcardEasyDays,
      flashcardMediumDays: g("FLASHCARD_INTERVAL_MEDIUM_DAYS", prev.flashcardMediumDays) || prev.flashcardMediumDays,
      flashcardHardDays: g("FLASHCARD_INTERVAL_HARD_DAYS", prev.flashcardHardDays) || prev.flashcardHardDays,
    }));
    setHydrated(true);
  }, [data]);

  const handleToggle = (key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "maintenanceMode") {
        const payload = {
          SITE_NAME: next.siteName,
          CONTACT_EMAIL: next.siteEmail,
          PHONE_NUMBER: next.phoneNumber,
          SUPPORT_PHONE: next.phoneNumber,
          SOCIAL_FACEBOOK_URL: next.socialFacebook,
          SOCIAL_TWITTER_URL: next.socialTwitter,
          SOCIAL_INSTAGRAM_URL: next.socialInstagram,
          SOCIAL_LINKEDIN_URL: next.socialLinkedin,
          LOGO_PRIMARY_URL: next.logoPrimaryUrl,
          LOGO_LIGHT_URL: next.logoLightUrl,
          LOGO_MARK_URL: next.logoMarkUrl,
          FOOTER_TAGLINE_EN: next.footerTaglineEn,
          FOOTER_TAGLINE_AR: next.footerTaglineAr,
          FOOTER_LOCATION_EN: next.footerLocationEn,
          FOOTER_LOCATION_AR: next.footerLocationAr,
          ENABLE_REGISTRATION: next.enableRegistration,
          MAINTENANCE_MODE: next.maintenanceMode,
          DEFAULT_THEME: next.theme,
          NOTIFICATIONS_ENABLED: next.notifications,
        };
        queueMicrotask(() => {
          updateMutation.mutate(payload, {
            onSuccess: () =>
              toast.success(
                next.maintenanceMode
                  ? t(`${SK}.maintenanceEnabled`, {
                      defaultValue: isRtl
                        ? "تم تفعيل وضع الصيانة"
                        : "Maintenance mode enabled",
                    })
                  : t(`${SK}.maintenanceDisabled`, {
                      defaultValue: isRtl
                        ? "تم إيقاف وضع الصيانة"
                        : "Maintenance mode disabled",
                    })
              ),
            onError: (e) => toast.error(getErrorMessage(e, t(`${SK}.saveFailed`))),
          });
        });
      }
      return next;
    });
  };

  const savePayload = () => ({
    SITE_NAME: settings.siteName,
    CONTACT_EMAIL: settings.siteEmail,
    PHONE_NUMBER: settings.phoneNumber,
    SUPPORT_PHONE: settings.phoneNumber,
    SOCIAL_FACEBOOK_URL: settings.socialFacebook,
    SOCIAL_TWITTER_URL: settings.socialTwitter,
    SOCIAL_INSTAGRAM_URL: settings.socialInstagram,
    SOCIAL_LINKEDIN_URL: settings.socialLinkedin,
    LOGO_PRIMARY_URL: settings.logoPrimaryUrl,
    LOGO_LIGHT_URL: settings.logoLightUrl,
    LOGO_MARK_URL: settings.logoMarkUrl,
    FOOTER_TAGLINE_EN: settings.footerTaglineEn,
    FOOTER_TAGLINE_AR: settings.footerTaglineAr,
    FOOTER_LOCATION_EN: settings.footerLocationEn,
    FOOTER_LOCATION_AR: settings.footerLocationAr,
    ENABLE_REGISTRATION: settings.enableRegistration,
    MAINTENANCE_MODE: settings.maintenanceMode,
    DEFAULT_THEME: settings.theme,
    NOTIFICATIONS_ENABLED: settings.notifications,
    FLASHCARD_INTERVAL_EASY_DAYS: Number(settings.flashcardEasyDays) || 30,
    FLASHCARD_INTERVAL_MEDIUM_DAYS: Number(settings.flashcardMediumDays) || 7,
    FLASHCARD_INTERVAL_HARD_DAYS: Number(settings.flashcardHardDays) || 3,
  });

  const handleSave = () => {
    updateMutation.mutate(savePayload(), {
      onSuccess: () => toast.success(t(`${SK}.saved`)),
      onError: (e) => toast.error(getErrorMessage(e, t(`${SK}.saveFailed`))),
    });
  };

  const handleLogoUpload = async (key, file) => {
    if (!file) return;
    setUploadingLogo(key);
    try {
      const uploaded = await uploadAdminLogo(file);
      if (!uploaded?.url) throw new Error(t(`${SK}.logoUploadNoUrl`));
      setSettings((prev) => ({ ...prev, [key]: uploaded.url }));
      toast.success(t(`${SK}.logoUploaded`));
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError, t(`${SK}.logoUploadFailed`)));
    } finally {
      setUploadingLogo("");
    }
  };

  return (
    <section className="max-w-4xl space-y-8 pb-12">
      <PageHeader
        title={t(`${SK}.title`)}
        subtitle={t(`${SK}.subtitle`)}
        actions={
          <button
            type="button"
            disabled={updateMutation.isPending || !hydrated || isLoading}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--yu-blue-700)] px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-[var(--yu-blue-700)]/20 transition-all hover:bg-[var(--yu-blue-600)] active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {t("common.save")}
          </button>
        }
      />
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-[#1A1A22]">
          {t(`${SK}.loading`)}
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-lg border border-red-200 bg-[var(--yu-blue-700)]/10 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-[var(--yu-blue-700)]/10 dark:text-red-300">
          {getErrorMessage(error, t(`${SK}.loadFailed`))}
          <button type="button" onClick={() => refetch()} className="ms-2 rounded bg-[var(--yu-blue-700)] px-2 py-1 text-xs font-bold text-white">
            {t("dashboard.common.retry")}
          </button>
        </div>
      ) : null}

      <div className="space-y-10">
        <SettingsSection title={t(`${SK}.brandIdentity`)} icon={ImageUp}>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{t(`${SK}.platformLogos`)}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t(`${SK}.platformLogosHint`)}</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <LogoUploadField
              label={t(`${SK}.primaryLogo`)}
              description={t(`${SK}.primaryLogoDesc`)}
              value={settings.logoPrimaryUrl}
              fallback={APP_BRAND.logoPath}
              uploading={uploadingLogo === "logoPrimaryUrl"}
              onUpload={(file) => handleLogoUpload("logoPrimaryUrl", file)}
              onReset={() => setSettings((prev) => ({ ...prev, logoPrimaryUrl: "" }))}
            />
            <LogoUploadField
              label={t(`${SK}.lightLogo`)}
              description={t(`${SK}.lightLogoDesc`)}
              value={settings.logoLightUrl}
              fallback={APP_BRAND.logoLightPath}
              dark
              uploading={uploadingLogo === "logoLightUrl"}
              onUpload={(file) => handleLogoUpload("logoLightUrl", file)}
              onReset={() => setSettings((prev) => ({ ...prev, logoLightUrl: "" }))}
            />
          </div>
          <div className="max-w-sm">
            <LogoUploadField
              label={t(`${SK}.compactBrandMark`)}
              description={t(`${SK}.compactBrandMarkDesc`)}
              value={settings.logoMarkUrl}
              fallback={APP_BRAND.logoMarkPath}
              compact
              uploading={uploadingLogo === "logoMarkUrl"}
              onUpload={(file) => handleLogoUpload("logoMarkUrl", file)}
              onReset={() => setSettings((prev) => ({ ...prev, logoMarkUrl: "" }))}
            />
          </div>
        </SettingsSection>

        <SettingsSection title={t(`${SK}.contactPublicSite`)} icon={Share2}>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(`${SK}.contactPublicSiteHint`)}
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <SettingsInputField label={t(`${SK}.publicContactEmail`)} value={settings.siteEmail} onChange={(v) => setSettings((p) => ({ ...p, siteEmail: v }))} placeholder={APP_BRAND.contactEmail} type="email" />
            <SettingsInputField label={t(`${SK}.phoneHeader`)} value={settings.phoneNumber} onChange={(v) => setSettings((p) => ({ ...p, phoneNumber: v }))} placeholder="+1-800-000-0000" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <SettingsInputField label={t(`${SK}.facebookUrl`)} value={settings.socialFacebook} onChange={(v) => setSettings((p) => ({ ...p, socialFacebook: v }))} placeholder="https://facebook.com/..." type="url" />
            <SettingsInputField label={t(`${SK}.twitterUrl`)} value={settings.socialTwitter} onChange={(v) => setSettings((p) => ({ ...p, socialTwitter: v }))} placeholder="https://x.com/..." type="url" />
            <SettingsInputField label={t(`${SK}.instagramUrl`)} value={settings.socialInstagram} onChange={(v) => setSettings((p) => ({ ...p, socialInstagram: v }))} placeholder="https://instagram.com/..." type="url" />
            <SettingsInputField label={t(`${SK}.linkedinUrl`)} value={settings.socialLinkedin} onChange={(v) => setSettings((p) => ({ ...p, socialLinkedin: v }))} placeholder="https://linkedin.com/..." type="url" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <SettingsInputField
              label={t(`${SK}.footerTaglineEn`, { defaultValue: "Footer tagline (EN)" })}
              value={settings.footerTaglineEn}
              onChange={(v) => setSettings((p) => ({ ...p, footerTaglineEn: v }))}
            />
            <SettingsInputField
              label={t(`${SK}.footerTaglineAr`, { defaultValue: "Footer tagline (AR)" })}
              value={settings.footerTaglineAr}
              onChange={(v) => setSettings((p) => ({ ...p, footerTaglineAr: v }))}
            />
            <SettingsInputField
              label={t(`${SK}.footerLocationEn`, { defaultValue: "Footer location (EN)" })}
              value={settings.footerLocationEn}
              onChange={(v) => setSettings((p) => ({ ...p, footerLocationEn: v }))}
              placeholder="Cairo, Egypt"
            />
            <SettingsInputField
              label={t(`${SK}.footerLocationAr`, { defaultValue: "Footer location (AR)" })}
              value={settings.footerLocationAr}
              onChange={(v) => setSettings((p) => ({ ...p, footerLocationAr: v }))}
              placeholder="القاهرة، مصر"
            />
          </div>
        </SettingsSection>

        <SettingsSection title={t(`${SK}.generalSettings`)} icon={Globe}>
          <div className="grid gap-6 sm:grid-cols-2">
            <SettingsInputField label={t(`${SK}.siteName`)} value={settings.siteName} onChange={(v) => setSettings((p) => ({ ...p, siteName: v }))} placeholder={APP_BRAND.name} />
          </div>
          <SettingsToggle
            label={t(`${SK}.publicRegistration`)}
            description={t(`${SK}.publicRegistrationDesc`)}
            enabled={settings.enableRegistration}
            onChange={() => handleToggle("enableRegistration")}
          />
        </SettingsSection>

        <SettingsSection title={t(`${SK}.interfaceExperience`)} icon={Palette}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t(`${SK}.defaultTheme`)}</p>
                <p className="text-xs text-slate-500">{t(`${SK}.defaultThemeDesc`)}</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => setSettings((p) => ({ ...p, theme: e.target.value }))}
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:focus:border-[var(--yu-blue-700)]"
              >
                <option value="dark">{t(`${SK}.darkThemePremium`)}</option>
                <option value="light">{t(`${SK}.lightTheme`)}</option>
              </select>
            </div>
            <SettingsToggle
              label={t(`${SK}.systemNotifications`)}
              description={t(`${SK}.systemNotificationsDesc`)}
              enabled={settings.notifications}
              onChange={() => handleToggle("notifications")}
            />
          </div>
        </SettingsSection>

        <SettingsSection title={t(`${SK}.flashcardSrs`, { defaultValue: isRtl ? "جدولة الفلاش كاردز" : "Flashcard scheduling" })} icon={Layers}>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(`${SK}.flashcardSrsHint`, {
              defaultValue: isRtl
                ? "عدد الأيام قبل ما تظهر البطاقة للطالب تاني حسب تقييمه: سهل / متوسط / صعب."
                : "Days before a card shows again after the student rates it Easy / Medium / Hard.",
            })}
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            <SettingsInputField
              label={t(`${SK}.flashcardEasyDays`, { defaultValue: isRtl ? "سهل (أيام)" : "Easy (days)" })}
              value={settings.flashcardEasyDays}
              onChange={(v) => setSettings((p) => ({ ...p, flashcardEasyDays: v }))}
              type="number"
              placeholder="30"
            />
            <SettingsInputField
              label={t(`${SK}.flashcardMediumDays`, { defaultValue: isRtl ? "متوسط (أيام)" : "Medium (days)" })}
              value={settings.flashcardMediumDays}
              onChange={(v) => setSettings((p) => ({ ...p, flashcardMediumDays: v }))}
              type="number"
              placeholder="7"
            />
            <SettingsInputField
              label={t(`${SK}.flashcardHardDays`, { defaultValue: isRtl ? "صعب (أيام)" : "Hard (days)" })}
              value={settings.flashcardHardDays}
              onChange={(v) => setSettings((p) => ({ ...p, flashcardHardDays: v }))}
              type="number"
              placeholder="3"
            />
          </div>
        </SettingsSection>

        <SettingsSection title={t(`${SK}.security`)} icon={Lock}>
          <div className="space-y-6">
            <SettingsToggle
              label={t(`${SK}.maintenanceMode`)}
              description={t(`${SK}.maintenanceModeDesc`, {
                defaultValue: isRtl
                  ? "يحجب الموقع عن الزوار والطلاب. الأدمن بعد تسجيل الدخول يرى المنصة كاملة ويمكنه إيقاف الصيانة."
                  : "Blocks visitors and students. Logged-in admins still see the full platform and can turn maintenance off.",
              })}
              enabled={settings.maintenanceMode}
              onChange={() => handleToggle("maintenanceMode")}
            />
            <button type="button" className="text-sm font-bold text-[var(--yu-blue-700)] hover:underline">
              {t(`${SK}.configure2fa`)}
            </button>
          </div>
        </SettingsSection>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">{t(`${SK}.dangerZone`)}</h3>
          </div>
          <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t(`${SK}.clearSystemCache`)}</p>
                <p className="text-xs text-slate-500">{t(`${SK}.clearSystemCacheDesc`)}</p>
              </div>
              <button type="button" className="rounded-lg border border-red-900/50 px-4 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-900/20">
                {t(`${SK}.clearCache`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Settings;
