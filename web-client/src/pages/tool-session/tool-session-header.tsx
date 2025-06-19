import { useTranslation } from "react-i18next";

export default function ToolSessionHeader() {
  const { t } = useTranslation(["tool"]);

  return (
    <header className="pt-4 pb-4 text-2xl font-normal">
      {t("session.title")}
      <p className="text-sm font-normal text-muted-foreground">
        {t("session.description")}
      </p>
    </header>
  );
}
