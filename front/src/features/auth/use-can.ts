import { useCallback, useMemo } from "react";
import { hasPermission, normalizePermissionCode } from "@/lib/permissions";
import { useAuth } from "./auth-context";

/**
 * RBAC helper tied to current user from `/auth/me` (`user.permissions`).
 */
export function useCan() {
  const { user } = useAuth();
  const granted = useMemo(() => user?.permissions ?? [], [user?.permissions]);

  const can = useCallback(
    (code: string) => hasPermission(granted, code),
    [granted]
  );

  const canAny = useCallback(
    (codes: string[]) => codes.some((c) => hasPermission(granted, c)),
    [granted]
  );

  const canAll = useCallback(
    (codes: string[]) => codes.every((c) => hasPermission(granted, c)),
    [granted]
  );

  return { can, canAny, canAll, granted, normalizePermissionCode };
}
