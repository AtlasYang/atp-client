import { APP_NAME } from "../../common/constants";

import { BaseLayout } from "../../components/base-layout";
import ToolListHeader from "./tool-list-header";
import ToolsTable from "./tools-table";
import { useTranslation } from "react-i18next";

export default function ToolListPage() {
  const { t } = useTranslation([], { keyPrefix: "navigation-panel" });

  return (
    <BaseLayout
      breadcrumbs={[
        {
          text: APP_NAME,
          href: "/",
        },
        {
          text: t("tool-list"),
          href: "/tool-list",
        },
      ]}
    >
      <ToolListHeader />
      <div className="space-y-6 h-full overflow-y-auto">
        <ToolsTable />
      </div>
    </BaseLayout>
  );
}
