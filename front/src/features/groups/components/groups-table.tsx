import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { GroupDto } from "@/features/groups/groups-api";
import { ru } from "@/lib/i18n/ru";

type GroupsTableProps = {
  rows: GroupDto[];
  canReadDetail: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onRowOpen: (row: GroupDto) => void;
  onEdit: (row: GroupDto) => void;
  onDeleteRequest: (row: GroupDto) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function GroupsTable({
  rows,
  canReadDetail,
  canUpdate,
  canDelete,
  onRowOpen,
  onEdit,
  onDeleteRequest,
  page,
  totalPages,
  onPageChange
}: GroupsTableProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-card/30">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/80 hover:bg-transparent">
            <TableHead className="min-w-[200px]">{ru.groups.table.group}</TableHead>
            <TableHead className="w-[120px]">{ru.groups.table.code}</TableHead>
            <TableHead className="min-w-[200px]">{ru.groups.table.permissions}</TableHead>
            <TableHead className="w-[150px]">{ru.groups.table.updated}</TableHead>
            <TableHead className="w-[64px] text-right">{ru.groups.table.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              tabIndex={canReadDetail ? 0 : undefined}
              className={cn(
                "group border-border/60 transition-colors",
                canReadDetail ? "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none" : ""
              )}
              onClick={
                canReadDetail
                  ? () => {
                      void onRowOpen(row);
                    }
                  : undefined
              }
              onKeyDown={
                canReadDetail
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        void onRowOpen(row);
                      }
                    }
                  : undefined
              }
            >
              <TableCell className="align-top">
                <div className="flex flex-col gap-0.5 py-0.5">
                  <span className="font-semibold leading-tight text-foreground">{row.title}</span>
                  {row.description?.trim() ? (
                    <span className="line-clamp-2 text-xs text-muted-foreground">{row.description}</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <Badge variant="outline" className="font-mono text-xs font-normal">
                  {row.code}
                </Badge>
              </TableCell>
              <TableCell className="align-top">
                {row.permissions.length ? (
                  <div className="flex flex-wrap gap-1">
                    {row.permissions.slice(0, 4).map((code) => (
                      <Badge key={code} variant="secondary" className="max-w-[160px] truncate font-mono text-[11px] font-normal">
                        {code}
                      </Badge>
                    ))}
                    {row.permissions.length > 4 ? (
                      <Badge variant="outline" className="text-[11px] font-normal">
                        +{row.permissions.length - 4}
                      </Badge>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{ru.groups.table.nonePerms}</span>
                )}
              </TableCell>
              <TableCell className="align-top text-sm tabular-nums text-muted-foreground">{formatDate(row.updatedAt)}</TableCell>
              <TableCell className="align-top text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100"
                      aria-label={ru.groups.table.actionsMenu}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuLabel>{ru.common.actions}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={!canUpdate}
                      title={!canUpdate ? ru.common.noPermission : undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(row);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      {ru.users.table.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!canDelete}
                      title={!canDelete ? ru.common.noPermission : undefined}
                      className="text-destructive focus:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteRequest(row);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {ru.users.table.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t border-border/60">
        <TablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
