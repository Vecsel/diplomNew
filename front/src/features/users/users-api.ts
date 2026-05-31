import { apiRequest } from "@/lib/api-client";

export type UserDto = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roleGroups: { id: number; code: string; title: string }[];
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UsersListResponse = PaginatedResponse<UserDto>;
type RawUserDto = Omit<UserDto, "roleGroups"> & { roleGroups?: UserDto["roleGroups"] };
type RawUsersListResponse = PaginatedResponse<RawUserDto>;

export type UserFormInput = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  groupIds: number[];
  password?: string;
};

export type UsersListParams = {
  page: number;
  limit: number;
  q?: string;
  status?: "all" | "active" | "inactive";
};

export type UsersStatsDto = {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
};

function toPayload(input: UserFormInput) {
  return {
    username: input.username.trim(),
    email: input.email.trim(),
    fullName: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
    isActive: input.isActive,
    groupIds: input.groupIds,
    ...(input.password ? { password: input.password } : {})
  };
}

export function getUsers(token: string, params: UsersListParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.status && params.status !== "all") searchParams.set("status", params.status);

  return apiRequest<RawUsersListResponse>(`/users?${searchParams.toString()}`, { token }).then((response) => ({
    ...response,
    items: response.items.map((item) => ({
      ...item,
      roleGroups: item.roleGroups ?? []
    }))
  }));
}

export function getUsersStats(token: string) {
  return apiRequest<UsersStatsDto>("/users/stats", { token });
}

export function getUserById(id: number, token: string) {
  return apiRequest<RawUserDto>(`/users/${id}`, { token }).then((user) => ({
    ...user,
    roleGroups: user.roleGroups ?? []
  }));
}

export function createUser(input: UserFormInput, token: string) {
  return apiRequest<UserDto>("/users", {
    method: "POST",
    body: toPayload(input),
    token
  });
}

export function updateUser(id: number, input: UserFormInput, token: string) {
  return apiRequest<UserDto>(`/users/${id}`, {
    method: "PATCH",
    body: toPayload(input),
    token
  });
}

export function deleteUser(id: number, token: string) {
  return apiRequest<null>(`/users/${id}`, {
    method: "DELETE",
    token
  });
}
