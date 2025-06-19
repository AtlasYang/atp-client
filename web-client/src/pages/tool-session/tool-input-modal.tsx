import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isOk, unwrapOrThrow } from "../../service/service-wrapper";
import { useService } from "../../service/use-service";
import {
  ReadToolDTO,
  ToolInteractionElement,
} from "../../service/tool/interface";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

type ToolInputModalProps = {
  toolInputModalVisible: boolean;
  setToolInputModalVisible: (visible: boolean) => void;
  toolId: string;
};
export default function ToolInputModal({
  toolInputModalVisible,
  setToolInputModalVisible,
  toolId,
}: ToolInputModalProps) {
  const { t } = useTranslation(["tool"]);
  const { toolService } = useService();
  const [tool, setTool] = useState<ReadToolDTO | null>(null);
  const [formTexts, setFormTexts] = useState<Record<string, string>>({});
  const [formNumbers, setFormNumbers] = useState<Record<string, number>>({});
  const [formFiles, setFormFiles] = useState<Record<string, File[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!toolId) {
      return;
    }
    const fetch = async () => {
      const tool = unwrapOrThrow(await toolService.getToolByUUID(toolId));
      setTool(tool);
    };
    fetch();
  }, []);

  const handleInputChange = ({
    type,
    key,
    value,
  }:
    | { type: "string"; key: string; value: string }
    | { type: "number"; key: string; value: number }
    | { type: "file"; key: string; value: File[] }) => {
    if (type === "string") {
      setFormTexts((prev) => ({ ...prev, [key]: value }));
    } else if (type === "number") {
      setFormNumbers((prev) => ({ ...prev, [key]: value }));
    } else {
      setFormFiles((prev) => ({ ...prev, [key]: value }));
    }
  };
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    if (e.target.files) {
      handleInputChange({
        type: "file",
        key,
        value: Array.from(e.target.files),
      });
    }
  };
  const handleSubmit = async () => {
    if (!tool) return;
    setSubmitting(true);

    const request = tool.provider_interface.requestInterface.map((field) => {
      const key = field.key;
      let value: ToolInteractionElement["content"] = "";

      if (field.valueType === "string") {
        value = formTexts[key] ?? "";
      } else if (field.valueType === "number") {
        value = formNumbers[key] ?? 0;
      } else if (field.valueType === "file") {
        value = formFiles[key] ?? [];
      }

      return {
        content: value,
        interface_id: field.id,
      };
    });

    // TODO check runTool result type
    const result = await toolService.runTool(tool.id, request);
    setSubmitting(false);
    if (isOk(result)) {
      setFormTexts({});
      setFormNumbers({});
      setFormFiles({});
      setToolInputModalVisible(false);
      navigate("/tool-session");
    } else {
      alert("Error running tool.");
    }
  };
  return (
    <Dialog
      open={toolInputModalVisible}
      onOpenChange={setToolInputModalVisible}
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
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {tool.provider_interface.requestInterface.map((field) => (
              <div key={field.id} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground mb-1">
                  {field.key}
                </label>
                {field.valueType === "string" && (
                  <Input
                    type="text"
                    value={formTexts[field.key] || ""}
                    placeholder={`Enter ${field.key}`}
                    onChange={(e) =>
                      handleInputChange({
                        type: "string",
                        key: field.key,
                        value: e.target.value,
                      })
                    }
                  />
                )}
                {field.valueType === "number" && (
                  <Input
                    type="number"
                    value={formNumbers[field.key] ?? ""}
                    placeholder={`Enter ${field.key}`}
                    onChange={(e) =>
                      handleInputChange({
                        type: "number",
                        key: field.key,
                        value: Number(e.target.value),
                      })
                    }
                  />
                )}
                {field.valueType === "file" && (
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(e, field.key)}
                  />
                )}
              </div>
            ))}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setToolInputModalVisible(false)}
                disabled={submitting}
              >
                {t("base:cancel")}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : null}
                {t("tool-input.run-model")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
