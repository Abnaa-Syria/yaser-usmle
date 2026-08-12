import CTA from "../components/CTA";
import Features from "../components/Features";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import RecommendedCourses from "../components/RecommendedCourses";
import Testimonials from "../components/Testimonials";
import FaqSection from "../components/FaqSection";
import HomeNewsBoard from "../components/HomeNewsBoard";
import { usePublicLandingPage } from "../features/public/hooks";
import { findLandingSection, pickLocalized } from "../utils/cmsLocale";
import { organizationJsonLd, useSeo } from "../utils/seo";
import { useTranslation } from "react-i18next";

function Home() {
  const { i18n } = useTranslation();
  const { data } = usePublicLandingPage();
  const sections = data?.sections || [];
  const heroSection = findLandingSection(sections, "HERO");
  const faqSection = findLandingSection(sections, "FAQ");
  const featuresSection = findLandingSection(sections, "FEATURES");
  const howSection = findLandingSection(sections, "HOW_IT_WORKS");
  const testimonialsSection = findLandingSection(sections, "TESTIMONIALS");
  const ctaSection = findLandingSection(sections, "CTA");
  const seoSection = findLandingSection(sections, "SEO");

  const showHero = sections.length === 0 || !heroSection || heroSection.isVisible !== false;
  /** Missing section → show defaults. Explicitly hidden → hide entirely (do not fall back). */
  const showSection = (section) => !section || section.isVisible !== false;

  const seoTitle =
    pickLocalized(seoSection?.content?.title, i18n.language) || "USMLE Step 1 Preparation";
  const seoDescription =
    pickLocalized(seoSection?.content?.description, i18n.language) ||
    "Prepare for USMLE Step 1 with Yaser USMLE courses, structured systems-based learning, quizzes, flashcards, and study planning tools.";

  useSeo({
    title: seoTitle,
    description: seoDescription,
    path: seoSection?.content?.path || "/",
    image: seoSection?.content?.ogImage || undefined,
    jsonLd: organizationJsonLd(),
  });

  return (
    <div className="overflow-hidden">
      {showHero ? <Hero cmsContent={heroSection?.content} stats={data?.stats} /> : null}
      {showSection(featuresSection) ? <Features cmsContent={featuresSection?.content} /> : null}
      <RecommendedCourses />
      {showSection(howSection) ? <HowItWorks cmsContent={howSection?.content} /> : null}
      <HomeNewsBoard />
      {showSection(testimonialsSection) ? <Testimonials cmsContent={testimonialsSection?.content} /> : null}
      {showSection(faqSection) ? <FaqSection rawContent={faqSection?.content} /> : null}
      {showSection(ctaSection) ? <CTA cmsContent={ctaSection?.content} /> : null}
    </div>
  );
}

export default Home;
