import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import ProfileAvatarEditor from "../../components/profile/ProfileAvatarEditor";
import { getErrorMessage } from "../../api/error";
import { useProfileMe, useUpdateProfile } from "../../features/student/profile/hooks";

const PHONE_RE = /^\+?[0-9]{7,15}$/;

function Account() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useProfileMe();
  const updateMut = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName || "");
    setPhone(profile.phone || "");
    setBio(profile.bio || "");
    setExperience(profile.experience != null ? String(profile.experience) : "");
  }, [profile]);

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200/90 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

  const onSave = async (e) => {
    e.preventDefault();
    const name = fullName.trim();
    if (name.length < 3) {
      toast.error(t("dashboard.instructor.pages.settings.nameMin", { defaultValue: "Name must be at least 3 characters." }));
      return;
    }
    const phoneTrim = phone.trim();
    if (phoneTrim && !PHONE_RE.test(phoneTrim)) {
      toast.error(t("dashboard.instructor.pages.settings.phoneInvalid", { defaultValue: "Invalid phone number." }));
      return;
    }
    const payload = {
      fullName: name,
      bio: bio.trim() || undefined,
    };
    if (phoneTrim) payload.phone = phoneTrim;
    const expTrim = experience.trim();
    if (expTrim !== "") {
      const n = Number.parseInt(expTrim, 10);
      if (Number.isNaN(n) || n < 0) {
        toast.error(t("dashboard.instructor.pages.settings.experienceInvalid", { defaultValue: "Invalid experience years." }));
        return;
      }
      payload.experience = n;
    }
    try {
      await updateMut.mutateAsync(payload);
      toast.success(t("dashboard.instructor.pages.settings.saved", { defaultValue: "Profile updated." }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("dashboard.instructor.pages.settings.saveFailed", { defaultValue: "Failed to update profile." })));
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("dashboard.admin.pages.account.title")}
        subtitle={t("dashboard.admin.pages.account.subtitle", {
          defaultValue: "Your public teaching profile appears on courses and packages.",
        })}
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1A1A22]">
        <ProfileAvatarEditor />
      </div>

      <form
        onSubmit={onSave}
        className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1A1A22]"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t("dashboard.admin.pages.account.teachingProfile", { defaultValue: "Teaching profile" })}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("dashboard.admin.pages.account.teachingProfileHint", {
              defaultValue: "This is the name and bio students see on your courses.",
            })}
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
        ) : (
          <>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t("dashboard.instructor.pages.settings.fullName", { defaultValue: "Full name" })}
              </span>
              <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t("dashboard.instructor.pages.settings.phone", { defaultValue: "Phone" })}
              </span>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t("dashboard.instructor.pages.settings.experience", { defaultValue: "Years of experience" })}
              </span>
              <input className={inputClass} type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t("dashboard.instructor.pages.settings.bio", { defaultValue: "Bio" })}
              </span>
              <textarea
                className={`${inputClass} min-h-[120px] py-3`}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </label>
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-5 text-sm font-bold text-white disabled:opacity-60"
            >
              {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("common.save", { defaultValue: "Save" })}
            </button>
          </>
        )}
      </form>
    </section>
  );
}

export default Account;
