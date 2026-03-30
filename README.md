# WageGlass 🔍💰

**Anonymous salary transparency platform** — submit your salary, see the distribution, find your percentile.

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS, React Hook Form, Zod, Recharts, React Query |
| Backend | Node.js 20, Express 4, TypeScript, Mongoose 8 |
| Database | MongoDB Atlas (free M0 tier) |
| Auth | JWT in HttpOnly cookies, bcrypt password hashing, email verification |
| Deploy | Vercel (frontend) + Railway (backend) |

## Monorepo Structure

```
wageglass/
├── client/          # React + Vite frontend
├── server/          # Express + Node backend
└── shared/
    └── types/
        └── index.ts # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+
- MongoDB Atlas account (free M0 tier)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/<org>/FSE-proj-sem6.git
cd FSE-proj-sem6

# 2. Install all dependencies
npm install

# 3. Configure environment
cp .env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.

# 4. Seed job titles (optional)
npm run seed

# 5. Start development servers
npm run dev
```

This starts:
- **Frontend** at `http://localhost:5173`
- **Backend** at `http://localhost:5000`

## Team Responsibilities

| Member | Scope |
|---|---|
| Member 1 | Monorepo scaffold, shared types, MongoDB schemas, JWT auth, security middleware, deployment |
| Member 2 | Salary submission form, multi-step form UI, submission API integration |
| Member 3 | Stats page, distribution chart, filter system, "Where do I stand?" widget |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT cookie |
| POST | `/api/auth/logout` | Clear JWT cookie |
| GET | `/api/auth/verify/:token` | Verify email address |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/submissions` | Submit salary data |
| GET | `/api/stats` | Get aggregated salary statistics |
| GET | `/api/roles?q=` | Autocomplete job title search |

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | 32+ char random secret for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Email provider for verification |

## License

See [LICENSE](./LICENSE).
