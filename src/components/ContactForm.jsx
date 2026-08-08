import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Send } from "lucide-react";
import client from "../api/client";
import { getErrorMessage } from "../api/error";

const field =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

export default function ContactForm() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await client.post("/public/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus({ type: "success", message: t("publicContact.formSuccess", { defaultValue: isRtl ? "تم إرسال رسالتك. سنتواصل معك قريباً." : "Message sent. We will reply soon." }) });
    } catch (err) {
      setStatus({ type: "error", message: getErrorMessage(err, t("publicContact.formError", { defaultValue: isRtl ? "تعذّر الإرسال." : "Could not send message." })) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,.07)] md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071a38] text-cyan-300"><Send className="h-4 w-4" /></span>
        <div>
      <h2 className="text-lg font-black text-slate-950">
        {t("publicContact.formTitle", { defaultValue: isRtl ? "أرسل رسالة" : "Send us a message" })}
      </h2>
      <p className="mt-1 text-xs font-medium text-slate-500">
        {t("publicContact.formSubtitle", { defaultValue: isRtl ? "املأ النموذج وسيرد فريقنا عليك." : "Fill in the form and our team will respond." })}
      </p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-black text-slate-700">
            {t("publicContact.nameLabel", { defaultValue: isRtl ? "الاسم" : "Name" })}
          </label>
          <input
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={field}
            dir={isRtl ? "rtl" : "ltr"}
            placeholder={t("publicContact.namePlaceholder")}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-black text-slate-700">
            {t("publicContact.emailLabel", { defaultValue: isRtl ? "البريد الإلكتروني" : "Email" })}
          </label>
          <input
            required
            type="email"
            maxLength={160}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className={field}
            dir="ltr"
            placeholder="name@example.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-black text-slate-700">
            {t("publicContact.subjectLabel", { defaultValue: isRtl ? "الموضوع" : "Subject" })}
          </label>
          <select
            required
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            className={field}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <option value="">{t("publicContact.topicPlaceholder")}</option>
            {["account", "course", "payment", "technical", "instructor", "other"].map((topic) => (
              <option key={topic} value={t(`publicContact.topics.${topic}`)}>{t(`publicContact.topics.${topic}`)}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-black text-slate-700">
            {t("publicContact.messageLabel", { defaultValue: isRtl ? "الرسالة" : "Message" })}
          </label>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            className={`${field} min-h-36 resize-y py-3 leading-6`}
            dir={isRtl ? "rtl" : "ltr"}
            placeholder={t("publicContact.messagePlaceholder")}
          />
          <p className="mt-2 text-end text-[10px] font-bold text-slate-400">{form.message.length}/2000</p>
        </div>
      </div>

      {status ? (
        <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-xs font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#071a38] px-6 text-sm font-black text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {t("publicContact.submit", { defaultValue: isRtl ? "إرسال" : "Send message" })}
      </button>
    </form>
  );
}
