import { useGeneralContext } from "../../context/general-context";
import { Session } from "../../service/session/interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useService } from "../../service/use-service";
import { unwrapOr } from "../../service/service-wrapper";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import {
  CircleCheck,
  Loader,
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Minus,
} from "lucide-react";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { ToolClientPermissionLevel } from "../../service/tool/interface";

export default function ItemsTable() {
  const { t } = useTranslation(["dashboard", "base", "chatWidget"]);
  const { sessionService, toolService } = useService();
  const { generalState, updateGenerateState } = useGeneralContext();

  const [rowSelection, setRowSelection] = useState({});
  const [selectedItems, setSelectedItems] = useState<Session[]>([]);
  const [sessionDeleteModalVisible, setSessionDeleteModalVisible] =
    useState(false);
  const [toolCount, setToolCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const sessions = unwrapOr(await sessionService.getAllSessions(), []);
    updateGenerateState({ openedSessions: sessions });
    setLoading(false);
  }, [sessionService, updateGenerateState]);

  useEffect(() => {
    (async () => {
      const tw = unwrapOr(await toolService.getAllToolsByPermissionLevel(ToolClientPermissionLevel.WRITE), []);
      const tr = unwrapOr(await toolService.getAllToolsByPermissionLevel(ToolClientPermissionLevel.READ), []);
      setToolCount(tw.length + tr.length);
    })();
  }, [toolService]);

  const columns: ColumnDef<Session>[] = useMemo(
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
            {t("table.column.name")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            variant="link"
            onClick={() =>
              updateGenerateState({
                isChatWidgetOpen: true,
                activeChatSessionId: row.original.id,
              })
            }
          >
            {row.original.name}
          </Button>
        ),
      },
      {
        accessorKey: "status",
        header: t("table.column.status"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="text-muted-foreground px-1.5 flex items-center gap-1"
          >
            {row.original.status === "active" ? (
              <CircleCheck className="fill-green-500 dark:fill-green-400 h-4 w-4" />
            ) : row.original.status === "inactive" ? (
              <CircleCheck className="fill-red-500 dark:fill-red-400 h-4 w-4" />
            ) : (
              <Loader className="h-4 w-4 animate-spin" />
            )}
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "assigned_tool_id",
        header: t("table.column.assigned-tool"),
        cell: ({ row }) => row.original.assigned_tool_id || "-",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">
                    {t("table.actions.open-menu")}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(session.assigned_tool_id)
                  }
                >
                  {t("table.actions.copy-tool-id")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await sessionService.deleteSession(session.id);
                    const deletedIds = selectedItems.map((item) => item.id);
                    updateGenerateState({
                      activeChatSessionId: null,
                      toolSessionLinks: generalState.toolSessionLinks.filter(
                        (link) => !deletedIds.includes(link.sessionId)
                      ),
                    });
                    await fetchSessions();
                  }}
                >
                  {t("table.actions.delete-session")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      t,
      selectedItems,
      sessionService,
      updateGenerateState,
      generalState.toolSessionLinks,
      fetchSessions,
    ]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase text-muted-foreground tracking-widest">
            {t("statistics.sessions")}
          </span>
          <span className="text-3xl font-bold text-foreground">
            {Array.isArray(generalState.openedSessions) ? generalState.openedSessions.length : 0}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase text-muted-foreground tracking-widest">
            {t("statistics.active-tools")}
          </span>
          <span className="text-3xl font-bold text-foreground">
            {toolCount !== null ? (
              toolCount
            ) : (
              <Skeleton className="h-6 w-10 rounded-md" />
            )}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateGenerateState({
              isChatWidgetOpen: true,
              activeChatSessionId: null,
            })
          }
        >
          <Plus />
          <span className="hidden lg:inline">{t("table.add-item")}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedItems.length === 0}
          onClick={() => setSessionDeleteModalVisible(true)}
        >
          <Minus />
          <span className="hidden lg:inline">{t("table.delete")}</span>
        </Button>
      </div>

      {/* Table or Skeleton */}
      {loading ? (
        <Skeleton className="h-48 w-full rounded-md" />
      ) : (
        <DataTable
          columns={columns}
          data={Array.isArray(generalState.openedSessions) 
            ? generalState.openedSessions.sort((a, b) => a.name.localeCompare(b.name))
            : []
          }
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          onSelectedRowsChange={setSelectedItems}
        />
      )}

      <Dialog
        open={sessionDeleteModalVisible}
        onOpenChange={setSessionDeleteModalVisible}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("chatWidget:delete-chat")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("chatWidget:delete-chat-confirm")}
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSessionDeleteModalVisible(false)}
            >
              {t("base:cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await Promise.all(
                  selectedItems.map((item) =>
                    sessionService.deleteSession(item.id)
                  )
                );
                const deletedIds = selectedItems.map((item) => item.id);
                updateGenerateState({
                  activeChatSessionId: null,
                  toolSessionLinks: generalState.toolSessionLinks.filter(
                    (link) => !deletedIds.includes(link.sessionId)
                  ),
                });
                setSelectedItems([]);
                setRowSelection({});
                await fetchSessions();
                setSessionDeleteModalVisible(false);
              }}
            >
              {t("base:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
