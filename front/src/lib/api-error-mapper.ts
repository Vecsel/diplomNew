import { ApiError } from "@/lib/api-client";
import { ru } from "@/lib/i18n/ru";

export type UiFieldErrors = Record<string, string>;

type ApiPayload = {
  message?: unknown;
  errors?: unknown;
  details?: unknown;
};

export type UiApiError = {
  message: string;
  fieldErrors: UiFieldErrors;
  status?: number;
};

const TECHNICAL_MESSAGE_RE =
  /(validation error|request failed|network error|failed to fetch|internal server error|unexpected|exception|stack|sql|timeout|status code)/i;

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") return [value];
  return [];
}

function normalizeFieldKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.startsWith("body.")) return trimmed.slice(5);
  return trimmed;
}

function getFieldTitle(field: string): string {
  const byField: Record<string, string> = {
    login: "логин",
    username: "логин",
    email: "email",
    password: "пароль",
    firstName: "имя",
    lastName: "фамилия",
    fullName: "ФИО",
    code: "код",
    title: "название",
    description: "описание",
    permissionCodes: "права доступа",
    groupIds: "группы"
  };
  return byField[field] ?? field;
}

function mapValidationMessage(field: string, message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("required")) return ru.validation.required;
  if (lower.includes("email")) return ru.validation.email;
  if (field === "password" && (lower.includes("at least") || lower.includes("too small") || lower.includes("min"))) {
    return ru.validation.passwordMinCreate;
  }

  const atLeastMatch = message.match(/at least\s+(\d+)/i);
  if (atLeastMatch) {
    return `Поле «${getFieldTitle(field)}» должно содержать минимум ${atLeastMatch[1]} символа`;
  }

  const atMostMatch = message.match(/at most\s+(\d+)/i);
  if (atMostMatch) {
    return `Поле «${getFieldTitle(field)}» должно содержать не более ${atMostMatch[1]} символов`;
  }

  if (lower.includes("invalid")) {
    return `Проверьте корректность поля «${getFieldTitle(field)}»`;
  }

  return `Проверьте поле «${getFieldTitle(field)}»`;
}

function parseFieldErrorsFromObject(value: Record<string, unknown>): UiFieldErrors {
  const result: UiFieldErrors = {};

  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = normalizeFieldKey(rawKey);

    if (key === "body") {
      const bodyObj = asObject(rawValue);
      if (bodyObj) {
        for (const [nestedKey, nestedValue] of Object.entries(bodyObj)) {
          const normalizedNested = normalizeFieldKey(nestedKey);
          const first = toStringArray(nestedValue)[0];
          if (first) result[normalizedNested] = mapValidationMessage(normalizedNested, first);
        }
      }
      continue;
    }

    const first = toStringArray(rawValue)[0];
    if (first) {
      result[key] = mapValidationMessage(key, first);
    }
  }

  return result;
}

function parseFieldErrors(payload: ApiPayload): UiFieldErrors {
  const fromErrors = asObject(payload.errors);
  if (fromErrors) {
    const parsed = parseFieldErrorsFromObject(fromErrors);
    if (Object.keys(parsed).length > 0) return parsed;
  }

  const fromDetails = asObject(payload.details);
  if (fromDetails) {
    const parsed = parseFieldErrorsFromObject(fromDetails);
    if (Object.keys(parsed).length > 0) return parsed;
  }

  return {};
}

function mapStatusToMessage(status?: number): string | null {
  if (status === 400 || status === 422) return "Проверьте правильность заполнения формы";
  if (status === 401) return "Неверный логин или пароль";
  if (status === 403) return "У вас нет прав для выполнения этого действия";
  if (status === 404) return "Запрашиваемые данные не найдены";
  if (status && status >= 500) return "Ошибка сервера. Попробуйте позже";
  return null;
}

function mapRawMessage(rawMessage: string): string | null {
  const normalized = rawMessage.trim().toLowerCase();

  if (normalized === "validation error" || normalized === "validation failed") {
    return "Проверьте правильность заполнения формы";
  }
  if (normalized === "invalid credentials") return "Неверный логин или пароль";
  if (normalized === "network error" || normalized === "failed to fetch") {
    return "Не удалось связаться с сервером. Попробуйте позже";
  }
  return null;
}

export function mapApiErrorToUi(error: unknown, fallbackMessage: string): UiApiError {
  if (error instanceof ApiError) {
    const payload = asObject(error.payload) ?? {};
    const payloadMessage = typeof payload.message === "string" ? payload.message : "";
    const rawMessage = payloadMessage || error.message || "";
    const fieldErrors = parseFieldErrors(payload);

    const byRaw = rawMessage ? mapRawMessage(rawMessage) : null;
    const byStatus = mapStatusToMessage(error.status);
    const useRaw = rawMessage && !TECHNICAL_MESSAGE_RE.test(rawMessage);
    const message =
      byRaw ??
      (Object.keys(fieldErrors).length > 0 ? "Проверьте правильность заполнения формы" : null) ??
      byStatus ??
      (useRaw ? rawMessage : null) ??
      fallbackMessage;

    return { message, fieldErrors, status: error.status };
  }

  if (error instanceof Error) {
    const byRaw = mapRawMessage(error.message);
    if (byRaw) return { message: byRaw, fieldErrors: {} };
    return { message: fallbackMessage, fieldErrors: {} };
  }

  return { message: fallbackMessage, fieldErrors: {} };
}
