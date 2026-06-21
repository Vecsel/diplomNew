import { ArrowDownAZ, ArrowUpAZ, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GroupSortKey } from "@/features/groups/hooks/use-groups-page";
import { ru } from "@/lib/i18n/ru";

type GroupsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  disabled?: boolean;
  sortKey: GroupSortKey;
  onSortKeyChange: (value: GroupSortKey) => void;
  sortDir: "asc" | "desc";
  onToggleSortDir: () => void;
  onRefresh: () => void;
};

export function GroupsToolbar({
  query,
  onQueryChange,
  disabled,
  sortKey,
  onSortKeyChange,
  sortDir,
  onToggleSortDir,
  onRefresh
}: GroupsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full max-w-md space-y-2">
        <Label htmlFor="groups-search" className="text-xs text-muted-foreground">
          {ru.common.search}
        </Label>
        <Input
          id="groups-search"
          placeholder={ru.groups.toolbar.searchPlaceholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-10 bg-background/80"
        />
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{ru.common.sortBy}</Label>
          <Select value={sortKey} onValueChange={(v) => onSortKeyChange(v as GroupSortKey)} disabled={disabled}>
            <SelectTrigger className="h-10 w-[200px] bg-background/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">{ru.groups.toolbar.sortTitle}</SelectItem>
              <SelectItem value="code">{ru.groups.toolbar.sortCode}</SelectItem>
              <SelectItem value="permissions">{ru.groups.toolbar.sortPerms}</SelectItem>
              <SelectItem value="updated">{ru.groups.toolbar.sortUpdated}</SelectItem>
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
