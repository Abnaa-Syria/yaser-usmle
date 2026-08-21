import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone, ChevronRight, ChevronLeft } from "lucide-react";
import { usePublicCmsPage } from "../features/public/hooks";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import { parseCmsSections } from "../utils/cmsLocale";
import ContactForm from "../components/ContactForm";
import TelegramJoinButtons from "../components/TelegramJoinButtons";
import BecomeInstructorModal from "../components/BecomeInstructorModal";
import { useSeo } from "../utils/seo";
import { resolveBrandAssetUrl } from "../components/BrandLogo";

function SectionBlock({ section, isRtl }) {
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  const imageUrl = section.imageUrl ? resolveBrandAssetUrl(section.imageUrl) : "";
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-48 w-full object-cover md:h-56" />
      ) : null}
      <div className="p-6 md:p-8">
        {section.heading ? (
          <h2 className="text-lg font-extrabold text-slate-900 md:text-xl">{section.heading}</h2>
        ) : null}
        {section.body ? (
          <p className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-600 md:text-base ${section.heading ? "mt-3" : ""}`}>
            {section.body}
          </p>
        ) : null}
        {section.listItems?.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {section.listItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <Chevron className="mt-0.5 h-4 w-4 shrink-0 text-[var(--yu-blue-700)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export default function StaticContentPage({ slug, showContactInfo = false, extraActions = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const { data: page, isLoading, isError } = usePublicCmsPage(slug);
  const { settings: site } = useSiteSettings();

  const title = page ? (isRtl ? page.titleAr || page.titleEn : page.titleEn || page.titleAr) : "";
  const subtitle = page
    ? isRtl
      ? page.subtitleAr || page.subtitleEn
      : page.subtitleEn || page.subtitleAr
    : "";
  const sections = parseCmsSections(isRtl ? page?.sectionsAr : page?.sectionsEn);
  const fallbackSections = parseCmsSections(isRtl ? page?.sectionsEn : page?.sectionsAr);
  const displaySections = sections.length > 0 ? sections : fallbackSections;
  const mailto = site.contactEmail ? `mailto:${site.contactEmail}` : null;
  const locationText =
    (isRtl ? site.footerLocationAr || site.footerLocationEn : site.footerLocationEn || site.footerLocationAr) ||
    t("footer.brand.location", { defaultValue: isRtl ? "القاهرة، مصر" : "Cairo, Egypt" });

  const path =
    slug === "user-guide" ? "/guide" : slug === "refund-policy" ? "/refund-policy" : `/${slug}`;

  useSeo({
    title: title || slug,
    description:
      subtitle ||
      t("publicPage.defaultDescription", {
        defaultValue: "Learn more about Yaser USMLE programs, policies, and student support.",
      }),
    path,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="transition hover:text-[var(--yu-blue-700)]">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{title || t("dashboard.common.loading")}</span>
        </nav>

        <header className="mt-4 border-b border-slate-200/80 pb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title || "—"}</h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">{subtitle}</p>
          ) : null}
        </header>

        {(showContactInfo || slug === "contact") && (site.contactEmail || site.phoneNumber || locationText) ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {site.contactEmail ? (
              <a
                href={mailto}
                className="flex items-start gap-3 rounded-2xl border border-[var(--yu-blue-700)]/20 bg-[var(--yu-blue-700)]/5 p-5 transition hover:border-[var(--yu-blue-700)]/40"
              >
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("publicContact.emailLabel", { defaultValue: isRtl ? "البريد الإلكتروني" : "Email" })}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{site.contactEmail}</p>
                </div>
              </a>
            ) : null}
            {site.phoneNumber ? (
              <a
                href={`tel:${site.phoneNumber}`}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[var(--yu-blue-700)]/30"
              >
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("publicContact.phoneLabel", { defaultValue: isRtl ? "الهاتف" : "Phone" })}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{site.phoneNumber}</p>
                </div>
              </a>
            ) : null}
            {locationText ? (
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("publicContact.locationLabel", { defaultValue: isRtl ? "الموقع" : "Location" })}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{locationText}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-10 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
            {t("publicPage.loadError", { defaultValue: isRtl ? "تعذّر تحميل الصفحة." : "Could not load this page." })}
          </div>
        ) : null}

        {!isLoading && !isError && displaySections.length > 0 ? (
          <div className="mt-10 space-y-5">
            {displaySections.map((section) => (
              <SectionBlock key={section.id} section={section} isRtl={isRtl} />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && displaySections.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            {t("publicPage.empty", { defaultValue: isRtl ? "المحتوى قيد الإعداد." : "Content is being prepared." })}
          </div>
        ) : null}

        {slug === "contact" ? (
          <div className="mt-10 space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,.07)] md:p-8">
              <h2 className="text-lg font-black text-slate-950">
                {t("publicContact.telegramTitle", {
                  defaultValue: isRtl ? "تواصل عبر التليجرام" : "Reach us on Telegram",
                })}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {t("publicContact.telegramSubtitle", {
                  defaultValue: isRtl
                    ? "انضم للقناة أو المجموعة لمتابعة التحديثات وطرح الأسئلة."
                    : "Join the channel or community group for updates and questions.",
                })}
              </p>
              <div className="mt-4">
                <TelegramJoinButtons />
              </div>
            </div>
            <ContactForm />
          </div>
        ) : null}

        {extraActions ? <div className="mt-10">{extraActions}</div> : null}

        {slug === "library" ? (
          <div className="mt-10 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--yu-blue-700)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
            >
              {t("footer.community.courses", { defaultValue: isRtl ? "تصفح الدورات" : "Browse courses" })}
            </Link>
          </div>
        ) : null}

        {slug === "teach" ? (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setInstructorModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--yu-blue-700)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--yu-blue-600)]"
            >
              {t("publicTeach.applyCta", { defaultValue: isRtl ? "قدّم طلبك الآن" : "Apply now" })}
            </button>
          </div>
        ) : null}

        {instructorModalOpen ? <BecomeInstructorModal onClose={() => setInstructorModalOpen(false)} /> : null}
      </div>
    </div>
  );
}
