import { APP_NAME } from "../../common/constants";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../styles/tool.module.scss";
import { useTranslation } from "react-i18next";
import ToolOutputHeader from "./tool-output-header";
import { BaseLayout } from "../../components/base-layout";
import { ToolInteractionElement } from "../../service/tool/interface";

export default function ToolOutputPage() {
  const [toolOutput, setToolOutput] = useState<ToolInteractionElement[] | null>(null);
  const { toolId, sessionId } = useParams();
  const { t } = useTranslation(["tool"]);
  const location = useLocation();

  //TODO
  const responseData = location.state?.response_data;

  useEffect(() => {
    console.log(responseData);
    if (responseData) {
      setToolOutput(responseData);
    }
  }, [responseData]);

  return (
    <BaseLayout
      breadcrumbs={[
        {
          text: APP_NAME,
          href: "/",
        },
        {
          text: t("tool-output.title"),
          href: `/tool-output/${sessionId}/${toolId}`,
        },
      ]}
    >
      <ToolOutputHeader />
      <>
        {toolOutput ? (
          <div className={styles.tool_container}>
            <p className={styles.tool_output_title}>
              {toolOutput.map((item) => (
                <div key={item.interface_id}>
                  <p>{item.interface_id}</p>
                  <p>{JSON.stringify(item.content)}</p>
                </div>
              ))}
            </p>
          </div>
        ) : (
          <div>Waiting for the result</div>
        )}
      </>
    </BaseLayout>
  );
}
