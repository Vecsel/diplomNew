import { apiRequest } from "@/lib/api-client";

export type PermissionDto = {
  id: number;
  code: string;
  description: string;
};

type PermissionsListResponse = { items: PermissionDto[] };

export function getPermissions(token: string) {
  return apiRequest<PermissionsListResponse>("/permissions", { token });
}
