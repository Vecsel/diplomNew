import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format-date";
import type { GroupDto } from "@/features/groups/groups-api";
import { ru } from "@/lib/i18n/ru";

type GroupDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupDto | null;
  isLoading: boolean;
  error: string | null;
  canUpdate: boolean;
  onEdit: () => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function GroupDetailsSheet({ open, onOpenChange, group, isLoading, error, canUpdate, onEdit }: GroupDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-xl">
        <SheetHeader className="space-y-1 border-b border-border/80 px-6 py-5 text-left">
          <SheetTitle className="pr-8">{ru.groups.sheet.title}</SheetTitle>
          <SheetDescription>{ru.groups.sheet.description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : error && !group ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : group ? (
            <>
              <div className="space-y-2">
                <p className="text-xl font-semibold tracking-tight">{group.title}</p>
                <Badge variant="outline" className="font-mono text-xs font-normal">
                  {group.code}
                </Badge>
              </div>

              <Separator />

              <Section title={ru.groups.sheet.overview}>
                <p className="text-sm text-muted-foreground">
                  {group.description?.trim() ? group.description : ru.groups.sheet.noDescription}
                </p>
              </Section>

              <Section title={ru.groups.sheet.permissions}>
                {group.permissions.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {group.permissions.map((code) => (
                      <Badge key={code} variant="secondary" className="font-mono text-xs font-normal">
                        {code}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{ru.groups.sheet.noPermissions}</p>
                )}
              </Section>

              <Section title={ru.groups.sheet.audit}>
                <div className="grid gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{ru.groups.sheet.created}</p>
                    <p className="tabular-nums text-foreground">{formatDate(group.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{ru.groups.sheet.updated}</p>
                    <p className="tabular-nums text-foreground">{formatDate(group.updatedAt)}</p>
                  </div>
                </div>
              </Section>
            </>
          ) : null}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {ru.common.close}
          </Button>
          <Button type="button" disabled={!canUpdate || !group} onClick={onEdit}>
            {ru.groups.sheet.edit}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
