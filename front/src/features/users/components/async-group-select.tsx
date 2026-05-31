import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ru } from "@/lib/i18n/ru";

export type GroupOption = {
  id: number;
  code: string;
  title: string;
};

type SearchGroupsParams = {
  q: string;
  page: number;
  limit: number;
};

type SearchGroupsResult = {
  items: GroupOption[];
  page: number;
  totalPages: number;
};

type AsyncGroupSelectProps = {
  value: number[] | null | undefined;
  onChange: (next: number[]) => void;
  onSearch: (params: SearchGroupsParams) => Promise<SearchGroupsResult>;
  onLoadByIds?: (ids: number[]) => Promise<GroupOption[]>;
  initialSelected?: GroupOption[];
  disabled?: boolean;
  maxVisibleTags?: number;
  preloadOnMount?: boolean;
};

function mergeUniqueById(current: GroupOption[], next: GroupOption[]) {
  const map = new Map<number, GroupOption>();
  for (const item of current) map.set(item.id, item);
  for (const item of next) map.set(item.id, item);
  return Array.from(map.values());
}

function toSafeIds(value: number[] | null | undefined) {
  if (!Array.isArray(value)) return [];
  return value.filter((id) => Number.isInteger(id) && id > 0);
}

export function AsyncGroupSelect({
  value,
  onChange,
  onSearch,
  onLoadByIds,
  initialSelected,
  disabled,
  maxVisibleTags = 3,
  preloadOnMount = false
}: AsyncGroupSelectProps) {
  const selectedIds = toSafeIds(value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [items, setItems] = useState<GroupOption[]>([]);
  const [knownGroups, setKnownGroups] = useState<Map<number, GroupOption>>(() => {
    const map = new Map<number, GroupOption>();
    for (const item of initialSelected ?? []) {
      map.set(item.id, item);
    }
    return map;
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!initialSelected?.length) return;
    setKnownGroups((prev) => {
      const next = new Map(prev);
      for (const item of initialSelected) {
        next.set(item.id, item);
      }
      return next;
    });
  }, [initialSelected]);

  const selectedGroups = useMemo(() => {
    return selectedIds.map((id) => knownGroups.get(id)).filter((item): item is GroupOption => Boolean(item));
  }, [knownGroups, selectedIds]);

  const visibleTags = selectedGroups.slice(0, maxVisibleTags);
  const hiddenCount = Math.max(0, selectedGroups.length - visibleTags.length);

  const loadPage = async (nextPage: number, reset = false) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await onSearch({ q: debouncedQuery, page: nextPage, limit: 20 });
      setPage(response.page);
      setTotalPages(response.totalPages);
      setItems((prev) => (reset ? response.items : mergeUniqueById(prev, response.items)));
      setKnownGroups((prev) => {
        const next = new Map(prev);
        for (const item of response.items) {
          next.set(item.id, item);
        }
        return next;
      });
    } catch {
      setLoadError(ru.users.groupsPicker.loadFailed);
      if (reset) setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open && !preloadOnMount) return;
    void loadPage(1, true);
  }, [debouncedQuery, open, preloadOnMount]);

  useEffect(() => {
    if (!onLoadByIds || selectedIds.length === 0) return;
    const missingIds = selectedIds.filter((id) => !knownGroups.has(id));
    if (missingIds.length === 0) return;

    void onLoadByIds(missingIds)
      .then((loaded) => {
        if (!loaded.length) return;
        setKnownGroups((prev) => {
          const next = new Map(prev);
          for (const group of loaded) {
            next.set(group.id, group);
          }
          return next;
        });
      })
      .catch(() => {
        // No-op: selector still works, only chip labels for missing ids may be hidden.
      });
  }, [knownGroups, onLoadByIds, selectedIds]);

  const toggleId = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((valueId) => valueId !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  const removeId = (id: number) => {
    onChange(selectedIds.filter((valueId) => valueId !== id));
  };

  return (
    <div className="space-y-2">
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="h-auto min-h-10 w-full justify-between gap-3 px-3 py-2" disabled={disabled}>
            <div className="flex max-h-20 min-w-0 flex-1 flex-wrap items-center gap-1.5 overflow-y-auto overscroll-contain pr-1">
              {selectedGroups.length === 0 ? (
                <span className="text-sm font-normal text-muted-foreground">{ru.users.groupsPicker.placeholder}</span>
              ) : (
                <>
                  {visibleTags.map((group) => (
                    <Badge
                      key={group.id}
                      variant="secondary"
                      className="inline-flex max-w-full items-center gap-1 pr-1 text-xs"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="max-w-[180px] truncate">{group.title}</span>
                      <span
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                        className="rounded-sm p-0.5 hover:bg-background/60 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        onClick={(event) => {
                          if (disabled) return;
                          event.preventDefault();
                          event.stopPropagation();
                          removeId(group.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            removeId(group.id);
                          }
                        }}
                        aria-label={`${ru.users.groupsPicker.removeGroup} ${group.title}`}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  ))}
                  {hiddenCount > 0 ? <Badge variant="outline">+{hiddenCount} {ru.users.groupsPicker.more}</Badge> : null}
                </>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[320px] p-2" align="start">
          <div className="space-y-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={ru.users.groupsPicker.searchPlaceholder}
              disabled={disabled}
            />

            <div
              className="max-h-64 space-y-1 overflow-y-auto overscroll-contain rounded-md border border-border/70 p-1"
              onWheelCapture={(event) => event.stopPropagation()}
            >
              {isLoading && items.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">{ru.users.groupsPicker.loading}</p>
              ) : loadError ? (
                <p className="px-2 py-3 text-sm text-destructive">{loadError}</p>
              ) : items.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">{ru.users.groupsPicker.emptySearch}</p>
              ) : (
                items.map((group) => {
                  const checked = selectedIds.includes(group.id);
                  return (
                    <div
                      key={group.id}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      className="flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left hover:bg-muted/60"
                      onClick={() => toggleId(group.id)}
                      onKeyDown={(event) => {
                        if (disabled) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleId(group.id);
                        }
                      }}
                      aria-disabled={disabled}
                    >
                      <Checkbox checked={checked} className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{group.title}</span>
                        <span className="block truncate font-mono text-xs text-muted-foreground">{group.code}</span>
                      </span>
                      {checked ? <Check className="ml-auto h-4 w-4 text-primary" /> : null}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedGroups.length > 0
                  ? `${ru.users.groupsPicker.selected}: ${selectedGroups.length}`
                  : ru.users.groupsPicker.notSelected}
              </p>
              {page < totalPages ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => void loadPage(page + 1)} disabled={disabled || isLoading}>
                  {isLoading ? ru.common.loading : ru.users.groupsPicker.loadMore}
                </Button>
              ) : null}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
