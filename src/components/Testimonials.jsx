import { useTranslation } from "react-i18next";
import { pickLocalized } from "../utils/cmsLocale";

const AvatarPlaceholder = ({ index, imageUrl, name }) => {
  if (imageUrl) {
    return <img src={imageUrl} alt={name || ""} className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-sm" />;
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

export default function Testimonials({ cmsContent = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
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
      ? cmsItems.map((item) => ({
          name: pickLocalized(item.name, lang),
          role: pickLocalized(item.role, lang),
          text: pickLocalized(item.text, lang),
          imageUrl: item.imageUrl || "",
          rating: Number(item.rating) || 5,
        }))
      : [1, 2, 3, 4, 5, 6].map((n) => ({
          name: t(`testimonials.items.item${n}.name`),
          role: t(`testimonials.items.item${n}.role`),
          text: t(`testimonials.items.item${n}.text`),
          imageUrl: "",
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
            <div key={`a-${idx}`} className="w-[360px] mx-4 bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col gap-3 shadow-xs hover:scale-[1.02] hover:border-[var(--yu-blue-700)]/40 transition-all duration-300 cursor-pointer text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarPlaceholder index={idx} imageUrl={item.imageUrl} name={item.name} />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-none font-sans">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">{item.role}</p>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 gap-0.5 shrink-0">
                  {[...Array(Math.max(1, Math.min(5, item.rating || 5)))].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans mt-2">"{item.text}"</p>
            </div>
          ))}
        </div>
        <div className="flex animate-marquee-right select-none">
          {listTrackB.map((item, idx) => (
            <div key={`b-${idx}`} className="w-[360px] mx-4 bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col gap-3 shadow-xs hover:scale-[1.02] hover:border-[var(--yu-blue-700)]/40 transition-all duration-300 cursor-pointer text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarPlaceholder index={idx + 3} imageUrl={item.imageUrl} name={item.name} />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-none font-sans">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">{item.role}</p>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 gap-0.5 shrink-0">
                  {[...Array(Math.max(1, Math.min(5, item.rating || 5)))].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans mt-2">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
