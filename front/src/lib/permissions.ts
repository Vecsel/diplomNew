/**
 * Accepts backend codes (`users:create`) or dotted aliases (`users.create`).
 */
export function normalizePermissionCode(code: string): string {
  return code.trim().replace(/\./g, ":");
}

export function hasPermission(granted: readonly string[], code: string): boolean {
  return granted.includes(normalizePermissionCode(code));
}
