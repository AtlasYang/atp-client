import DashboardHeader from "./dashboard-header";
import ItemsTable from "./items-table";
import { BaseLayout } from "../../components/base-layout";
import { APP_NAME } from "../../common/constants";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation([], { keyPrefix: "navigation-panel" });

  return (
    <BaseLayout
      breadcrumbs={[
        { text: APP_NAME, href: "/" },
        { text: t("dashboard"), href: "/" },
      ]}
    >
      <DashboardHeader />
      <div className="space-y-6">
        <ItemsTable />
      </div>
    </BaseLayout>
  );
}
