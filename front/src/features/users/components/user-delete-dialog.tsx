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
import type { UserDto } from "@/features/users/users-api";
import { ru } from "@/lib/i18n/ru";

type UserDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  apiError: string | null;
  isSaving: boolean;
  canDelete: boolean;
  onConfirm: () => void | Promise<void>;
};

export function UserDeleteDialog({ open, onOpenChange, user, apiError, isSaving, canDelete, onConfirm }: UserDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ru.users.dialog.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Учётная запись{" "}
            <span className="font-medium text-foreground">{user?.username ?? "—"}</span> будет удалена без возможности
            восстановления.
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
            {isSaving ? ru.users.dialog.deleting : ru.users.dialog.deleteConfirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
