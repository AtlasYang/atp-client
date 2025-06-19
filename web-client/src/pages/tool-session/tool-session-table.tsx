import { useGeneralContext } from "../../context/general-context";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useService } from "../../service/use-service";
import { unwrapOr } from "../../service/service-wrapper";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import { CircleCheck, Loader, ArrowUpDown } from "lucide-react";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

import { Skeleton } from "../../components/ui/skeleton";
import {
  ReadToolRequestDTO,
  ToolInteractionElement,
} from "../../service/tool/interface";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import ToolOutputModal from "./tool-output-modal";
export default function ToolSessionTable() {
  const { t } = useTranslation(["dashboard", "tool"]);
  const { toolService } = useService();
  const { generalState } = useGeneralContext();

  const [rowSelection, setRowSelection] = useState({});
  const [, setSelectedItems] = useState<ReadToolRequestDTO[]>([]);
  const [toolSessionCount, setToolSessionCount] = useState<number | null>(null);
  const [toolRequests, setToolRequests] = useState<ReadToolRequestDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "success" | "failed"
  >("all");
  const navigate = useNavigate();
  const [toolOutputModalVisible, setToolOutputModalVisible] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [selectedToolResponseData, setSelectedToolResponseData] = useState<ToolInteractionElement[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let polling: number | null = null;
    let isUnmounted = false;

    const fetchRequests = async () => {
      setLoading(true);
      const requests = unwrapOr(await toolService.getAllToolRequests(), []);
      if (!isUnmounted) setToolRequests(requests);
      setLoading(false);

      if (!isUnmounted && requests.some((r) => r.status === "pending")) {
        polling = window.setTimeout(fetchRequests, 2000);
      }
    };

    fetchRequests();

    return () => {
      isUnmounted = true;
      if (polling) clearTimeout(polling);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const toolRequests = unwrapOr(await toolService.getAllToolRequests(), []);
      setToolSessionCount(toolRequests.length);
    })();
  }, [toolService]);
  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return toolRequests;
    return toolRequests.filter((req) => req.status === statusFilter);
  }, [toolRequests, statusFilter]);

  const columns: ColumnDef<ReadToolRequestDTO, unknown>[] = useMemo(
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
        accessorKey: "toolName",
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
            disabled={row.original.status !== "success"}
            onClick={() => {
              if (row.original.status === "success") {
                setSelectedToolId(row.original.tool_id);
                setSelectedToolResponseData(row.original.response_data);
                setToolOutputModalVisible(true);
              }
            }}
          >
            {row.original.tool_name}
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
            {row.original.status === "success" ? (
              <CircleCheck className="fill-green-500 dark:fill-green-400 h-4 w-4" />
            ) : row.original.status === "failed" ? (
              <CircleCheck className="fill-red-500 dark:fill-red-400 h-4 w-4" />
            ) : (
              <Loader className="h-4 w-4 animate-spin" />
            )}
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("table.column.created-at"),
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          return (
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          );
        },
      },
    ],
    [navigate, t]
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
            {t("statistics.active-tool-sessions")}
          </span>
          <span className="text-3xl font-bold text-foreground">
            {toolSessionCount !== null ? (
              toolSessionCount
            ) : (
              <Skeleton className="h-6 w-10 rounded-md" />
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end py-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" className="flex items-center gap-2">
              Status:{" "}
              {statusFilter === "all"
                ? "All"
                : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["all", "pending", "success", "failed"].map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() =>
                  setStatusFilter(
                    status as "all" | "pending" | "success" | "failed"
                  )
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table or Skeleton */}
      {loading ? (
        <Skeleton className="h-48 w-full rounded-md" />
      ) : (
        <DataTable<ReadToolRequestDTO, unknown>
          columns={columns}
          data={filteredRequests}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          onSelectedRowsChange={setSelectedItems}
        />
      )}

      { selectedToolId && selectedToolResponseData && (
        <ToolOutputModal
          toolOutputModalVisible={toolOutputModalVisible}
          setToolOutputModalVisible={setToolOutputModalVisible}
          toolId={selectedToolId}
          responseData={selectedToolResponseData}
        />
      )}
    </div>
  );
}
