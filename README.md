# Модуль управления ролями и доступом (RBAC)

Веб-модуль для настройки пользователей, групп ролей и разграничения прав доступа во внутренней административной системе организации. Состоит из **REST API (backend)** и **админ-панели (frontend)**, которые можно развернуть отдельно или встроить в существующее веб-приложение.

Подробная инструкция по интеграции: [INTEGRATION.md](./INTEGRATION.md)  
Описание API: [API.md](./API.md)

## Стек

| Часть | Технологии |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind, shadcn/ui, React Router |
| Backend | Node.js, Express, TypeScript, PostgreSQL, JWT, bcrypt |
| БД | PostgreSQL, схема в `back/sql/schema.sql` |

## Структура репозитория

```text
.
├── front/          # SPA админ-панель
├── back/           # REST API модуля
├── back/sql/       # SQL-схема
├── INTEGRATION.md  # интеграция в другое приложение
└── API.md          # контракт API
```

## Быстрый старт (локально)

### 1. Зависимости

```bash
npm install
```

### 2. Переменные окружения

```bash
cp .env.example .env
cp front/.env.example front/.env
cp back/.env.example back/.env
```

При использовании одного корневого `.env` backend подхватит его автоматически (`back/src/config/env.ts`).

### 3. PostgreSQL

Создайте базу, например:

```sql
CREATE DATABASE diplom;
```

Укажите строку подключения в `DATABASE_URL` (см. `back/.env.example`).

### 4. Схема и начальные данные

```bash
npm run db:init -w back
npm run db:seed -w back
```

После seed доступен администратор:

- логин: `admin` или `admin@example.com`
- пароль: `admin123`

### 5. Запуск

```bash
npm run dev:back
npm run dev:front
```

- API: `http://localhost:4000/api`
- Админ-панель: `http://localhost:5173`

## Варианты использования

### Вариант 1 — отдельное административное приложение

Backend и frontend работают как **отдельные сервисы**. Основная система организации обращается к тому же API (`/api/users`, `/api/groups`, …) или использует общую БД пользователей и прав. Подробнее — [INTEGRATION.md § Вариант 1](./INTEGRATION.md#вариант-1--отдельное-административное-приложение).

### Вариант 2 — встраивание в React-приложение

Страницы `users` и `groups`, хуки `useCan`, `api-client` и `AuthProvider` можно перенести в существующий проект; URL API задаётся через `VITE_API_URL`. Проверка прав на UI — по `GET /api/auth/me`, окончательная — на backend. Подробнее — [INTEGRATION.md § Вариант 2](./INTEGRATION.md#вариант-2--интеграция-в-существующее-react-приложение).

## Сборка production

```bash
npm run build
```

Backend:

```bash
npm run start -w back
```

Frontend (статика):

```bash
npm run build -w front
npm run preview -w front
```

Для размещения в подкаталоге задайте `VITE_BASE_PATH` (см. `front/.env.example`).

## Основные endpoint'ы

| Метод | Путь | Назначение |
|-------|------|------------|
| GET | `/api/health` | Проверка доступности |
| POST | `/api/auth/login` | Выдача JWT |
| GET | `/api/auth/me` | Текущий пользователь и permissions |
| CRUD | `/api/users`, `/api/groups` | Управление сущностями |
| GET | `/api/permissions` | Справочник прав |

Полный список и форматы — в [API.md](./API.md).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev:front` | Vite dev-server |
| `npm run dev:back` | API с hot-reload |
| `npm run db:init -w back` | Применить `schema.sql` |
| `npm run db:seed -w back` | Права, группы, demo-пользователи |

## Диплом / защита

Модуль позиционируется как **встраиваемый административный компонент**: backend предоставляет независимый контракт API с JWT и RBAC; frontend — опциональная UI-оболочка, настраиваемая через переменные окружения (`VITE_API_URL`, `CORS_ORIGIN`, `VITE_BASE_PATH`). Интеграция с корпоративным порталом не требует форка логики прав — достаточно вызова API и согласованного `JWT_SECRET`.
