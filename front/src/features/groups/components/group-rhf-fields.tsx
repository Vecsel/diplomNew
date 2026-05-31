import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PermissionsPicker } from "@/features/groups/components/permissions-picker";
import type { GroupFormValues } from "@/features/groups/group-form-schema";
import type { PermissionDto } from "@/features/permissions/permissions-api";
import { ru } from "@/lib/i18n/ru";

type GroupRhfFieldsProps = {
  allPermissions: PermissionDto[];
  disabled?: boolean;
};

export function GroupRhfFields({ allPermissions, disabled }: GroupRhfFieldsProps) {
  const form = useFormContext<GroupFormValues>();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">{ru.groups.form.identity}</h3>
          <p className="text-xs text-muted-foreground">{ru.groups.form.identityHint}</p>
        </div>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ru.groups.form.code}</FormLabel>
              <FormControl>
                <Input className="font-mono text-sm" placeholder={ru.groups.form.codePlaceholder} {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ru.groups.form.title}</FormLabel>
              <FormControl>
                <Input placeholder={ru.groups.form.titlePlaceholder} {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">{ru.groups.form.description}</h3>
          <p className="text-xs text-muted-foreground">{ru.groups.form.descriptionHint}</p>
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ru.groups.form.notes}</FormLabel>
              <FormControl>
                <Textarea rows={4} className="resize-y bg-background/80" placeholder={ru.groups.form.notesPlaceholder} {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">{ru.groups.form.permissions}</h3>
          <p className="text-xs text-muted-foreground">{ru.groups.form.permissionsHint}</p>
        </div>
        <FormField
          control={form.control}
          name="permissionCodes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PermissionsPicker
                  allPermissions={allPermissions}
                  selectedCodes={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}
