import { Client } from "../../service/client/interface";
import { isOk, unwrapOrThrow } from "../../service/service-wrapper";
import { useService } from "../../service/use-service";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardHeader() {
  const { t } = useTranslation();
  const { clientService } = useService();

  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      const res = await clientService.getCurrentClient();
      if (isOk(res)) setClient(unwrapOrThrow(res));
    };
    fetchClient();
  }, []);

  return (
    <header className="flex flex-col pt-4 pb-4 text-2xl font-normal">
      <div className="flex flex-row">
        {`${t("navigation-panel.welcome")}, ${client?.name}!`}
      </div>
    </header>
  );
}
