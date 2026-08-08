import { useTranslation } from "react-i18next";

const AvatarPlaceholder = ({ index }) => {
  const colors = [
    "from-orange-100 to-amber-200 text-orange-600 border-orange-200/50",
    "from-blue-100 to-indigo-200 text-blue-600 border-blue-200/50",
    "from-emerald-100 to-teal-200 text-emerald-600 border-emerald-200/50",
    "from-purple-100 to-pink-200 text-purple-600 border-purple-200/50",
    "from-rose-100 to-red-200 text-rose-600 border-rose-200/50",
    "from-cyan-100 to-sky-200 text-cyan-600 border-cyan-200/50"
  ];
  const initials = ["YF", "AM", "TH", "LS", "MZ", "SA"];
  const selected = colors[index % colors.length];
  
  return (
    <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${selected} border flex items-center justify-center font-extrabold text-sm shrink-0 select-none shadow-sm`}>
      {initials[index % initials.length]}
    </div>
  );
};

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  const testimonialsList = [
    {
      name: t("testimonials.items.item1.name", { defaultValue: isRtl ? "يوسف فتحي" : "Youssef Fathy" }),
      role: t("testimonials.items.item1.role", { defaultValue: isRtl ? "طالب طب في السنة الثالثة" : "Third-Year Medical Student" }),
      text: t("testimonials.items.item1.text", { defaultValue: isRtl ? "ربطت دورة القلب بين الفسيولوجيا والباثولوجي والفارماكولوجي بطريقة جعلت أسئلة الامتحان أسهل بكثير." : "The cardiovascular course connected physiology, pathology, and pharmacology in a way that made board-style questions manageable." })
    },
    {
      name: t("testimonials.items.item2.name", { defaultValue: isRtl ? "أمينة منصور" : "Amina Mansour" }),
      role: t("testimonials.items.item2.role", { defaultValue: isRtl ? "طالبة طب تستعد لـ Step 1" : "Medical Student Preparing for Step 1" }),
      text: t("testimonials.items.item2.text", { defaultValue: isRtl ? "حوّلت دروس الكلى والأحماض والقواعد موضوعاً صعباً إلى إطار واضح أطبقه بسرعة على أسئلة التدريب." : "The renal and acid–base lessons turned a difficult topic into a clear framework for practice questions." })
    },
    {
      name: t("testimonials.items.item3.name", { defaultValue: isRtl ? "طارق حجازي" : "Tarek Hegazi" }),
      role: t("testimonials.items.item3.role", { defaultValue: isRtl ? "طالب طب في السنة الرابعة" : "Fourth-Year Medical Student" }),
      text: t("testimonials.items.item3.text", { defaultValue: isRtl ? "كشفت لي الاختبارات الأسبوعية والشروحات المفصلة مواضع الخطأ في طريقة تفكيري وكيفية تصحيحها." : "Weekly quizzes and detailed explanations showed me where my reasoning broke down and how to fix it." })
    },
    {
      name: t("testimonials.items.item4.name", { defaultValue: isRtl ? "ليلى شاهين" : "Laila Shaheen" }),
      role: t("testimonials.items.item4.role", { defaultValue: isRtl ? "طالبة طب دولية" : "International Medical Student" }),
      text: t("testimonials.items.item4.text", { defaultValue: isRtl ? "ساعدني الشرح ثنائي اللغة على فهم المفاهيم بعمق مع الاعتياد على مصطلحات الامتحان الإنجليزية." : "The bilingual explanations helped me understand concepts deeply while learning English exam terminology." })
    },
    {
      name: t("testimonials.items.item5.name", { defaultValue: isRtl ? "محمود زكي" : "Mahmoud Zaki" }),
      role: t("testimonials.items.item5.role", { defaultValue: isRtl ? "طبيب امتياز" : "Medical Intern" }),
      text: t("testimonials.items.item5.text", { defaultValue: isRtl ? "ساعدتني خطة المذاكرة المرنة والمراجعات المركزة على الاستمرار إلى جانب جدول التدريب السريري المزدحم." : "The flexible study plan and concise reviews kept me consistent alongside a demanding clinical schedule." })
    },
    {
      name: t("testimonials.items.item6.name", { defaultValue: isRtl ? "سارة العتيبي" : "Sarah Al-Otaibi" }),
      role: t("testimonials.items.item6.role", { defaultValue: isRtl ? "طالبة تستعد لـ Step 1" : "Step 1 Candidate" }),
      text: t("testimonials.items.item6.text", { defaultValue: isRtl ? "منحتني وحدات الأنظمة المنظمة والفلاش كاردز وتتبع التقدم البنية التي كانت تنقص فترة المراجعة المكثفة." : "The organized system modules, flashcards, and progress tracking gave my dedicated period the structure it needed." })
    }
  ];

  // Double list for seamless marquee scroll loop
  const listTrackA = [...testimonialsList, ...testimonialsList];
  const listTrackB = [...testimonialsList, ...testimonialsList];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Soft orange grid highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(238,124,17,0.03),transparent)] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mb-14 relative z-10 text-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl lg:text-5xl font-sans">
          {t("testimonials.titlePrefix", { defaultValue: isRtl ? "ماذا يقول" : "What Our" })}{" "}
          <span className="text-[var(--yu-blue-700)]">{t("testimonials.titleAccent", { defaultValue: isRtl ? "طلابنا؟" : "Students Say" })}</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600 leading-relaxed">
          {t("testimonials.subtitle", { defaultValue: isRtl ? "استمع إلى طلاب الطب الذين عززوا أساسياتهم وطوروا أداءهم في الأسئلة ودخلوا فترة المراجعة بثقة." : "Hear from medical students who improved their foundations, question performance, and study confidence." })}
        </p>
      </div>

      {/* Ticker Container Wrapper with pause-scroll hover controls */}
      <div className="w-full flex flex-col gap-6 overflow-hidden py-4 pause-scroll relative z-10" dir="ltr">
        
        {/* Track A: Scrolls Left */}
        <div className="flex animate-marquee-left select-none">
          {listTrackA.map((t, idx) => (
            <div
              key={idx}
              className="w-[360px] mx-4 bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col gap-3 shadow-xs hover:scale-[1.02] hover:border-[var(--yu-blue-700)]/40 transition-all duration-300 cursor-pointer text-left"
            >
              {/* Header: User Info & Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarPlaceholder index={idx} />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-none font-sans">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      {t.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-slate-600 leading-relaxed font-sans mt-2">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Track B: Scrolls Right */}
        <div className="flex animate-marquee-right select-none">
          {listTrackB.map((t, idx) => (
            <div
              key={idx}
              className="w-[360px] mx-4 bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col gap-3 shadow-xs hover:scale-[1.02] hover:border-[var(--yu-blue-700)]/40 transition-all duration-300 cursor-pointer text-left"
            >
              {/* Header: User Info & Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarPlaceholder index={idx + 3} />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-none font-sans">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      {t.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-slate-600 leading-relaxed font-sans mt-2">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
