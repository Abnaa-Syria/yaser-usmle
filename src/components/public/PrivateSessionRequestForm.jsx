import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, MessageSquare, Send } from "lucide-react";
import client from "../../api/client";
import { getErrorMessage } from "../../api/error";
import useAuthStore from "../../store/authStore";

const field =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white";

/**
 * Contact form for 1-1 session requests — admin follows up outside the platform.
 */
export default function PrivateSessionRequestForm({ instructorId, instructorName }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredTime: "",
    message: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.fullName || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user?.id]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await client.post("/public/private-session-requests", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        preferredTime: form.preferredTime.trim() || undefined,
        message: form.message.trim(),
        instructorId: instructorId && instructorId !== "platform-owner" ? instructorId : undefined,
      });
      setForm((prev) => ({ ...prev, preferredTime: "", message: "" }));
      setStatus({
        type: "success",
        message: t("privateSessionRequest.success", {
          defaultValue: isRtl
            ? "تم إرسال طلبك. سيتواصل معك فريق المنصة قريباً خارج المنصة."
            : "Request sent. Our team will contact you soon outside the platform.",
        }),
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(
          err,
          t("privateSessionRequest.error", { defaultValue: isRtl ? "تعذّر الإرسال." : "Could not send request." })
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--yu-blue-700)]/15 text-[var(--yu-blue-700)]">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t("privateSessionRequest.title", { defaultValue: isRtl ? "طلب جلسة فردية" : "Request a private session" })}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t("privateSessionRequest.hint", {
              name: instructorName || (isRtl ? "المحاضر" : "the instructor"),
              defaultValue: isRtl
                ? `اترك بياناتك وسيتواصل معك فريق المنصة بخصوص جلسة فردية مع ${instructorName || "المحاضر"}.`
                : `Leave your details and our team will contact you about a 1-on-1 with ${instructorName || "the instructor"}.`,
            })}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {t("privateSessionRequest.name", { defaultValue: isRtl ? "الاسم" : "Name" })}
        </label>
        <input
          required
          maxLength={120}
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className={field}
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {t("privateSessionRequest.email", { defaultValue: isRtl ? "البريد الإلكتروني" : "Email" })}
        </label>
        <input
          required
          type="email"
          maxLength={160}
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className={field}
          dir="ltr"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {t("privateSessionRequest.phone", { defaultValue: isRtl ? "رقم التواصل (واتساب/هاتف)" : "Phone / WhatsApp" })}
        </label>
        <input
          maxLength={40}
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          className={field}
          dir="ltr"
          placeholder="+966…"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {t("privateSessionRequest.preferredTime", { defaultValue: isRtl ? "وقت مفضّل (اختياري)" : "Preferred time (optional)" })}
        </label>
        <input
          maxLength={300}
          value={form.preferredTime}
          onChange={(e) => setForm((p) => ({ ...p, preferredTime: e.target.value }))}
          className={field}
          dir={isRtl ? "rtl" : "ltr"}
          placeholder={isRtl ? "مثلاً: مساء الجمعة" : "e.g. Friday evening"}
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {t("privateSessionRequest.message", { defaultValue: isRtl ? "رسالتك" : "Message" })}
        </label>
        <textarea
          required
          minLength={10}
          maxLength={2000}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          className={`${field} min-h-28 resize-y py-2.5 leading-5`}
          dir={isRtl ? "rtl" : "ltr"}
          placeholder={
            isRtl
              ? "اكتب هدفك من الجلسة أو أي ملاحظات…"
              : "What do you want to cover in the session?"
          }
        />
      </div>

      {status ? (
        <p
          role="status"
          className={`rounded-xl px-3 py-2.5 text-xs font-bold ${
            status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--yu-blue-700)] text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {t("privateSessionRequest.submit", { defaultValue: isRtl ? "إرسال الطلب" : "Send request" })}
      </button>
    </form>
  );
}
