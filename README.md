# CLMS — Computer Lab Management System

Backend for SE113 Group 10. Node.js + Express + PostgreSQL + Prisma.

## Stack

- Node.js + Express
- PostgreSQL (Prisma ORM)
- JWT access + refresh (refresh hashed in DB, stored as httpOnly cookie)
- bcryptjs, express-validator, express-rate-limit
- Swagger UI

## Requirements

- Node.js >= 18
- PostgreSQL (local or Docker)

## Quick start

```bash
cd Backend
npm install

# Postgres via Docker (port 5433, matches .env)
docker run -d --name clms-pg \
  -e POSTGRES_DB=clms_db \
  -e POSTGRES_USER=clms \
  -e POSTGRES_PASSWORD=clms_dev \
  -p 5433:5432 postgres:16-alpine

cp .env.example .env   # then fill in JWT secrets + Gmail app password
npm run prisma:generate
npm run dev
```

- API: http://localhost:5000
- Swagger: http://localhost:5000/api/docs

Schema and seed data run automatically on first boot.

## Demo accounts

| Role         | Username | Password   |
| ------------ | -------- | ---------- |
| system_admin | admin    | Admin@1234 |
| lab_staff    | staff1   | Test@1234  |
| customer     | student1 | Test@1234  |

`POST /api/auth/login` with `{ identifier, password }` (identifier = email or username), copy `accessToken` and paste it into Swagger's **Authorize** dialog.

## Endpoints

| Prefix              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `/api/auth`         | Register, OTP verify, login, change password      |
| `/api/users`        | Profile, admin user management                    |
| `/api/lab-rooms`    | Lab room CRUD                                     |
| `/api/workstations` | Workstation CRUD, set state                       |
| `/api/reservations` | Reserve room/workstation, approve, reject, cancel |
| `/api/incidents`    | Report incidents, ticket handling                 |
| `/api/reports`      | Usage statistics                                  |

See Swagger for full request/response shapes.

## Response envelope

Success:

```json
{ "statusCode": 200, "message": "OK", "data": { ... } }
```

With pagination:

```json
{ "statusCode": 200, "message": "OK", "data": [ ... ], "metadata": { "total": 42, "page": 1, "pageSize": 20 } }
```

Error:

```json
{ "statusCode": 400, "message": "..." }
```

## Project layout

```
Backend/
├── prisma/schema.prisma      # Prisma schema
├── sql/                      # SQL schema + seed (auto run on boot)
├── openapi.yaml              # OpenAPI 3 spec
├── src/
│   ├── config/               # bootstrap, prisma client
│   ├── controllers/
│   ├── middlewares/          # auth, rateLimit, validate, errorHandler
│   ├── routes/
│   ├── services/             # business logic
│   ├── utils/                # ApiError, response, tokens
│   ├── validators/           # express-validator rules
│   └── index.js
└── package.json
```
