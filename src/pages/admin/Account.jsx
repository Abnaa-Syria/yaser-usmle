import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Plus, Save, Star, Trash2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import ProfileAvatarEditor from "../../components/profile/ProfileAvatarEditor";
import { getErrorMessage } from "../../api/error";
import { useProfileMe, useUpdateProfile } from "../../features/student/profile/hooks";
import {
  useAdminInstructorReviews,
  useCreateAdminInstructorReview,
  useDeleteAdminInstructorReview,
  useUpdateAdminInstructorReview,
} from "../../features/admin/instructorReviews/hooks";

const PHONE_RE = /^\+?[0-9]{7,15}$/;

function Account() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { data: profile, isLoading } = useProfileMe();
  const updateMut = useUpdateProfile();
  const { data: reviewsData, isLoading: reviewsLoading } = useAdminInstructorReviews();
  const createReview = useCreateAdminInstructorReview();
  const updateReview = useUpdateAdminInstructorReview();
  const deleteReview = useDeleteAdminInstructorReview();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [reviewForm, setReviewForm] = useState({
    displayName: "",
    rating: 5,
    comment: "",
    isVisible: true,
  });

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

  const reviews = reviewsData?.reviews || [];

  const onCreateReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.displayName.trim()) {
      toast.error(isAr ? "اسم صاحب التقييم مطلوب" : "Reviewer name is required");
      return;
    }
    try {
      await createReview.mutateAsync({
        displayName: reviewForm.displayName.trim(),
        rating: Number(reviewForm.rating) || 5,
        comment: reviewForm.comment.trim() || null,
        isVisible: reviewForm.isVisible,
      });
      setReviewForm({ displayName: "", rating: 5, comment: "", isVisible: true });
      toast.success(isAr ? "تم إضافة التقييم" : "Review added");
    } catch (err) {
      toast.error(getErrorMessage(err, isAr ? "تعذر إضافة التقييم" : "Could not add review"));
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("dashboard.admin.pages.account.title", { defaultValue: isAr ? "بروفايل الدكتور" : "Doctor profile" })}
        subtitle={t("dashboard.admin.pages.account.subtitle", {
          defaultValue: isAr
            ? "الاسم والنبذة والصورة والتقييمات الظاهرة على صفحة الكورس وبروفايل الدكتور."
            : "Name, bio, photo, and reviews shown on course pages and the doctor profile.",
        })}
      />

      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1A1A22]">
        <h2 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
          {t("dashboard.admin.pages.account.photoTitle", { defaultValue: isAr ? "صورة البروفايل" : "Profile photo" })}
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          {t("dashboard.admin.pages.account.photoHint", {
            defaultValue: isAr ? "تظهر بدل الحروف في صفحة الكورس وبروفايل الدكتور." : "Replaces initials on the course page and doctor profile.",
          })}
        </p>
        <ProfileAvatarEditor />
      </div>

      <form
        onSubmit={onSave}
        className="space-y-5 rounded-[1.35rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1A1A22]"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t("dashboard.admin.pages.account.teachingProfile", { defaultValue: isAr ? "بيانات الدكتور" : "Doctor details" })}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("dashboard.admin.pages.account.teachingProfileHint", {
              defaultValue: isAr ? "هذا الاسم والنبذة يظهران للطلاب في الكورسات والبروفايل العام." : "This name and bio appear on courses and the public profile.",
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
                className={`${inputClass} min-h-[140px] py-3`}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                placeholder={isAr ? "اكتب النبذة بالعربية والإنجليزية إن رغبت…" : "Write the public bio students will see…"}
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

      <section className="space-y-5 rounded-[1.35rem] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1A1A22]">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isAr ? "تقييمات بروفايل الدكتور" : "Doctor profile reviews"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isAr
              ? "أضف أو أخفِ التقييمات الظاهرة في صفحة بروفايل الدكتور."
              : "Add or hide reviews shown on the public doctor profile."}
          </p>
        </div>

        <form onSubmit={onCreateReview} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/8 dark:bg-white/5 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{isAr ? "اسم الطالب" : "Reviewer name"}</span>
            <input
              className={inputClass}
              value={reviewForm.displayName}
              onChange={(e) => setReviewForm((p) => ({ ...p, displayName: e.target.value }))}
              placeholder={isAr ? "مثال: أحمد محمد" : "e.g. Ahmed Mohamed"}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{isAr ? "التقييم" : "Rating"}</span>
            <select
              className={inputClass}
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{isAr ? "التعليق" : "Comment"}</span>
            <textarea
              className={`${inputClass} min-h-[90px] py-3`}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
              rows={3}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={reviewForm.isVisible}
              onChange={(e) => setReviewForm((p) => ({ ...p, isVisible: e.target.checked }))}
            />
            {isAr ? "ظاهر للعامة" : "Visible publicly"}
          </label>
          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={createReview.isPending}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {createReview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isAr ? "إضافة تقييم" : "Add review"}
            </button>
          </div>
        </form>

        {reviewsLoading ? (
          <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-500">{isAr ? "لا توجد تقييمات بعد." : "No reviews yet."}</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 dark:border-white/8 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {r.displayName || r.student?.fullName || "—"}
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {r.rating}
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                        r.isVisible
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-white/5"
                      }`}
                    >
                      {r.isVisible ? (isAr ? "ظاهر" : "Visible") : isAr ? "مخفي" : "Hidden"}
                    </span>
                  </div>
                  {r.comment ? <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{r.comment}</p> : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
                    onClick={async () => {
                      try {
                        await updateReview.mutateAsync({ id: r.id, body: { isVisible: !r.isVisible } });
                        toast.success(isAr ? "تم التحديث" : "Updated");
                      } catch (err) {
                        toast.error(getErrorMessage(err, "Failed"));
                      }
                    }}
                  >
                    {r.isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {r.isVisible ? (isAr ? "إخفاء" : "Hide") : isAr ? "إظهار" : "Show"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 dark:border-rose-500/30 dark:text-rose-300"
                    onClick={async () => {
                      if (!window.confirm(isAr ? "حذف هذا التقييم؟" : "Delete this review?")) return;
                      try {
                        await deleteReview.mutateAsync(r.id);
                        toast.success(isAr ? "تم الحذف" : "Deleted");
                      } catch (err) {
                        toast.error(getErrorMessage(err, "Failed"));
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isAr ? "حذف" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

export default Account;
