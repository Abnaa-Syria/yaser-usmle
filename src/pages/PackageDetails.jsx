import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, PackageOpen } from "lucide-react";
import { usePublicPackage } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { useSeo, absoluteUrl } from "../utils/seo";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

function durationLabel(tier) {
  if (!tier) return "Lifetime";
  if (tier.durationValue && tier.durationUnit) {
    return `${tier.durationValue} ${String(tier.durationUnit).toLowerCase()}${tier.durationValue === 1 ? "" : "s"}`;
  }
  if (tier.durationDays) return `${tier.durationDays} days`;
  return "Lifetime";
}

export default function PackageDetails() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language?.startsWith("ar");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = normalizeRole(useAuthStore((s) => s.user)?.role);
  const { data: pkg, isLoading, isError } = usePublicPackage(id);
  const tiers = useMemo(() => pkg?.pricingTiers || [], [pkg?.pricingTiers]);
  const [selectedTierId, setSelectedTierId] = useState("");

  const selectedTier = useMemo(() => tiers.find((tier) => tier.id === selectedTierId) || tiers[0] || null, [tiers, selectedTierId]);
  const title = pkg ? (isRtl ? pkg.titleAr || pkg.title : pkg.title) : t("subscription.titleAccent", { defaultValue: "Packages" });
  const description = pkg ? (isRtl ? pkg.shortDescriptionAr || pkg.descriptionAr || pkg.shortDescription || pkg.description : pkg.shortDescription || pkg.description) : "";

  useSeo({
    title,
    description: description || "Choose a Yaser USMLE course bundle and request access through manual payment review.",
    path: id ? `/packages/${id}` : "/packages",
    image: resolveMediaUrl(pkg?.coverImage) || undefined,
    jsonLd: pkg
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: title,
          description,
          url: absoluteUrl(`/packages/${id}`),
          offers: selectedTier
            ? {
                "@type": "Offer",
                price: Number(selectedTier.price || pkg.price || 0),
                priceCurrency: selectedTier.currency || pkg.currency || "USD",
                availability: "https://schema.org/InStock",
              }
            : undefined,
        }
      : undefined,
  });

  const startCheckout = () => {
    if (!pkg?.id) return;
    const qs = new URLSearchParams({ packageId: pkg.id });
    if (selectedTier?.id) qs.set("pricingTierId", selectedTier.id);
    const path = `/student/checkout?${qs.toString()}`;
    if (!isAuthenticated || role !== APP_ROLES.STUDENT) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  if (isLoading) return <div className="py-20 text-center text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</div>;
  if (isError || !pkg) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <PackageOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("subscription.empty", { defaultValue: "Package not found." })}</h1>
        <Link to="/packages" className="mt-6 inline-block font-semibold text-yu-blue-700 hover:underline">
          {t("subscription.titleAccent", { defaultValue: "Packages" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <main className="space-y-8">
          <nav className="text-sm text-slate-500">
            <Link to="/" className="transition hover:text-yu-blue-700">{t("header.nav.home")}</Link>
            <span className="mx-2">/</span>
            <Link to="/packages" className="transition hover:text-yu-blue-700">{t("header.nav.packages", { defaultValue: "Packages" })}</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-800">{title}</span>
          </nav>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title}</h1>
            {description ? <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{description}</p> : null}
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold text-slate-900">{t("subscription.includedCourses", { defaultValue: "Included courses" })}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(pkg.courses || []).map((item) => (
                <Link key={item.courseId || item.course?.id} to={item.course?.id ? `/courses/${item.course.id}` : "#"} className="rounded-2xl border border-slate-200 p-4 transition hover:border-yu-blue-700">
                  <p className="font-bold text-slate-900">{isRtl ? item.course?.titleAr || item.course?.title : item.course?.title}</p>
                  {item.course?.shortDescription ? <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.course.shortDescription}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">{t("courseDetails.pricing.title", { defaultValue: "Access options" })}</h2>
          <div className="mt-4 space-y-3">
            {tiers.length ? (
              tiers.map((tier) => (
                <label key={tier.id} className={`block cursor-pointer rounded-2xl border p-4 ${selectedTier?.id === tier.id ? "border-yu-blue-700 bg-yu-blue-100/40" : "border-slate-200"}`}>
                  <input type="radio" name="tier" value={tier.id} checked={selectedTier?.id === tier.id} onChange={() => setSelectedTierId(tier.id)} className="sr-only" />
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-bold text-slate-900">{isRtl ? tier.nameAr || tier.name : tier.name}</span>
                      <span className="text-xs text-slate-500">{durationLabel(tier)}</span>
                    </span>
                    <span className="font-black text-yu-blue-700">{Number(tier.price || 0).toFixed(0)} {tier.currency || pkg.currency || "USD"}</span>
                  </span>
                </label>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="font-black text-yu-blue-700">{Number(pkg.price || 0).toFixed(0)} {pkg.currency || "USD"}</p>
              </div>
            )}
          </div>
          <button type="button" onClick={startCheckout} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yu-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-yu-blue-600">
            <CheckCircle2 className="h-4 w-4" />
            {t("subscription.getStarted", { defaultValue: "Get started" })}
          </button>
        </aside>
      </div>
    </div>
  );
}
