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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ru } from "@/lib/i18n/ru";
import type { UiFieldErrors } from "@/lib/api-error-mapper";
import { userCreateFormSchema, type UserCreateFormValues } from "@/features/users/user-form-schema";
import { AsyncGroupSelect, type GroupOption } from "@/features/users/components/async-group-select";

const defaultValues: UserCreateFormValues = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  isActive: true,
  groupIds: []
};

type UserCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiError: string | null;
  apiFieldErrors: UiFieldErrors;
  isSaving: boolean;
  canSubmit: boolean;
  onSearchGroups: (params: { q: string; page: number; limit: number }) => Promise<{ items: GroupOption[]; page: number; totalPages: number }>;
  onLoadGroupsByIds: (ids: number[]) => Promise<GroupOption[]>;
  onSave: (values: UserCreateFormValues) => void | Promise<void>;
};

export function UserCreateDialog({
  open,
  onOpenChange,
  apiError,
  apiFieldErrors,
  isSaving,
  canSubmit,
  onSearchGroups,
  onLoadGroupsByIds,
  onSave
}: UserCreateDialogProps) {
  const form = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  useEffect(() => {
    if (!open) return;
    form.clearErrors();
    for (const [field, message] of Object.entries(apiFieldErrors)) {
      form.setError(field as keyof UserCreateFormValues, { type: "server", message });
    }
  }, [apiFieldErrors, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{ru.users.dialog.createTitle}</DialogTitle>
          <DialogDescription>{ru.users.dialog.createDesc}</DialogDescription>
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

            <fieldset className="space-y-8 disabled:opacity-60" disabled={isSaving || !canSubmit}>
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">{ru.users.form.basic}</h3>
                  <p className="text-xs text-muted-foreground">{ru.users.form.basicHint}</p>
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ru.users.form.username}</FormLabel>
                      <FormControl>
                        <Input autoComplete="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ru.users.form.email}</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">{ru.users.form.profile}</h3>
                  <p className="text-xs text-muted-foreground">{ru.users.form.profileHint}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{ru.users.form.firstName}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{ru.users.form.lastName}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">{ru.users.form.security}</h3>
                  <p className="text-xs text-muted-foreground">{ru.users.form.securityCreate}</p>
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ru.users.form.password}</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">{ru.users.form.groups}</h3>
                  <p className="text-xs text-muted-foreground">{ru.users.form.groupsHint}</p>
                </div>
                <FormField
                  control={form.control}
                  name="groupIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AsyncGroupSelect
                          value={field.value}
                          onChange={(next) => field.onChange(Array.isArray(next) ? next : [])}
                          onSearch={onSearchGroups}
                          onLoadByIds={onLoadGroupsByIds}
                          preloadOnMount
                          disabled={isSaving || !canSubmit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">{ru.users.form.access}</h3>
                  <p className="text-xs text-muted-foreground">{ru.users.form.accessHint}</p>
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-border/80 bg-muted/20 px-4 py-3">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} disabled={field.disabled} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer font-normal">{ru.users.form.active}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </section>
            </fieldset>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                {ru.common.cancel}
              </Button>
              <Button type="submit" disabled={isSaving || !canSubmit}>
                {isSaving ? ru.users.dialog.creating : ru.users.dialog.createSubmit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
