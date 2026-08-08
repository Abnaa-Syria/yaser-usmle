import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function LearningStyle() {
  const { t } = useTranslation();

  const cohortFeatures = ["affordable", "peerInteractions", "community"];
  const privateFeatures = ["curriculum", "flexible", "progress"];

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

        {/* Header */}
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {t("learningStyle.titlePrefix")}{" "}
            <span className="text-yu-blue-700">{t("learningStyle.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-base text-slate-500">{t("learningStyle.subtitle")}</p>
        </header>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Card 1 — Live cohorts */}
          <article className="flex flex-col rounded-2xl border border-slate-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-yu-blue-100 text-yu-blue-700">
              <GroupIcon />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-900 text-start">
              {t("learningStyle.cards.cohorts.title")}
            </h3>
            <p className="mt-3 text-start text-sm leading-6 text-slate-500">
              {t("learningStyle.cards.cohorts.description")}
            </p>
            <ul className="mt-5 space-y-2.5">
              {cohortFeatures.map((k) => (
                <li key={k} className="flex items-center gap-3 text-sm text-slate-700 text-start">
                  <Check className="h-4 w-4 shrink-0 text-yu-blue-700" />
                  {t(`learningStyle.cards.cohorts.features.${k}`)}
                </li>
              ))}
            </ul>
            <Link
              to="/explore"
              className="mt-8 w-full rounded-xl bg-yu-blue-700 py-3 text-center text-sm font-semibold text-white transition hover:bg-yu-blue-600"
            >
              {t("learningStyle.cards.cohorts.button")}
            </Link>
          </article>

          {/* Card 2 — Private sessions */}
          <article className="flex flex-col rounded-2xl border border-slate-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-yu-blue-100 text-yu-blue-500-normal">
              <UserIcon />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-900 text-start">
              {t("learningStyle.cards.privateSessions.title")}
            </h3>
            <p className="mt-3 text-start text-sm leading-6 text-slate-500">
              {t("learningStyle.cards.privateSessions.description")}
            </p>
            <ul className="mt-5 space-y-2.5">
              {privateFeatures.map((k) => (
                <li key={k} className="flex items-center gap-3 text-sm text-slate-700 text-start">
                  <Check className="h-4 w-4 shrink-0 text-yu-blue-500-normal" />
                  {t(`learningStyle.cards.privateSessions.features.${k}`)}
                </li>
              ))}
            </ul>
            <Link
              to="/explore"
              className="mt-8 w-full rounded-xl bg-yu-blue-500-normal py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-yu-blue-600"
            >
              {t("learningStyle.cards.privateSessions.button")}
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
