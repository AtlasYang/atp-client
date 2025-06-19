import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { unwrapOrThrow } from "../../service/service-wrapper";
import { useService } from "../../service/use-service";
import {
  ReadToolDTO,
  ToolInteractionElement,
} from "../../service/tool/interface";
import { Loader2 } from "lucide-react";

type ToolOutputModalProps = {
  toolOutputModalVisible: boolean;
  setToolOutputModalVisible: (visible: boolean) => void;
  toolId: number;
  responseData: ToolInteractionElement[];
};

export default function ToolOutputModal({
  toolOutputModalVisible,
  setToolOutputModalVisible,
  toolId,
  responseData,
}: ToolOutputModalProps) {
  const { t } = useTranslation(["tool"]);
  const { toolService } = useService();
  const [tool, setTool] = useState<ReadToolDTO | null>(null);

  useEffect(() => {
    if (!toolId) {
      return;
    }
    const fetch = async () => {
      const tool = unwrapOrThrow(await toolService.getToolByID(toolId));
      setTool(tool);
    };
    fetch();
  }, []);

  // Create a map of interface_id to content for easy lookup
  const responseMap = responseData.reduce((acc, item) => {
    acc[item.interface_id] = item.content;
    return acc;
  }, {} as Record<string, ToolInteractionElement["content"]>);

  const renderContent = (content: ToolInteractionElement["content"], valueType: string) => {
    if (valueType === "file" && Array.isArray(content)) {
      return (
        <div className="space-y-1">
          {content.map((file, index) => (
            <div key={index} className="text-sm bg-muted px-2 py-1 rounded">
              {file instanceof File ? file.name : String(file)}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="text-sm bg-muted px-3 py-2 rounded border">
        {String(content)}
      </div>
    );
  };

  return (
    <Dialog
      open={toolOutputModalVisible}
      onOpenChange={setToolOutputModalVisible}
    >
      <DialogContent className="sm:max-w-xl max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {tool?.name || t("loading")}
          </DialogTitle>
        </DialogHeader>
        {!tool ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tool.provider_interface.responseInterface.map((field) => {
              const content = responseMap[field.id];
              return (
                <div key={field.id} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {field.key}
                  </label>
                  {content !== undefined ? (
                    renderContent(content, field.valueType)
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No data available
                    </div>
                  )}
                </div>
              );
            })}
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setToolOutputModalVisible(false)}
              >
                {t("base:close")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
