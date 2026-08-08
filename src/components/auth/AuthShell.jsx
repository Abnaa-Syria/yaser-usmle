import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap, Brain, ShieldCheck, ArrowLeft, ArrowRight, Sparkles, Activity, Check } from "lucide-react";
import BrandLogo from "../BrandLogo";

const highlights = [
  { icon: GraduationCap, key: "auth.shell.highlight1" },
  { icon: Brain, key: "auth.shell.highlight2" },
  { icon: ShieldCheck, key: "auth.shell.highlight3" },
];

export default function AuthShell({ title, subtitle, footer, children }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#edf3fa] p-0 text-slate-950 lg:p-5">
      <div className="mx-auto grid min-h-screen max-w-[1500px] overflow-hidden bg-white shadow-[0_30px_100px_rgba(15,23,42,.13)] lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.08fr_.92fr] lg:rounded-[2rem]">
        <section className="relative hidden overflow-hidden bg-[#071a38] p-10 text-white lg:flex lg:flex-col xl:p-14" aria-label={isRtl ? "معلومات المنصة" : "Platform information"}>
          <div className="pointer-events-none absolute -start-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-500/25 blur-[110px]" aria-hidden />
          <div className="pointer-events-none absolute -end-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-[100px]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "58px 58px" }} aria-hidden />

          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="inline-flex w-fit transition-opacity hover:opacity-80"><BrandLogo variant="light" className="h-12 w-auto" /></Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-2 text-[9px] font-black tracking-[.12em] text-cyan-200"><Activity className="h-3.5 w-3.5" />STEP 1</span>
          </div>

          <div className="relative z-10 my-auto max-w-xl py-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-cyan-300"><Sparkles className="h-3.5 w-3.5" />{t("auth.shell.eyebrow")}</span>
            <h1 className="mt-5 text-4xl font-black leading-[1.12] tracking-[-0.045em] xl:text-5xl">{t("auth.shell.headline")}</h1>
            <p className="mt-6 max-w-lg text-sm font-medium leading-8 text-slate-300">{t("auth.shell.body")}</p>

            <ul className="mt-9 grid gap-3">
              {highlights.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3.5 backdrop-blur-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-[#071a38]"><Icon className="h-4 w-4" aria-hidden /></span>
                  <span className="text-xs font-bold text-slate-200">{t(key)}</span>
                  <Check className="ms-auto h-4 w-4 text-cyan-300" />
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[9px] font-bold text-slate-500">
            <span>© {new Date().getFullYear()} Yaser USMLE</span>
            <span>{t("auth.shell.secureAccess")}</span>
          </div>
        </section>

        <section className="flex min-h-screen flex-col bg-white px-5 py-6 sm:px-10 lg:min-h-0 lg:px-14 xl:px-20">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-blue-700">
              <Arrow className="h-4 w-4" />{t("auth.shell.backHome")}
            </Link>
            <select
              value={i18n.language?.startsWith("ar") ? "ar" : "en"}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
              aria-label={isRtl ? "اختيار اللغة" : "Choose language"}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="mx-auto flex w-full max-w-[470px] flex-1 flex-col justify-center py-10">
            <Link to="/" className="mb-10 inline-flex w-fit lg:hidden"><BrandLogo variant="primary" className="h-11 w-auto" /></Link>
            <div className="mb-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><GraduationCap className="h-5 w-5" /></span>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] text-slate-950">{title}</h2>
              {subtitle ? <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{subtitle}</p> : null}
            </div>
            {children}
            {footer ? <div className="mt-7 border-t border-slate-100 pt-6">{footer}</div> : null}
          </div>

          <div className="flex items-center justify-center gap-2 pb-2 text-[9px] font-bold text-slate-400 lg:hidden"><ShieldCheck className="h-3.5 w-3.5" />{t("auth.shell.secureAccess")}</div>
        </section>
      </div>
    </div>
  );
}
