import { useTranslation } from "react-i18next";

export default function ToolOutputHeader() {
  const { t } = useTranslation(["tool"]);

  return (
    <header className="pt-2 pb-4 text-2xl font-bold">
      {t("tool-output.title")}
    </header>
  );
}
