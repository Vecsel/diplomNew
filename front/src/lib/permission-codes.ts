/** Must match backend permission codes (see seed / role_group_permissions). */
export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  GROUPS_READ: "groups:read",
  GROUPS_CREATE: "groups:create",
  GROUPS_UPDATE: "groups:update",
  GROUPS_DELETE: "groups:delete",
  PERMISSIONS_READ: "permissions:read"
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
