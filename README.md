# Diplom Monorepo

Monorepo with frontend (`front`) and backend (`back`) applications.

## Stack

### Front
- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui base setup
- React Router
- Light/Dark theme support

### Back
- Node.js + Express.js + TypeScript
- PostgreSQL (`pg`)
- `dotenv`, `cors`, `jsonwebtoken`, `bcrypt`
- Modules: `auth`, `users`, `groups`, `permissions`
- Health endpoint

## Project structure

```text
.
├── front
└── back
```

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Run frontend:

```bash
npm run dev:front
```

4. Initialize backend DB:

```bash
npm run db:init -w back
npm run db:seed -w back
```

5. Run backend:

```bash
npm run dev:back
```

## API routes

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth required)
- `GET /api/users` (auth required)
- `POST /api/users` (auth + permission)
- `PATCH /api/users/:id` (auth + permission)
- `DELETE /api/users/:id` (auth + permission)
- `GET /api/groups` (auth required)
- `POST /api/groups` (auth + permission)
- `PATCH /api/groups/:id` (auth + permission)
- `DELETE /api/groups/:id` (auth + permission)
- `GET /api/permissions` (auth required)

Seeded users:
- login: `admin` or `admin@example.com`
- password: `admin123`
