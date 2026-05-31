import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ru } from "@/lib/i18n/ru";
import { toggleInArray } from "@/lib/toggle-in-array";
import type { PermissionDto } from "@/features/permissions/permissions-api";

type PermissionsPickerProps = {
  allPermissions: PermissionDto[];
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
};

export function PermissionsPicker({ allPermissions, selectedCodes, onChange, disabled }: PermissionsPickerProps) {
  return (
    <div className="max-h-52 space-y-0 overflow-y-auto rounded-md border border-border bg-muted/20 p-1">
      {allPermissions.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">{ru.groups.permissionsPicker.empty}</p>
      ) : (
        allPermissions.map((perm, index) => (
          <div key={perm.id}>
            {index > 0 ? <Separator className="my-1 bg-border/60" /> : null}
            <label
              htmlFor={`perm-${perm.id}`}
              className="flex cursor-pointer items-start gap-3 rounded-sm px-3 py-2.5 text-sm hover:bg-muted/60"
            >
              <Checkbox
                id={`perm-${perm.id}`}
                className="mt-0.5"
                checked={selectedCodes.includes(perm.code)}
                disabled={disabled}
                onCheckedChange={(checked) => onChange(toggleInArray(selectedCodes, perm.code, checked === true))}
              />
              <span className="space-y-0.5">
                <span className="block font-mono text-xs font-medium text-foreground">{perm.code}</span>
                <span className="block text-xs text-muted-foreground">{perm.description}</span>
              </span>
            </label>
          </div>
        ))
      )}
    </div>
  );
}
