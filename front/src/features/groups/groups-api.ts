import { apiRequest } from "@/lib/api-client";

export type GroupDto = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

type GroupsListResponse = {
  items: GroupDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type GroupsListParams = { page: number; limit: number; q?: string };

export type GroupFormInput = {
  code: string;
  title: string;
  description: string;
  permissionCodes: string[];
};

function toCreatePayload(input: GroupFormInput) {
  return {
    code: input.code.trim(),
    title: input.title.trim(),
    description: input.description.trim() || undefined,
    permissionCodes: input.permissionCodes.length ? input.permissionCodes : undefined
  };
}

function toUpdatePayload(input: GroupFormInput) {
  return {
    code: input.code.trim(),
    title: input.title.trim(),
    description: input.description.trim() || undefined,
    permissionCodes: input.permissionCodes
  };
}

export function getGroups(token: string, params?: GroupsListParams) {
  if (!params) {
    return apiRequest<GroupsListResponse>("/groups", { token });
  }
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  return apiRequest<GroupsListResponse>(`/groups?${searchParams.toString()}`, { token });
}

export function getGroupById(id: number, token: string) {
  return apiRequest<GroupDto>(`/groups/${id}`, { token });
}

export function createGroup(input: GroupFormInput, token: string) {
  return apiRequest<GroupDto>("/groups", {
    method: "POST",
    body: toCreatePayload(input),
    token
  });
}

export function updateGroup(id: number, input: GroupFormInput, token: string) {
  return apiRequest<GroupDto>(`/groups/${id}`, {
    method: "PATCH",
    body: toUpdatePayload(input),
    token
  });
}

export function deleteGroup(id: number, token: string) {
  return apiRequest<null>(`/groups/${id}`, {
    method: "DELETE",
    token
  });
}
