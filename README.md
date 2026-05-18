# CLMS — Computer Lab Management System

Backend for SE113 Group 10's testing project. Node.js + Express + PostgreSQL, JWT auth, Swagger UI.

## Stack

- Node.js (Express)
- PostgreSQL (run via Docker)
- JWT (access + refresh, refresh token whitelist stored in DB)
- bcryptjs, express-validator, express-rate-limit
- Swagger UI at `/api/docs`

## Prerequisites

- Node.js >= 18
- Docker Desktop (or any reachable PostgreSQL instance)

## Quick start

```bash
cd Backend
npm install

# Run Postgres on port 5433 to avoid clashing with a host-installed Postgres on 5432
docker run -d --name clms-postgres ^
  -e POSTGRES_DB=clms_db ^
  -e POSTGRES_USER=clms ^
  -e POSTGRES_PASSWORD=clms_dev ^
  -p 5433:5432 postgres:16-alpine

copy .env.example .env
npm run dev
```

- Server: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/openapi.json`

The schema in `sql/schema.sql` is applied on every boot (idempotent), and demo data is seeded only when the `users` table is empty.

## Demo accounts (after first seed)

| Role         | Username | Password   |
| ------------ | -------- | ---------- |
| system_admin | admin    | Admin@1234 |
| lab_staff    | staff1   | Test@1234  |
| customer     | student1 | Test@1234  |

Login flow: `POST /api/auth/login` with `{ "identifier": "admin", "password": "Admin@1234" }`, copy `data.accessToken`, paste it into Swagger's **Authorize** dialog. Refresh token is also returned and set as an HTTP-only cookie.

## Smoke test

```bash
cd Backend
powershell -ExecutionPolicy Bypass -File scripts/smoke.ps1
```

Hits every endpoint (happy path + key error paths). Last run: **60/60 PASS**.

## Endpoints

| Group        | Path prefix                                     | Use cases             |
| ------------ | ----------------------------------------------- | --------------------- |
| Auth         | `/api/auth`                                     | UC-01..04, UC-06      |
| Users        | `/api/users`                                    | UC-05, 28, 29, 30     |
| Lab rooms    | `/api/lab-rooms`                                | UC-07, 20, 21, 22, 23 |
| Workstations | `/api/workstations`                             | UC-08, 19, 24..27     |
| Reservations | `/api/reservations`                             | UC-09..12, 14, 15, 16 |
| Incidents    | `/api/incidents`                                | UC-13, 17, 18         |
| Reports      | `/api/reports`                                  | UC-31                 |
| System       | `/api/health`, `/api/docs`, `/api/openapi.json` | -                     |

Full request/response shapes are in Swagger.

## Response envelope

```json
{ "status": "success", "timestamp": "...", "data": { ... }, "error": null }
{ "status": "error",   "timestamp": "...", "data": null,    "error": { "code": 400, "message": "...", "details": ... } }
```

## Project layout

```
Backend/
├── openapi.yaml           # OpenAPI 3 spec, served by /api/docs
├── sql/
│   └── schema.sql         # PG schema (idempotent, auto-run on boot)
├── scripts/
│   └── smoke.ps1          # Smoke test for every endpoint
├── src/
│   ├── config/
│   │   ├── bootstrap.js   # Run schema + demo seed
│   │   ├── db.js          # pg pool, ?-style placeholders, withTransaction
│   │   └── env.js
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── index.js
├── .env.example
└── package.json
```

## Notes

- Refresh tokens are SHA-256 hashed before storage; revoke-on-rotate; full-logout on password change/reset.
- Without SMTP credentials, verification and reset links are logged to the console (dev-friendly).
- Dev rate limit is intentionally high (10000 req/min); `.env.example` keeps the production-ish 100 req/min.
- All service queries use `?` placeholders; the DB layer rewrites them to `$1, $2, ...` for `pg`.
- Concurrency-sensitive paths use transactions: reservation overlap checks (pending vs approved races), capacity checks when shrinking a lab, dependency checks when deleting labs/workstations, and an opt-in force flag to set a workstation to maintenance while cancelling affected approved bookings.
