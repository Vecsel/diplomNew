import { toast } from "sonner";
import { ru } from "@/lib/i18n/ru";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

/** Dispatched when an authenticated API call returns 401 (handled in AuthProvider). */
export const API_UNAUTHORIZED_EVENT = "app:api-unauthorized";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

function toStatusMessage(status: number): string {
  if (status === 400 || status === 422) return "Проверьте правильность заполнения формы";
  if (status === 401) return "Неверный логин или пароль";
  if (status === 403) return "У вас нет прав для выполнения этого действия";
  if (status === 404) return "Запрашиваемые данные не найдены";
  if (status >= 500) return "Ошибка сервера. Попробуйте позже";
  return ru.api.requestFailed;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function parseResponseBody(raw: string): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw };
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new ApiError("Не удалось связаться с сервером. Попробуйте позже", 0);
  }

  const raw = await response.text();
  const payload = parseResponseBody(raw);

  if (!response.ok) {
    const rawMessage =
      typeof payload === "object" && payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "";
    const normalizedRaw = rawMessage.trim().toLowerCase();
    const message =
      normalizedRaw === "validation error" || normalizedRaw === "validation failed"
        ? "Проверьте правильность заполнения формы"
        : normalizedRaw === "invalid credentials"
          ? "Неверный логин или пароль"
          : toStatusMessage(response.status);

    if (response.status === 401 && !path.startsWith("/auth/login")) {
      window.dispatchEvent(new CustomEvent(API_UNAUTHORIZED_EVENT));
    }

    if (response.status === 403) {
      toast.error(message, { description: ru.api.forbiddenDescription });
    }

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}
