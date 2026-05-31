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
import type { UserDto } from "@/features/users/users-api";
import { ru } from "@/lib/i18n/ru";

type GroupChip = { code: string; title: string };

type UsersTableProps = {
  rows: UserDto[];
  rowGroups: (row: UserDto) => GroupChip[];
  canReadDetail: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onRowOpen: (row: UserDto) => void;
  onEdit: (row: UserDto) => void;
  onDeleteRequest: (row: UserDto) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function UsersTable({
  rows,
  rowGroups,
  canReadDetail,
  canUpdate,
  canDelete,
  onRowOpen,
  onEdit,
  onDeleteRequest,
  page,
  totalPages,
  onPageChange
}: UsersTableProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-card/30">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/80 hover:bg-transparent">
            <TableHead className="w-[240px]">{ru.users.table.user}</TableHead>
            <TableHead>{ru.users.table.email}</TableHead>
            <TableHead className="min-w-[180px]">{ru.users.table.groups}</TableHead>
            <TableHead className="w-[110px]">{ru.users.table.status}</TableHead>
            <TableHead className="w-[150px]">{ru.users.table.updated}</TableHead>
            <TableHead className="w-[64px] text-right">{ru.users.table.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const groups = rowGroups(row);
            return (
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
                    <span className="font-semibold leading-tight text-foreground">{row.username}</span>
                    <span className="text-xs text-muted-foreground">{row.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">{row.email}</TableCell>
                <TableCell className="align-top">
                  {groups.length ? (
                    <div className="flex flex-wrap gap-1">
                      {groups.map((g) => (
                        <Badge key={g.code} variant="secondary" className="max-w-[140px] truncate font-normal">
                          {g.title}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{ru.common.none}</span>
                  )}
                </TableCell>
                <TableCell className="align-top">
                  {row.isActive ? (
                    <Badge variant="success">{ru.users.table.statusActive}</Badge>
                  ) : (
                    <Badge variant="secondary">{ru.users.table.statusInactive}</Badge>
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
                        aria-label={ru.users.table.actionsMenu}
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
                        title={!canUpdate ? ru.users.table.noEditPerm : undefined}
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
                        title={!canDelete ? ru.users.table.noDeletePerm : undefined}
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
            );
          })}
        </TableBody>
      </Table>
      <div className="border-t border-border/60">
        <TablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
