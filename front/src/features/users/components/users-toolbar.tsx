import { ArrowDownAZ, ArrowUpAZ, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserSortKey, UserStatusFilter } from "@/features/users/hooks/use-users-page";
import { ru } from "@/lib/i18n/ru";

type UsersToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  disabled?: boolean;
  status: UserStatusFilter;
  onStatusChange: (value: UserStatusFilter) => void;
  sortKey: UserSortKey;
  onSortKeyChange: (value: UserSortKey) => void;
  sortDir: "asc" | "desc";
  onToggleSortDir: () => void;
  onRefresh: () => void;
};

export function UsersToolbar({
  query,
  onQueryChange,
  disabled,
  status,
  onStatusChange,
  sortKey,
  onSortKeyChange,
  sortDir,
  onToggleSortDir,
  onRefresh
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl lg:grid-cols-[1fr_minmax(0,200px)]">
        <div className="space-y-2">
          <Label htmlFor="users-search" className="text-xs text-muted-foreground">
            {ru.common.search}
          </Label>
          <Input
            id="users-search"
            placeholder={ru.users.toolbar.searchPlaceholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-10 bg-background/80"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{ru.users.toolbar.statusLabel}</Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as UserStatusFilter)} disabled={disabled}>
            <SelectTrigger className="h-10 bg-background/80">
              <SelectValue placeholder={ru.users.toolbar.statusLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ru.users.toolbar.statusAll}</SelectItem>
              <SelectItem value="active">{ru.users.toolbar.statusActive}</SelectItem>
              <SelectItem value="inactive">{ru.users.toolbar.statusInactive}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{ru.common.sortBy}</Label>
          <Select value={sortKey} onValueChange={(v) => onSortKeyChange(v as UserSortKey)} disabled={disabled}>
            <SelectTrigger className="h-10 w-[180px] bg-background/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">{ru.users.toolbar.sortUser}</SelectItem>
              <SelectItem value="email">{ru.users.toolbar.sortEmail}</SelectItem>
              <SelectItem value="updated">{ru.users.toolbar.sortUpdated}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 border-border/80"
          title={sortDir === "asc" ? ru.common.asc : ru.common.desc}
          onClick={onToggleSortDir}
          disabled={disabled}
        >
          {sortDir === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="outline" className="h-10 gap-2 border-border/80 px-3" onClick={onRefresh} disabled={disabled}>
          <RefreshCw className="h-4 w-4" />
          {ru.common.refresh}
        </Button>
      </div>
    </div>
  );
}
