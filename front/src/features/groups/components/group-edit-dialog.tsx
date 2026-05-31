import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ru } from "@/lib/i18n/ru";
import type { UiFieldErrors } from "@/lib/api-error-mapper";
import { groupFormSchema, type GroupFormValues } from "@/features/groups/group-form-schema";
import { GroupRhfFields } from "@/features/groups/components/group-rhf-fields";
import type { GroupDto } from "@/features/groups/groups-api";
import type { PermissionDto } from "@/features/permissions/permissions-api";

type GroupEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupDto | null;
  apiError: string | null;
  apiFieldErrors: UiFieldErrors;
  isSaving: boolean;
  canSubmit: boolean;
  allPermissions: PermissionDto[];
  onSave: (values: GroupFormValues) => void | Promise<void>;
};

function toDefaults(g: GroupDto): GroupFormValues {
  return {
    code: g.code,
    title: g.title,
    description: g.description ?? "",
    permissionCodes: [...g.permissions]
  };
}

export function GroupEditDialog({
  open,
  onOpenChange,
  group,
  apiError,
  apiFieldErrors,
  isSaving,
  canSubmit,
  allPermissions,
  onSave
}: GroupEditDialogProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      permissionCodes: []
    }
  });

  useEffect(() => {
    if (open && group) {
      form.reset(toDefaults(group));
    }
  }, [open, group, form]);

  useEffect(() => {
    if (!open) return;
    form.clearErrors();
    for (const [field, message] of Object.entries(apiFieldErrors)) {
      form.setError(field as keyof GroupFormValues, { type: "server", message });
    }
  }, [apiFieldErrors, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{ru.groups.dialog.editTitle}</DialogTitle>
          <DialogDescription>{ru.groups.dialog.editDesc}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="max-h-[calc(90vh-8rem)] space-y-6 overflow-y-auto pr-1"
            onSubmit={form.handleSubmit(async (values) => {
              await onSave(values);
            })}
          >
            {apiError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                {apiError}
              </p>
            ) : null}

            <fieldset className="min-h-0 space-y-1 disabled:opacity-60" disabled={isSaving || !canSubmit || !group}>
              <GroupRhfFields allPermissions={allPermissions} disabled={isSaving || !canSubmit || !group} />
            </fieldset>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                {ru.common.cancel}
              </Button>
              <Button type="submit" disabled={isSaving || !canSubmit || !group}>
                {isSaving ? ru.groups.dialog.saving : ru.groups.dialog.saveChanges}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
