import { apiRequest } from "@/lib/api-client";

type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roleGroups: Array<{ id: number; code: string; title: string }>;
  permissions: string[];
};

export function loginRequest(login: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { login, password }
  });
}

export function meRequest(token: string) {
  return apiRequest<AuthUser>("/auth/me", {
    method: "GET",
    token
  });
}
