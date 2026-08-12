import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, ZoomIn } from "lucide-react";
import { pickLocalized } from "../utils/cmsLocale";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

const AvatarPlaceholder = ({ index, imageUrl, name }) => {
  const avatarSrc = resolveMediaUrl(imageUrl);
  if (avatarSrc) {
    return <img src={avatarSrc} alt={name || ""} className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-sm" />;
  }
  const colors = [
    "from-orange-100 to-amber-200 text-orange-600 border-orange-200/50",
    "from-blue-100 to-indigo-200 text-blue-600 border-blue-200/50",
    "from-emerald-100 to-teal-200 text-emerald-600 border-emerald-200/50",
    "from-purple-100 to-pink-200 text-purple-600 border-purple-200/50",
    "from-rose-100 to-red-200 text-rose-600 border-rose-200/50",
    "from-cyan-100 to-sky-200 text-cyan-600 border-cyan-200/50",
  ];
  const initials = ["YF", "AM", "TH", "LS", "MZ", "SA"];
  const selected = colors[index % colors.length];
  return (
    <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${selected} border flex items-center justify-center font-extrabold text-sm shrink-0 select-none shadow-sm`}>
      {initials[index % initials.length]}
    </div>
  );
};

function StarRating({ rating }) {
  const count = Math.max(1, Math.min(5, rating || 5));
  return (
    <div className="flex items-center text-amber-400 gap-0.5 shrink-0">
      {[...Array(count)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ item, index, onOpen }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const screenshotSrc = resolveMediaUrl(item.screenshotUrl);
  const viewLabel = isRtl ? "اضغط لعرض الرأي كاملاً" : "Click to view full review";

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="w-[360px] mx-4 bg-white border border-slate-200/80 p-0 rounded-3xl flex flex-col overflow-hidden shadow-xs hover:scale-[1.02] hover:border-[var(--yu-blue-700)]/40 transition-all duration-300 cursor-pointer text-left group"
      aria-label={viewLabel}
    >
      {screenshotSrc ? (
        <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
          <img src={screenshotSrc} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
          <div className="absolute inset-0 bg-[#06152f]/0 group-hover:bg-[#06152f]/35 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg">
              <ZoomIn className="h-3.5 w-3.5" />
              {viewLabel}
            </span>
          </div>
        </div>
      ) : null}
      <div className={`flex flex-col gap-3 ${screenshotSrc ? "p-5 pt-4" : "p-6"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarPlaceholder index={index} imageUrl={item.imageUrl} name={item.name} />
            <div className="min-w-0">
              <h4 className="font-extrabold text-sm text-slate-900 leading-none font-sans truncate">{item.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 font-sans truncate">{item.role}</p>
            </div>
          </div>
          <StarRating rating={item.rating} />
        </div>
        <p className={`text-sm text-slate-600 leading-relaxed font-sans ${screenshotSrc ? "line-clamp-2" : "line-clamp-4"}`}>"{item.text}"</p>
        {!screenshotSrc ? (
          <span className="text-[11px] font-bold text-[var(--yu-blue-700)]">{viewLabel}</span>
        ) : null}
      </div>
    </button>
  );
}

function TestimonialModal({ item, onClose }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const screenshotSrc = resolveMediaUrl(item?.screenshotUrl);
  const avatarSrc = resolveMediaUrl(item?.imageUrl);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06152f]/70 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="testimonial-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-white shadow-[0_35px_100px_rgba(0,0,0,.35)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          aria-label={isRtl ? "إغلاق" : "Close"}
        >
          <X className="h-4 w-4" />
        </button>

        {screenshotSrc ? (
          <div className="w-full bg-slate-100">
            <img src={screenshotSrc} alt="" className="w-full max-h-[min(55vh,520px)] object-contain object-center mx-auto" />
          </div>
        ) : null}

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 pe-10">
            {avatarSrc ? (
              <img src={avatarSrc} alt={item.name || ""} className="h-14 w-14 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
            ) : (
              <AvatarPlaceholder index={0} imageUrl="" name={item.name} />
            )}
            <div className="min-w-0 flex-1">
              <h3 id="testimonial-modal-title" className="text-xl font-black text-slate-950 font-sans">
                {item.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-sans">{item.role}</p>
              <div className="mt-2">
                <StarRating rating={item.rating} />
              </div>
            </div>
          </div>
          <blockquote className="mt-6 text-base sm:text-lg text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">"{item.text}"</blockquote>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({ cmsContent = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const [activeItem, setActiveItem] = useState(null);
  const c = cmsContent && typeof cmsContent === "object" ? cmsContent : null;

  const titlePrefix = pickLocalized(c?.titlePrefix, lang) || t("testimonials.titlePrefix", { defaultValue: isRtl ? "ماذا يقول" : "What Our" });
  const titleAccent = pickLocalized(c?.titleAccent, lang) || t("testimonials.titleAccent", { defaultValue: isRtl ? "طلابنا؟" : "Students Say" });
  const subtitle =
    pickLocalized(c?.subtitle, lang) ||
    t("testimonials.subtitle", {
      defaultValue: isRtl
        ? "استمع إلى طلاب الطب الذين عززوا أساسياتهم وطوروا أداءهم في الأسئلة ودخلوا فترة المراجعة بثقة."
        : "Hear from medical students who improved their foundations, question performance, and study confidence.",
    });

  const cmsItems = Array.isArray(c?.items) ? c.items : [];
  const testimonialsList =
    cmsItems.length > 0
      ? cmsItems.map((item, i) => ({
          id: item.id || `t-${i}`,
          name: pickLocalized(item.name, lang),
          role: pickLocalized(item.role, lang),
          text: pickLocalized(item.text, lang),
          imageUrl: item.imageUrl || "",
          screenshotUrl: item.screenshotUrl || "",
          rating: Number(item.rating) || 5,
        }))
      : [1, 2, 3, 4, 5, 6].map((n) => ({
          id: `fallback-${n}`,
          name: t(`testimonials.items.item${n}.name`),
          role: t(`testimonials.items.item${n}.role`),
          text: t(`testimonials.items.item${n}.text`),
          imageUrl: "",
          screenshotUrl: "",
          rating: 5,
        }));

  const listTrackA = [...testimonialsList, ...testimonialsList];
  const listTrackB = [...testimonialsList, ...testimonialsList];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(238,124,17,0.03),transparent)] pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mb-14 relative z-10 text-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl lg:text-5xl font-sans">
          {titlePrefix} <span className="text-[var(--yu-blue-700)]">{titleAccent}</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600 leading-relaxed">{subtitle}</p>
      </div>
      <div className="w-full flex flex-col gap-6 overflow-hidden py-4 pause-scroll relative z-10" dir="ltr">
        <div className="flex animate-marquee-left select-none">
          {listTrackA.map((item, idx) => (
            <TestimonialCard key={`a-${item.id}-${idx}`} item={item} index={idx} onOpen={setActiveItem} />
          ))}
        </div>
        <div className="flex animate-marquee-right select-none">
          {listTrackB.map((item, idx) => (
            <TestimonialCard key={`b-${item.id}-${idx}`} item={item} index={idx + 3} onOpen={setActiveItem} />
          ))}
        </div>
      </div>
      {activeItem ? <TestimonialModal item={activeItem} onClose={() => setActiveItem(null)} /> : null}
    </section>
  );
}
