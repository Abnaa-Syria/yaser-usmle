import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Award, Briefcase, GraduationCap, Link2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { getErrorMessage } from "../api/error";
import useAuthStore from "../store/authStore";

const inputFieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[var(--yu-blue-700)] dark:focus:ring-[var(--yu-blue-700)]/10";

const textAreaClass =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[var(--yu-blue-700)] dark:focus:ring-[var(--yu-blue-700)]/10";

export default function BecomeInstructorModal({ onClose }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  // Auto-fill logged in user info
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !specialty.trim() || !bio.trim()) {
      toast.error(isRtl ? "يرجى ملء الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    
    try {
      await client.post("/public/instructor-applications", {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        specialty: specialty.trim(),
        experience: experience.trim() || undefined,
        message: bio.trim(),
        documentUrl: cvUrl.trim() || undefined,
      });

      toast.success(
        isRtl
          ? "تم إرسال طلبك بنجاح! سنقوم بمراجعته والتواصل معك قريباً ✅"
          : "Your application has been submitted successfully! We will review it and contact you soon ✅"
      );
      onClose();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          isRtl ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً." : "Failed to submit application. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06152f]/70 p-3 backdrop-blur-md sm:p-5"
        onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 18 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_35px_100px_rgba(0,0,0,.35)] lg:grid-cols-[.72fr_1.28fr]"
          style={{ maxHeight: "92vh" }}
        >
          <button onClick={onClose} disabled={loading} className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50 lg:bg-white/10 lg:text-white lg:hover:bg-white/20" aria-label="Close">
            <X className="h-4 w-4" />
          </button>

          <aside className="relative hidden overflow-hidden bg-[#071a38] p-8 text-white lg:flex lg:flex-col">
            <div className="pointer-events-none absolute -start-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -end-20 bottom-0 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden />
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-300 text-[#071a38]"><GraduationCap className="h-6 w-6" /></span>
              <p className="mt-7 text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">YASER USMLE FACULTY</p>
              <h2 className="mt-3 text-3xl font-black leading-tight">{isRtl ? "شارك خبرتك مع طلاب الطب" : "Share your expertise with medical learners"}</h2>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-400">{isRtl ? "أخبرنا عن خبرتك ومجال تدريسِك، وسيتواصل معك الفريق بعد مراجعة الطلب." : "Tell us about your expertise and teaching area. Our team will contact you after reviewing your application."}</p>
            </div>

            <div className="relative mt-auto space-y-3 pt-10">
              <div className="flex items-center gap-3 rounded-xl bg-white/[.06] p-3"><Award className="h-4 w-4 text-cyan-300" /><span className="text-xs font-bold">{isRtl ? "قدّم خبرتك الأكاديمية بوضوح" : "Present your academic expertise clearly"}</span></div>
              <div className="flex items-center gap-3 rounded-xl bg-white/[.06] p-3"><Briefcase className="h-4 w-4 text-cyan-300" /><span className="text-xs font-bold">{isRtl ? "أضف رابط سيرتك الذاتية" : "Include your CV or portfolio link"}</span></div>
            </div>
          </aside>

          <section className="min-h-0 overflow-y-auto bg-white">
            <div className="border-b border-slate-100 px-6 pb-5 pt-6 pe-16 sm:px-8 sm:pt-8 sm:pe-16">
              <div className="flex items-center gap-3 lg:hidden">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a38] text-cyan-300"><GraduationCap className="h-5 w-5" /></span>
                <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-700">YASER USMLE FACULTY</p><h2 className="text-xl font-black text-slate-950">{isRtl ? "طلب الانضمام كمحاضر" : "Instructor application"}</h2></div>
              </div>
              <div className="hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">{isRtl ? "نموذج التقديم" : "APPLICATION FORM"}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{isRtl ? "عرّفنا بخبرتك التعليمية" : "Tell us about your teaching experience"}</h2>
                <p className="mt-2 text-xs font-medium text-slate-500">{isRtl ? "الحقول المعلّمة بنجمة مطلوبة لمراجعة الطلب." : "Fields marked with an asterisk are required for review."}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">{isRtl ? "الاسم الكامل" : "Full name"} <span className="text-blue-600">*</span></label>
                  <input type="text" required disabled={loading} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputFieldClass} placeholder={isRtl ? "مثال: د. أحمد محمد" : "e.g. Dr. Ahmed Mohamed"} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">{isRtl ? "البريد الإلكتروني" : "Email address"} <span className="text-blue-600">*</span></label>
                  <input type="email" required disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} className={inputFieldClass} placeholder="name@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">{isRtl ? "التخصص أو مجال التدريس" : "Specialty or teaching area"} <span className="text-blue-600">*</span></label>
                  <input type="text" required disabled={loading} value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={inputFieldClass} placeholder={isRtl ? "مثال: باثولوجي أو فسيولوجي" : "e.g. Pathology or Physiology"} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">{isRtl ? "الهاتف أو الواتساب" : "Phone or WhatsApp"}</label>
                  <input type="tel" disabled={loading} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputFieldClass} placeholder="+20..." />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">{isRtl ? "سنوات الخبرة" : "Years of experience"}</label>
                  <input type="text" disabled={loading} value={experience} onChange={(e) => setExperience(e.target.value)} className={inputFieldClass} placeholder={isRtl ? "مثال: 5 سنوات" : "e.g. 5 years"} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-700">{isRtl ? "السيرة الذاتية (رفع ملف أو رابط)" : "CV (upload or link)"}</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    disabled={loading}
                    className="mb-2 block w-full text-xs"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const fd = new FormData();
                        fd.append("cv", file);
                        const res = await client.post("/public/instructor-applications/cv", fd);
                        const url = res?.data?.data?.url;
                        if (url) {
                          setCvUrl(url.startsWith("http") ? url : `${window.location.origin}${url}`);
                          toast.success(isRtl ? "تم رفع الملف" : "CV uploaded");
                        }
                      } catch (err) {
                        toast.error(getErrorMessage(err, "CV upload failed"));
                      }
                    }}
                  />
                  <div className="relative">
                    <Link2 className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="url" disabled={loading} value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} className={`${inputFieldClass} ps-10`} placeholder="https://drive.google.com/..." />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-700">{isRtl ? "نبذة عن خبرتك ودافعك للانضمام" : "Your experience and motivation"} <span className="text-blue-600">*</span></label>
                <textarea rows={4} required disabled={loading} value={bio} onChange={(e) => setBio(e.target.value)} className={textAreaClass} placeholder={isRtl ? "تحدث باختصار عن خبرتك الأكاديمية والتعليمية وما الذي يمكنك تقديمه للطلاب..." : "Briefly describe your academic and teaching experience and what you can offer learners..."} />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" disabled={loading} onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">{isRtl ? "إلغاء" : "Cancel"}</button>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-600 disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isRtl ? "إرسال الطلب للمراجعة" : "Submit for review"}
                </button>
              </div>
            </form>
          </section>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
