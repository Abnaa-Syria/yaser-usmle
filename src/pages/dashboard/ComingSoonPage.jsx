import { useTranslation } from "react-i18next";
import EmptyState from "../../components/dashboard/EmptyState";
import PageHeader from "../../components/dashboard/PageHeader";

function ComingSoonPage({ titleKey, subtitleKey }) {
  const { t } = useTranslation();
  return (
    <section>
      <PageHeader title={t(titleKey)} subtitle={t(subtitleKey)} />
      <EmptyState title={t("dashboard.common.comingSoon")} message={t("dashboard.common.comingSoonDescription")} />
    </section>
  );
}

export default ComingSoonPage;
