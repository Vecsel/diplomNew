# Интеграция модуля RBAC

## Назначение модуля

Модуль решает задачу **централизованного управления пользователями, группами ролей и правами доступа** (RBAC) для внутренних административных систем организации. Он не привязан к конкретному домену бизнес-логики: предоставляет универсальный REST API и готовую админ-панель.

Типичные сценарии:

- отдельный раздел «Администрирование» в корпоративном портале;
- микросервис авторизации/учётных записей, с которым работают другие системы;
- встраивание экранов пользователей и групп в существующее React-приложение.

---

## Архитектура интеграции

```text
┌─────────────────────┐     HTTPS + JWT      ┌──────────────────────┐
│  Основное приложение │ ───────────────────► │  Backend модуля RBAC │
│  (любой стек)        │     /api/*           │  Express + PostgreSQL │
└─────────────────────┘                      └──────────┬───────────┘
         │ optional UI merge                            │
         ▼                                              ▼
┌─────────────────────┐                      ┌──────────────────────┐
│  Frontend модуля     │ ── VITE_API_URL ───► │  Та же БД users/RBAC │
│  (React SPA)         │                      └──────────────────────┘
└─────────────────────┘
```

**Слои:**

| Слой | Роль при интеграции |
|------|---------------------|
| PostgreSQL | Единый источник пользователей, групп, permissions |
| Backend (`back/`) | Контракт API, JWT, проверка прав на каждом запросе |
| Frontend (`front/`) | Опциональная UI-оболочка; заменяема своим интерфейсом |

Backend монтирует маршруты под префиксом `/api` (`back/src/app.ts`). Frontend обращается только к этому префиксу через настраиваемый `VITE_API_URL`.

---

## Требования к окружению

- Node.js 20+
- PostgreSQL 14+
- npm (workspaces в корне репозитория)

---

## Установка и запуск

### Backend

```bash
cd back   # или из корня: npm run dev:back
cp .env.example .env   # либо корневой .env — см. back/src/config/env.ts
npm install            # из корня монорепозитория: npm install
npm run db:init
npm run db:seed
npm run dev            # разработка
# npm run build && npm run start  # production
```

Сервис слушает порт `PORT` (по умолчанию 4000).

### Frontend

```bash
cp front/.env.example front/.env
# обязательно: VITE_API_URL=http://<host>:<port>/api
npm run dev:front
```

---

## Настройка базы данных

1. Создайте БД PostgreSQL.
2. Задайте `DATABASE_URL` в `back/.env`.
3. Примените схему:

```bash
npm run db:init -w back
```

Скрипт выполняет `back/sql/schema.sql` (таблицы `users`, `role_groups`, `permissions`, связи M:N).

4. Загрузите справочник прав и демо-данные:

```bash
npm run db:seed -w back
```

### Создание начального администратора

**Способ A (рекомендуется для первого запуска):** `npm run db:seed -w back` создаёт пользователя `admin` / `admin123` в группе `admins` со всеми permissions.

**Способ B (production):** после `db:init` без seed выполните SQL вручную:

1. Вставьте записи в `permissions` (коды из [API.md](./API.md)).
2. Создайте группу `admins` в `role_groups`.
3. Свяжите группу со всеми `permission_id` в `role_group_permissions`.
4. Создайте пользователя с `password_hash` = bcrypt-хеш пароля.
5. Добавьте связь в `user_role_groups`.

**Способ C:** войдите под seed-админом и создайте учётные записи через API/UI.

---

## Настройка переменных окружения

### Backend (`back/.env.example`)

| Переменная | Описание |
|------------|----------|
| `NODE_ENV` | `development` \| `test` \| `production` |
| `PORT` | Порт HTTP API |
| `DATABASE_URL` | Строка подключения PostgreSQL |
| `JWT_SECRET` | Секрет подписи JWT (≥ 16 символов) |
| `JWT_EXPIRES_IN` | Срок жизни токена (`1d`, `8h`, …) |
| `CORS_ORIGIN` | Разрешённые Origin; **несколько через запятую** |

Пример для портала и отдельной админки:

```env
CORS_ORIGIN=https://portal.org.local,https://admin.org.local,http://localhost:5173
```

### Frontend (`front/.env.example`)

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `VITE_API_URL` | да | Базовый URL API, например `https://rbac-api.org.local/api` |
| `VITE_BASE_PATH` | нет | Базовый путь SPA (`/` или `/diplomNew/` для подкаталога) |

---

## Интеграция backend

1. Разверните API как отдельный сервис (Docker/VM/K8s).
2. Откройте доступ к `/api` для доверенных сетей или API-gateway.
3. Настройте `CORS_ORIGIN` на origin основного приложения.
4. Основное приложение:
   - аутентифицирует пользователя через `POST /api/auth/login`, **или**
   - использует свой SSO и синхронизирует пользователей в БД модуля (требует доработки — см. ограничения).
5. Для каждого защищённого действия вызывайте API модуля с `Authorization: Bearer <token>`.

Проверка прав **всегда на backend** (`requirePermission` в `back/src/routes.ts`, `back/src/common/middleware/permission.ts`).

---

## Интеграция frontend

### Отдельная админ-панель

Соберите `front` и разместите статику за reverse-proxy. Укажите `VITE_API_URL` на production API.

### Встраивание в React

Минимальный набор для переноса:

| Компонент / модуль | Путь |
|--------------------|------|
| HTTP-клиент | `front/src/lib/api-client.ts` |
| Auth | `front/src/features/auth/*` |
| Проверка прав UI | `front/src/features/auth/use-can.ts`, `front/src/lib/permissions.ts` |
| Страницы | `front/src/pages/users-page.tsx`, `groups-page.tsx` |
| API-слой | `front/src/features/users/*`, `groups/*`, `permissions/*` |

Шаги:

1. Скопируйте или подключите пакеты (alias `@/` → ваш проект).
2. Оберните приложение в `AuthProvider` + `BrowserRouter` с нужным `basename` (`import.meta.env.BASE_URL`).
3. Задайте `VITE_API_URL` на URL backend модуля.
4. Добавьте маршруты `/admin/users`, `/admin/groups` (пример ниже).
5. Скрывайте кнопки через `useCan()`; backend отклонит запрос без права.

---

## Авторизация через JWT

1. Клиент отправляет `POST /api/auth/login` с логином и паролем.
2. Сохраняет `accessToken` (в модуле — `localStorage`, ключ `auth-token`; в хост-приложении — свой storage).
3. Передаёт заголовок `Authorization: Bearer <accessToken>` во всех запросах.
4. Для UI прав вызывает `GET /api/auth/me` и использует массив `permissions`.

Middleware (`back/src/middleware/auth.middleware.ts`):

- проверяет подпись JWT;
- загружает пользователя из БД;
- отклоняет неактивных (`is_active = false`).

---

## Проверка прав доступа

### На backend

Код права привязан к HTTP-методу в `back/src/routes.ts`. Пример: `DELETE /api/users/:id` → `users:delete`.

Сервис `permissionsService.userHasPermission(userId, code)` проверяет права через группы пользователя.

### На frontend

После `GET /api/auth/me`:

```tsx
import { useCan } from "@/features/auth/use-can";

const { can } = useCan();
if (can("users:create")) {
  // показать кнопку «Создать»
}
```

Коды поддерживают формат `users:create` и алиас `users.create` (`normalizePermissionCode`).

**Важно:** скрытие кнопок — только UX; безопасность обеспечивает backend (403).

---

## Список основных API-методов

См. [API.md](./API.md). Кратко:

- `GET /api/health`
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST|PATCH|DELETE /api/users`, `GET /api/users/stats`
- `GET|POST|PATCH|DELETE /api/groups`
- `GET /api/permissions`

---

## Пример подключения к существующему приложению

### Пример A — внешний клиент (не React)

```javascript
const API = process.env.RBAC_API_URL; // https://rbac.example.com/api

async function login(login, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password })
  });
  const { accessToken } = await res.json();
  return accessToken;
}

async function canCreateUser(token) {
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const me = await res.json();
  return me.permissions.includes("users:create");
}
```

### Пример B — маршруты в React-хосте

```tsx
import { AuthProvider } from "./rbac/auth-context";
import { UsersPage } from "./rbac/pages/users-page";

// .env хоста: VITE_API_URL=https://rbac.example.com/api

<AuthProvider>
  <Routes>
    <Route path="/admin/users" element={<UsersPage />} />
  </Routes>
</AuthProvider>
```

### Пример C — только API, свой UI

Организация разрабатывает свой интерфейс; модуль поставляет только `back` + PostgreSQL. Frontend модуля не используется.

---

## Вариант 1 — отдельное административное приложение

| Компонент | Развёртывание |
|-----------|----------------|
| Backend | Отдельный сервис, порт `PORT` |
| Frontend | Отдельная статика / поддомен `admin.*` |
| Основное приложение | Вызывает API модуля или читает ту же БД |

Поток:

1. Администратор открывает админ-панель модуля.
2. Логин → JWT модуля.
3. Управление пользователями/группами через UI модуля.
4. Бизнес-приложение при действиях пользователя запрашивает `GET /api/auth/me` или проверяет права через свою прослойку с тем же `JWT_SECRET` (если токены выдаёт модуль).

---

## Вариант 2 — интеграция в существующее React-приложение

| Аспект | Действие |
|--------|----------|
| API URL | `VITE_API_URL` в `.env` хоста |
| Страницы | Импорт `UsersPage`, `GroupsPage` или копирование feature-папок |
| Auth | Общий `AuthProvider` или адаптер поверх корпоративного SSO + токен модуля |
| Права UI | `useCan()` + `permissions` из `/auth/me` |
| Права server | Без изменений — все запросы идут на backend модуля |

Рекомендуемый префикс маршрутов хоста: `/admin/*`, чтобы не конфликтовать с публичными страницами.

---

## Ограничения текущей реализации

| Ограничение | Комментарий |
|-------------|-------------|
| Нет npm-пакета | Интеграция через копирование исходников или HTTP API, не `npm install @org/rbac` |
| Единый префикс `/api` | Не настраивается через env (можно проксировать на gateway) |
| Своя форма логина | Нет OIDC/SAML/LDAP out of the box |
| JWT только от модуля | Внешний IdP требует синхронизации пользователей или доработки auth |
| Один тип токена | Access token без refresh; продление — повторный login |
| Frontend не iframe-widget | Встраивание — уровень исходников/маршрутов, не `<script src="...">` |
| `localStorage` для токена | Для строгих требований безопасности — заменить на httpOnly cookie (доработка) |

Эти пункты **не мешают** позиционировать проект как интегрируемый модуль на уровне API и опционального UI.

---

## Направления дальнейшего развития

- npm-пакет `@org/rbac-admin` с экспортом страниц и `AuthProvider`;
- настраиваемый `API_PREFIX` и публикация OpenAPI/Swagger;
- refresh-токены и интеграция с корпоративным IdP;
- webhooks при изменении прав;
- единый gateway: основное приложение проксирует `/rbac/*` → модуль;
- публикация UI как Module Federation remote.

---

## Связанные документы

- [README.md](./README.md) — обзор и быстрый старт
- [API.md](./API.md) — полный контракт REST
