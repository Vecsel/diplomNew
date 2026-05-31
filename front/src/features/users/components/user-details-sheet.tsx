import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format-date";
import { splitFullName } from "@/lib/split-full-name";
import type { UserDto } from "@/features/users/users-api";
import { ru } from "@/lib/i18n/ru";

type RoleGroup = { id: number; code: string; title: string };

type UserDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  groups: RoleGroup[];
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function UserDetailsSheet({ open, onOpenChange, user, isLoading, error, groups, canUpdate, onEdit }: UserDetailsSheetProps) {
  const names = user ? splitFullName(user.fullName) : { firstName: "", lastName: "" };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-xl">
        <SheetHeader className="space-y-1 border-b border-border/80 px-6 py-5 text-left">
          <SheetTitle className="pr-8">{ru.users.sheet.title}</SheetTitle>
          <SheetDescription>{ru.users.sheet.description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : error && !user ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : user ? (
            <>
              <div className="space-y-2">
                <p className="text-xl font-semibold tracking-tight">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.fullName}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {user.isActive ? (
                    <Badge variant="success">{ru.users.table.statusActive}</Badge>
                  ) : (
                    <Badge variant="secondary">{ru.users.table.statusInactive}</Badge>
                  )}
                </div>
              </div>

              <Separator />

              <Section title={ru.users.sheet.account}>
                <Field label={ru.users.sheet.email}>{user.email}</Field>
                <Field label={ru.users.sheet.firstName}>{names.firstName || ru.common.none}</Field>
                <Field label={ru.users.sheet.lastName}>{names.lastName || ru.common.none}</Field>
              </Section>

              <Section title={ru.users.sheet.access}>
                {groups.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {groups.map((g) => (
                      <Badge key={g.id} variant="outline" className="font-normal">
                        {g.title}
                        <span className="ml-1 font-mono text-[10px] text-muted-foreground">{g.code}</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{ru.users.sheet.groupsHint}</p>
                )}
              </Section>

              <Section title={ru.users.sheet.audit}>
                <Field label={ru.users.sheet.created}>{formatDate(user.createdAt)}</Field>
                <Field label={ru.users.sheet.updated}>{formatDate(user.updatedAt)}</Field>
              </Section>
            </>
          ) : null}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {ru.common.close}
          </Button>
          <Button type="button" disabled={!canUpdate || !user} onClick={onEdit}>
            {ru.users.sheet.edit}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
