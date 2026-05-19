# CLMS — Computer Lab Management System

A full-stack web application for managing computer labs, workstations, and reservations. Built for SE113 — Group 10.

## Tech Stack

| Layer    | Technologies                                                                 |
| -------- | ---------------------------------------------------------------------------- |
| Frontend | React 18, Vite, TailwindCSS, Zustand, React Router 6                         |
| Backend  | Node.js, Express, Prisma ORM, PostgreSQL                                     |
| Auth     | JWT (access + refresh via httpOnly cookie), bcryptjs, OTP email verification |
| Docs     | Swagger UI (OpenAPI 3)                                                       |

## Quick Start

```bash
# 1. Backend
cd Backend
npm install
cp .env.example .env        # fill in JWT secrets + email credentials
npm run prisma:generate
npm run dev                  # → http://localhost:5000

# 2. Frontend
cd Frontend
npm install
npm run dev                  # → http://localhost:3000 (proxies /api → :5000)
```

## Features

- Registration, login, email OTP verification, password reset
- Browse and reserve lab rooms or workstations by time slot
- Approval queue for staff/admin to accept or reject requests
- Incident reporting and ticket management
- User management (block/unblock accounts)
- Usage statistics and reports (admin)
- Role-based access: customer, lab_staff, system_admin

## Project Structure

```
├── Backend/
│   ├── prisma/schema.prisma
│   ├── openapi.yaml
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middlewares/
│       ├── validators/
│       └── utils/
├── Frontend/
│   └── src/
│       ├── pages/          # auth, dashboard, lab rooms, workstations, reservations, incidents, admin
│       ├── components/     # layout (Sidebar, Topbar), ui (Modal, Badge, Pagination, Loader)
│       ├── services/       # API layer (axios)
│       ├── store/          # Zustand auth store
│       └── lib/            # interceptors, utils, auth helpers
└── README.md
```

## API Docs

Start the backend, then visit: http://localhost:5000/api/docs

## License

MIT
