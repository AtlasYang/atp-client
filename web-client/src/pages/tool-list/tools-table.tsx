import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "../../components/ui/dialog";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { useService } from "../../service/use-service";
import { unwrapOr } from "../../service/service-wrapper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReadToolDTO, ToolClientPermissionLevel } from "../../service/tool/interface";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import ToolCreator from "./tool-creator";
import { Checkbox } from "../../components/ui/checkbox";
import { ArrowUpDown, HelpCircle } from "lucide-react";
import { Popover } from "@cloudscape-design/components";

type ReadToolDTOWithPermissionLevel = ReadToolDTO & {
  permissionLevel: ToolClientPermissionLevel;
};

export default function ToolsTable() {
  const { t } = useTranslation(["tool", "base", "chatWidget"]);
  const { toolService } = useService();
  const [tools, setTools] = useState<ReadToolDTOWithPermissionLevel[]>([]);
  const [ , setSelectedItems] = useState<ReadToolDTOWithPermissionLevel[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(false);
  // const [toolDeleteModalVisible, setToolDeleteModalVisible] = useState(false);
  const [toolCreateModalVisible, setToolCreateModalVisible] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const [, setJsonFile] = useState<File | null>(null);

  const columnName = t("table.column.name");
  const columnToolId = t("table.column.tool-id");
  const columnToolUuid = t("table.column.tool-uuid");
  const columnPermissionLevel = t("table.column.permission-level");
  const columnVersion = t("table.column.version");
  // const actionCopyToolId = t("table.actions.copy-tool-id");
  // const actionDeleteSession = t("table.actions.delete-session");
  // const actionOpenMenu = t("table.actions.open-menu");

  const fetchTools = useCallback(async () => {
    setLoading(true);
    const tw = unwrapOr(await toolService.getAllToolsByPermissionLevel(ToolClientPermissionLevel.WRITE), []);
    const tr = unwrapOr(await toolService.getAllToolsByPermissionLevel(ToolClientPermissionLevel.READ), []);
    const tn = unwrapOr(await toolService.getAllToolsByPermissionLevel(ToolClientPermissionLevel.NONE), []);
    setTools([
      ...tw.map((tool) => ({ ...tool, permissionLevel: ToolClientPermissionLevel.WRITE })),
      ...tr.map((tool) => ({ ...tool, permissionLevel: ToolClientPermissionLevel.READ })),
      ...tn.map((tool) => ({ ...tool, permissionLevel: ToolClientPermissionLevel.NONE })),
    ]);
    setLoading(false);
  }, [toolService]);

  const columns: ColumnDef<ReadToolDTOWithPermissionLevel>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {columnName}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.name,
      },
      {
        accessorKey: "version",
        header: columnVersion,
        cell: ({ row }) => row.original.version,
      },
      {
        accessorKey: "id",
        header: columnToolId,
        cell: ({ row }) => row.original.id,
      },
      {
        accessorKey: "tool_uuid",
        header: columnToolUuid,
        cell: ({ row }) => row.original.uuid,
      },
      {
        accessorKey: "permission_level",
        header: columnPermissionLevel,
        cell: ({ row }) => {
          switch (row.original.permissionLevel) {
            case ToolClientPermissionLevel.WRITE:
              return (<Popover content={<div>
                <p>{t("permission-level.write-description")}</p>
                </div>}>
                  <div className="flex items-center gap-2">
                    {t("permission-level.write")}
                    <HelpCircle className="ml-2 h-3.5 w-3.5" />
                  </div>
                </Popover>
              );
            case ToolClientPermissionLevel.READ:
              return (<Popover content={<div>
                <p>{t("permission-level.read-description")}</p>
                </div>}>
                  <div className="flex items-center gap-2">
                    {t("permission-level.read")}
                    <HelpCircle className="ml-2 h-3.5 w-3.5" />
                  </div>
                </Popover>
              );
            case ToolClientPermissionLevel.NONE:
              return (<Popover content={<div>
                <p>{t("permission-level.none-description")}</p>
                </div>}>
                  <div className="flex items-center gap-2">
                    {t("permission-level.none")}
                    <HelpCircle className="ml-2 h-3.5 w-3.5" />
                  </div>
                </Popover>
              );
            default:
              return null;
          }
        },
      },
      // {
      //   id: "actions",
      //   cell: ({ row }) => {
      //     const tool = row.original;

      //     return (
      //       <DropdownMenu>
      //         <DropdownMenuTrigger>
      //           <Button variant="ghost" className="h-8 w-8 p-0">
      //             <span className="sr-only">{actionOpenMenu}</span>
      //             <MoreHorizontal className="h-4 w-4" />
      //           </Button>
      //         </DropdownMenuTrigger>
      //         <DropdownMenuContent align="end">
      //           <DropdownMenuItem
      //             onClick={() => navigator.clipboard.writeText(tool.id)}
      //           >
      //             {actionCopyToolId}
      //           </DropdownMenuItem>
      //           <DropdownMenuSeparator />
      //           <DropdownMenuItem
      //             onClick={async () => {
      //               await toolService.deleteTool(tool.id);
      //               const deletedToolIds = selectedItems.map((item) => item.id);

      //               updateGenerateState({
      //                 toolSessionLinks: generalState.toolSessionLinks.filter(
      //                   (link) => !deletedToolIds.includes(link.toolId)
      //                 ),
      //               });
      //               await fetchTools();
      //             }}
      //           >
      //             {actionDeleteSession}
      //           </DropdownMenuItem>
      //         </DropdownMenuContent>
      //       </DropdownMenu>
      //     );
      //   },
      // },
    ],
    [
      columnName,
      columnToolId,
      columnToolUuid,
      columnPermissionLevel,
      columnVersion,
      t,
    ]
  );

  useEffect(() => {
    fetchTools();
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Toolbar */}
      {/* <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setToolCreateModalVisible(true)}
        >
          {t("table.add-item")}
        </Button>
        <Button
          variant="outline"
          disabled={selectedItems.length === 0}
          onClick={() => setToolDeleteModalVisible(true)}
        >
          {t("table.delete")}
        </Button>
      </div> */}

      {/* Table or Skeleton */}
      {loading ? (
        <Skeleton className="h-48 w-full rounded-md" />
      ) : (
        <DataTable
          columns={columns}
          data={tools.sort((a, b) => a.name.localeCompare(b.name))}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          onSelectedRowsChange={setSelectedItems}
        />
      )}

      {/* Create Dialog */}
      <Dialog
        open={toolCreateModalVisible}
        onOpenChange={setToolCreateModalVisible}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.add-item")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="json-upload"
              className="text-sm font-medium text-muted-foreground"
            >
              {t("upload-json")}
            </label>
            <Input
              id="json-upload"
              type="file"
              accept=".json"
              className="w-auto"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                file.text().then(setJsonContent);
                setJsonFile(file);
              }}
            />
          </div>
          <ToolCreator content={jsonContent} setContent={setJsonContent} />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setToolCreateModalVisible(false)}
            >
              {t("base:cancel")}
            </Button>
            <Button
              onClick={async () => {
                await toolService.createTool(JSON.parse(jsonContent));
                await fetchTools();
                setToolCreateModalVisible(false);
                setJsonContent("");
                setJsonFile(null);
              }}
            >
              {t("base:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
