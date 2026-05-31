import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { GroupDto } from "@/features/groups/groups-api";
import { ru } from "@/lib/i18n/ru";

type GroupDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupDto | null;
  apiError: string | null;
  isSaving: boolean;
  canDelete: boolean;
  onConfirm: () => void | Promise<void>;
};

export function GroupDeleteDialog({ open, onOpenChange, group, apiError, isSaving, canDelete, onConfirm }: GroupDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ru.groups.dialog.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {ru.groups.dialog.deleteLead}{" "}
            <span className="font-medium text-foreground">{group?.title ?? "—"}</span>{" "}
            <span className="font-mono text-xs text-muted-foreground">({group?.code ?? "—"})</span>? {ru.groups.dialog.deleteHint}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {apiError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
            {apiError}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>{ru.common.cancel}</AlertDialogCancel>
          <Button type="button" variant="destructive" disabled={isSaving || !canDelete} onClick={() => void onConfirm()}>
            {isSaving ? ru.groups.dialog.deleting : ru.groups.dialog.deleteConfirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
