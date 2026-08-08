import { useTranslation } from "react-i18next";

function SectionLabel({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <div className="mb-2 mt-5 px-4">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {t(label)}
      </p>
    </div>
  );
}

export default SectionLabel;

