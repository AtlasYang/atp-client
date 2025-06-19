import { APP_NAME } from "../../common/constants";

import { BaseLayout } from "../../components/base-layout";
import { useTranslation } from "react-i18next";
import ToolSessionHeader from "./tool-session-header";
import ToolSessionTable from "./tool-session-table";

export default function ToolSessionPage() {
  const { t } = useTranslation([], { keyPrefix: "navigation-panel" });

  return (
    <BaseLayout
      breadcrumbs={[
        {
          text: APP_NAME,
          href: "/",
        },
        {
          text: t("tool-session"),
          href: "/tool-session",
        },
      ]}
    >
      <ToolSessionHeader />
      <div className="space-y-6">
        <ToolSessionTable />
      </div>
    </BaseLayout>
  );
}
