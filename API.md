# API модуля RBAC

Базовый префикс всех маршрутов: **`/api`**.

Авторизация (кроме `POST /api/auth/login` и `GET /api/health`): заголовок

```http
Authorization: Bearer <accessToken>
```

Ошибки возвращаются в JSON:

```json
{ "message": "Forbidden" }
```

При ошибках валидации (Zod) дополнительно поле `errors`.

---

## Health

### `GET /api/health`

Проверка работоспособности сервиса. Авторизация не требуется.

**Ответ `200`:** `{ "status": "ok" }` (или эквивалент из `health`-модуля).

---

## Auth

### `POST /api/auth/login`

**Тело:**

```json
{
  "login": "admin",
  "password": "admin123"
}
```

`login` — username или email.

**Ответ `200`:**

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer"
}
```

**Ошибки:** `401` — неверные учётные данные.

### `GET /api/auth/me`

Текущий пользователь, группы ролей и **список кодов прав** для UI.

**Ответ `200`:**

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "fullName": "System Admin",
  "isActive": true,
  "roleGroups": [{ "id": 1, "code": "admins", "title": "Administrators" }],
  "permissions": ["users:read", "users:create", "..."]
}
```

---

## Users

Требуемые права (middleware на backend):

| Метод | Право |
|-------|--------|
| GET | `users:read` |
| POST | `users:create` |
| PATCH | `users:update` |
| DELETE | `users:delete` |

### `GET /api/users/stats`

Сводная статистика.

**Ответ `200`:**

```json
{
  "totalUsers": 10,
  "activeUsers": 8,
  "adminUsers": 2
}
```

### `GET /api/users`

**Query:** `page` (default 1), `limit` (1–100, default 20), `q` (поиск), `status` — `all` | `active` | `inactive`.

**Ответ `200`:**

```json
{
  "items": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "System Admin",
      "isActive": true,
      "roleGroups": [{ "id": 1, "code": "admins", "title": "Administrators" }],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### `GET /api/users/:id`

Один пользователь (формат как элемент `items`).

### `POST /api/users`

**Тело:**

```json
{
  "username": "user1",
  "email": "user1@org.local",
  "password": "secret12",
  "fullName": "Иван Иванов",
  "isActive": true,
  "groupIds": [1, 2]
}
```

**Ответ `201`:** созданный пользователь.

### `PATCH /api/users/:id`

Частичное обновление; хотя бы одно поле в теле. `password` и `groupIds` опциональны.

### `DELETE /api/users/:id`

**Ответ `204`** без тела.

---

## Groups (группы ролей)

| Метод | Право |
|-------|--------|
| GET | `groups:read` |
| POST | `groups:create` |
| PATCH | `groups:update` |
| DELETE | `groups:delete` |

### `GET /api/groups`

**Query:** `page`, `limit`, `q`.

**Ответ `200`:** пагинированный список; элемент:

```json
{
  "id": 1,
  "code": "admins",
  "title": "Administrators",
  "description": "Full access",
  "permissions": ["users:read", "users:create"],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### `GET /api/groups/:id`

### `POST /api/groups`

```json
{
  "code": "operators",
  "title": "Операторы",
  "description": "Ограниченный доступ",
  "permissionCodes": ["users:read", "groups:read"]
}
```

### `PATCH /api/groups/:id`

### `DELETE /api/groups/:id`

**Ответ `204`**.

---

## Permissions

### `GET /api/permissions`

Требуется право `permissions:read`.

**Ответ `200`:**

```json
{
  "items": [
    { "id": 1, "code": "users:read", "description": "Read users list and details" }
  ]
}
```

---

## Коды прав (seed)

| Код | Назначение |
|-----|------------|
| `users:read` | Просмотр пользователей |
| `users:create` | Создание |
| `users:update` | Изменение |
| `users:delete` | Удаление |
| `groups:read` | Просмотр групп |
| `groups:create` | Создание групп |
| `groups:update` | Изменение групп |
| `groups:delete` | Удаление групп |
| `permissions:read` | Справочник прав |

Права назначаются группам; пользователь получает объединение прав всех своих групп.

---

## JWT

Payload при выдаче токена:

```json
{
  "sub": "1",
  "username": "admin",
  "email": "admin@example.com"
}
```

- Подпись: `JWT_SECRET` (минимум 16 символов).
- Срок: `JWT_EXPIRES_IN` (например `1d`, `8h`).

Для интеграции с другим приложением **достаточно общего секрета**, если оба сервиса доверяют одному issuer модуля, либо основное приложение получает токен через `POST /api/auth/login` модуля и передаёт его в запросах к API модуля.

---

## HTTP-коды

| Код | Ситуация |
|-----|----------|
| 400 | Ошибка валидации |
| 401 | Нет/неверный токен, неактивный пользователь |
| 403 | Нет права на операцию |
| 404 | Сущность не найдена |
| 500 | Внутренняя ошибка |
