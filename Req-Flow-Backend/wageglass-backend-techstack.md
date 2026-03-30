# WageGlass — Backend & Tech Stack Document
**Version:** 1.0 — MVP  
**Date:** March 2026  
**Maintainer:** Member 1  

---

# Section 1: Tech Stack

## 1.1 Guiding Principles

Every tool in this stack was chosen against three criteria:
1. **Free tier available** — zero cost during development and initial launch.
2. **TypeScript-first** — the entire stack shares types through `/shared/types`.
3. **Production-grade defaults** — tools that can scale to 100k+ users without replacement.

---

## 1.2 Frontend

| Tool | Version | Purpose | Why This Over Alternatives |
|---|---|---|---|
| **React** | 18.x | UI framework | Component model ideal for complex, data-driven UIs |
| **Vite** | 5.x | Build tool + dev server | Dramatically faster than CRA; native TypeScript support |
| **TypeScript** | 5.x | Type safety | Shared types with backend prevent runtime shape mismatches |
| **React Router v6** | 6.x | Client-side routing | Declarative, nested routes; URL param support for filters |
| **React Hook Form** | 7.x | Form state management | Uncontrolled forms — zero re-renders per keystroke; performant |
| **Zod** | 3.x | Schema validation | Shared with backend; single source of truth for validation rules |
| **@hookform/resolvers** | 3.x | Zod ↔ RHF bridge | Connects Zod schemas to React Hook Form validation |
| **Axios** | 1.x | HTTP client | Interceptors for auth token handling; consistent error format |
| **@tanstack/react-query** | 5.x | Server state management | Caching, background refetch, loading/error states; avoids useEffect chains |
| **Recharts** | 2.x | Data visualisation | Composable; React-native; ComposedChart supports histogram + reference lines |
| **Tailwind CSS** | 3.x | Utility-first styling | Rapid UI development; no CSS files to maintain |
| **react-hot-toast** | 2.x | Toast notifications | Lightweight; accessible; simple API |
| **react-router-dom** | 6.x | URL query param sync | Filters synced to URL for shareable chart links |

---

## 1.3 Backend

| Tool | Version | Purpose | Why This Over Alternatives |
|---|---|---|---|
| **Node.js** | 20.x LTS | Runtime | LTS stability; native fetch; excellent MongoDB driver support |
| **Express.js** | 4.x | HTTP framework | Minimal, flexible; vast middleware ecosystem |
| **TypeScript** | 5.x | Type safety | Same as frontend — shared types across the monorepo |
| **ts-node-dev** | 2.x | Dev server with hot reload | Instant restart on file save; no separate compile step in dev |
| **Mongoose** | 8.x | MongoDB ODM | Schema validation at DB layer; typed with generics |
| **Zod** | 3.x | Request body validation | Same schemas imported from `/shared/types` — no duplication |
| **jsonwebtoken** | 9.x | JWT signing and verification | Industry standard; works with cookie-based auth |
| **bcryptjs** | 2.x | Password hashing | Salt rounds configurable; pure JS (no native binary dependency issues) |
| **cookie-parser** | 1.x | Parse HttpOnly cookies | Required to read JWT from incoming requests |
| **cors** | 2.x | CORS policy enforcement | Restrict API to known frontend origin |
| **helmet** | 7.x | HTTP security headers | Sets CSP, HSTS, X-Frame-Options, etc. in one line |
| **express-rate-limit** | 7.x | Rate limiting middleware | Protects auth and submission endpoints from abuse |
| **mongo-sanitize** | 1.x | NoSQL injection prevention | Strips `$` and `.` from user input before DB operations |
| **hpp** | 0.2.x | HTTP Parameter Pollution prevention | Sanitises duplicate query string params |
| **Nodemailer** | 6.x | Email sending | Verification emails; works with Gmail SMTP and Resend |
| **dotenv** | 16.x | Environment variable loading | `.env` files for local dev; production vars set in Railway |
| **morgan** | 1.x | HTTP request logging | Dev logging; easy to disable in production |

---

## 1.4 Database

| Tool | Purpose | Notes |
|---|---|---|
| **MongoDB Atlas** | Cloud database | Free M0 tier; 512MB storage; shared cluster |
| **Mongoose** | Schema + query layer | Typed schemas using TypeScript generics |
| **MongoDB Aggregation Pipeline** | Stats computation | P10/P25/P50/P75/P90 computed server-side, not in app memory |

---

## 1.5 DevOps & Deployment

| Tool | Purpose | Free Tier Limits |
|---|---|---|
| **Railway** | Backend hosting (Node.js + Express) | $5 credit/month; sufficient for MVP traffic |
| **Vercel** | Frontend hosting (React/Vite) | Unlimited hobby deployments; automatic HTTPS |
| **MongoDB Atlas M0** | Database | 512MB; shared cluster; no dedicated compute |
| **GitHub** | Version control + CI | Free for teams; branch protection rules |
| **GitHub Actions** | CI (lint + build check) | 2000 min/month free |
| **Resend** (or Gmail SMTP) | Transactional email | Resend: 100 emails/day free; Gmail: 500/day |

---

## 1.6 Development Tools

| Tool | Purpose |
|---|---|
| **ESLint** | Code quality linting |
| **Prettier** | Code formatting |
| **Postman / Thunder Client** | API testing during development |
| **MongoDB Compass** | Visual database explorer |
| **Antigravity IDE** | AI-assisted development (Claude Opus 4.6, Sonnet 4.6, Gemini, GPT-OSS) |

---

## 1.7 Monorepo Structure

```
wageglass/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Reusable primitives (Input, Select, Button, Slider)
│   │   │   ├── charts/         # Recharts components (DistributionChart, WhereDoIStand)
│   │   │   ├── forms/          # Multi-step submission form
│   │   │   ├── filters/        # Filter sidebar + mobile drawer
│   │   │   └── layout/         # Navbar, Footer, PageWrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   ├── SubmitPage.tsx
│   │   │   ├── SuccessPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts       # Auth state + login/logout
│   │   │   ├── useStats.ts      # react-query wrapper for GET /api/stats
│   │   │   └── useFilters.ts    # URL-synced filter state
│   │   ├── lib/
│   │   │   ├── axios.ts         # Axios instance with base URL + credentials
│   │   │   └── percentile.ts   # Client-side percentile computation utility
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Express + Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts           # MongoDB Atlas connection
│   │   │   └── env.ts          # Validated environment variables
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Submission.model.ts
│   │   │   ├── Role.model.ts
│   │   │   └── Alert.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── submission.routes.ts
│   │   │   ├── stats.routes.ts
│   │   │   └── role.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── submission.controller.ts
│   │   │   ├── stats.controller.ts
│   │   │   └── role.controller.ts
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts      # JWT validation from cookie
│   │   │   ├── requireVerified.ts  # isVerified check
│   │   │   ├── anonGuard.ts        # N≥5 enforcement
│   │   │   ├── rateLimiter.ts      # express-rate-limit configs
│   │   │   └── errorHandler.ts     # Global error handler
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Business logic for auth
│   │   │   ├── submission.service.ts
│   │   │   ├── stats.service.ts    # Aggregation pipeline logic
│   │   │   └── email.service.ts    # Nodemailer wrapper
│   │   ├── utils/
│   │   │   ├── jwt.ts              # Sign + verify helpers
│   │   │   └── normaliseTitle.ts   # Role alias matching
│   │   └── app.ts                  # Express app setup
│   ├── index.ts                    # Server entry point
│   └── package.json
│
├── shared/                     # Shared between client and server
│   └── types/
│       └── index.ts            # All TypeScript interfaces (IUser, ISubmission, etc.)
│
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions: lint + build check on PR
│
├── .gitignore
├── .env.example                # Template for environment variables
└── README.md
```

---

# Section 2: Backend Structure

## 2.1 Database Schema

### Collection 1: `users`

Stores optional user accounts. Accounts are not required to submit or browse.

```typescript
interface IUser {
  _id: ObjectId;                    // Auto-generated by MongoDB
  email: string;                    // Stored as bcrypt hash — NEVER raw
  passwordHash: string;             // bcrypt, 12 salt rounds
  isVerified: boolean;              // Email must be verified before login works
  verificationToken?: string;       // Deleted after use
  verificationTokenExpiry?: Date;   // 24-hour expiry
  submissionCount: number;          // Incremented on each valid submission; guards against duplicates
  lastSubmittedAt?: Date;           // Used to enforce 30-day rate limit
  createdAt: Date;                  // Auto timestamp
  updatedAt: Date;                  // Auto timestamp
}
```

**Indexes:**
- `email` — unique index (fast lookup on login)
- `createdAt` — for admin analytics

---

### Collection 2: `submissions`

The core dataset. Every salary entry lives here.

```typescript
interface ISubmission {
  _id: ObjectId;

  // Link to user (nullable — anonymous guests have no userId)
  userId?: ObjectId;              // Ref: users._id; null for guest submissions

  // Role information
  jobTitle: string;               // Canonical title from roles collection (normalised)
  jobTitleRaw: string;            // What the user actually typed (preserved for audit)
  industry: Industry;             // Enum (see below)
  company?: string;               // Optional; used for V2 company profiles
  companySize: CompanySize;       // Enum: startup | mid | enterprise

  // Compensation (all annual, in local currency)
  baseSalary: number;             // Required
  bonus: number;                  // Default 0
  equity: number;                 // Default 0
  totalComp: number;              // Computed server-side: base + bonus + equity
  currency: string;               // ISO 4217 code (e.g. "INR", "USD", "GBP")

  // Location
  country: string;                // ISO 3166-1 alpha-2 (e.g. "IN", "US", "GB")
  city: string;                   // Free text; indexed for filter queries
  workMode: WorkMode;             // Enum: remote | hybrid | onsite

  // Experience
  yearsExp: number;               // 0–50

  // Optional demographic
  gender?: Gender;                // Enum: man | woman | non-binary | prefer_not_to_say

  // Skills (V2 — stored now, used later)
  skills: string[];               // e.g. ["React", "TypeScript", "AWS"]

  // Metadata
  verified: boolean;              // Default false; admin-approved flag (V2)
  submittedAt: Date;              // Timestamp — critical for trend charts in V2
  createdAt: Date;
}

// Enums
type Industry = 
  | "technology" | "finance" | "healthcare" | "design" 
  | "marketing" | "education" | "legal" | "other";

type CompanySize = "startup" | "mid" | "enterprise";

type WorkMode = "remote" | "hybrid" | "onsite";

type Gender = "man" | "woman" | "non-binary" | "prefer_not_to_say";
```

**Indexes (critical for performance):**
```javascript
// Compound index for the primary stats query filter
{ jobTitle: 1, country: 1, city: 1 }        // Most common filter combination

// Supporting indexes
{ jobTitle: 1, country: 1 }                  // Country-level queries (no city filter)
{ submittedAt: -1 }                           // Trend queries (V2) + recency sorting
{ totalComp: 1 }                              // Range queries for salary buckets
{ company: 1 }                               // Company profile pages (V2)
{ userId: 1 }                                // User's own submission history
```

---

### Collection 3: `roles`

Normalises job titles to prevent dataset fragmentation.

```typescript
interface IRole {
  _id: ObjectId;
  canonical: string;          // The official title: "Software Engineer II"
  aliases: string[];          // ["SWE 2", "SDE II", "Dev L2", "Software Developer II"]
  category: RoleCategory;     // "engineering" | "design" | "product" | "data" | "marketing" | "finance" | "other"
  createdAt: Date;
}
```

**Indexes:**
- `canonical` — unique index
- `aliases` — text index for autocomplete search

---

### Collection 4: `alerts` (scaffolded in MVP, activated in V2)

```typescript
interface IAlert {
  _id: ObjectId;
  userId: ObjectId;           // Must be a registered, verified user
  jobTitle: string;           // Role to watch
  country: string;            // Market to watch
  targetSalary: number;       // Notify when market median crosses this
  currency: string;
  triggered: boolean;         // Prevent duplicate notifications
  createdAt: Date;
}
```

---

## 2.2 API Endpoint Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register new user; send verification email |
| POST | `/login` | None | Authenticate; set JWT cookie |
| POST | `/logout` | requireAuth | Clear JWT cookie |
| GET | `/verify/:token` | None | Verify email; activate account |
| GET | `/me` | requireAuth | Return current user profile |

### Submission Routes — `/api/submissions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Optional | Submit a new salary (guest or logged-in) |

### Stats Routes — `/api/stats`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | Aggregated salary stats for a filter combination |

**Query Parameters for GET /api/stats:**
```
?jobTitle=Software+Engineer+II
&country=IN
&city=Pune
&workMode=remote
&companySize=mid
&expMin=3
&expMax=5
```

**Response Shape:**
```typescript
interface StatsResult {
  count: number;                    // Total submissions matching filters
  insufficient: boolean;            // True if count < 5
  percentiles: {
    p10: number;
    p25: number;
    p50: number;                    // Median
    p75: number;
    p90: number;
  };
  histogram: Array<{
    rangeMin: number;
    rangeMax: number;
    count: number;
  }>;
  currency: string;                 // Currency of the results
}
```

### Role Routes — `/api/roles`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/?q=softw` | None | Autocomplete search — returns top 10 matching canonical titles |

---

## 2.3 Core Aggregation Pipeline (MongoDB)

This pipeline runs on every GET /api/stats call. It is the performance-critical path.

```javascript
// stats.service.ts
const getStats = async (filters: FilterParams): Promise<StatsResult> => {
  const matchStage = {
    $match: {
      jobTitle: filters.jobTitle,
      country: filters.country,
      ...(filters.city && { city: { $regex: filters.city, $options: 'i' } }),
      ...(filters.workMode && { workMode: filters.workMode }),
      ...(filters.companySize && { companySize: filters.companySize }),
      ...(filters.expMin !== undefined && filters.expMax !== undefined && {
        yearsExp: { $gte: filters.expMin, $lte: filters.expMax }
      }),
    }
  };

  const pipeline = [
    matchStage,
    {
      $facet: {
        // Count for N≥5 guard
        count: [{ $count: "total" }],

        // Percentile computation
        percentiles: [
          {
            $group: {
              _id: null,
              p10: { $percentile: { input: "$totalComp", p: [0.10], method: 'approximate' } },
              p25: { $percentile: { input: "$totalComp", p: [0.25], method: 'approximate' } },
              p50: { $percentile: { input: "$totalComp", p: [0.50], method: 'approximate' } },
              p75: { $percentile: { input: "$totalComp", p: [0.75], method: 'approximate' } },
              p90: { $percentile: { input: "$totalComp", p: [0.90], method: 'approximate' } },
              minSalary: { $min: "$totalComp" },
              maxSalary: { $max: "$totalComp" },
            }
          }
        ]
      }
    }
  ];

  // Histogram computed in a second pass using min/max from above
  // See stats.service.ts implementation for full histogram bucket logic
};
```

---

## 2.4 Middleware Architecture

Middleware is applied in this order on every request:

```
Request arrives
    ↓
[1] helmet()               — Security headers
[2] cors()                 — Origin check
[3] express.json()         — Parse JSON body
[4] cookie-parser()        — Parse HttpOnly cookies
[5] mongoSanitize()        — Strip $ and . from body/params
[6] hpp()                  — Deduplicate query params
[7] morgan()               — Request logging (dev only)
[8] rateLimiter (global)   — 100 req / 15 min
    ↓
Route-specific middleware (e.g. requireAuth, anonGuard, rateLimiter variants)
    ↓
Controller
    ↓
[9] errorHandler()         — Global error catch — MUST be last
```

---

## 2.5 Environment Variables

Create a `.env` file in `/server` using this template:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/wageglass

# JWT
JWT_SECRET=replace_with_32_char_random_string
JWT_EXPIRES_IN=7d

# Cookie
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false          # Set to true in production

# CORS
CLIENT_URL=http://localhost:5173   # Vercel URL in production

# Email (choose one)
# Option A: Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password   # Use Gmail App Password, not account password

# Option B: Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@wageglass.com
```

---

## 2.6 Error Response Format

All API errors follow this consistent shape:

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;           // e.g. "INSUFFICIENT_DATA", "VALIDATION_ERROR", "UNAUTHORIZED"
    message: string;        // Human-readable message for the frontend
    fields?: Record<string, string>;  // Field-level validation errors (optional)
  };
}
```

**Standard Error Codes:**

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `UNAUTHORIZED` | 401 | No valid JWT cookie |
| `FORBIDDEN` | 403 | Authenticated but not permitted (e.g. unverified account) |
| `NOT_FOUND` | 404 | Resource does not exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `INSUFFICIENT_DATA` | 200 | Filter has < 5 submissions (not an error — returned with 200) |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## 2.7 Security Checklist

Before launch, verify every item:

- [ ] `JWT_SECRET` is at least 32 random characters (generated with `crypto.randomBytes(32)`)
- [ ] JWT stored in `HttpOnly: true`, `Secure: true` (in production), `SameSite: Strict` cookie
- [ ] Raw email addresses are never stored — only bcrypt hash
- [ ] `mongoSanitize()` middleware is applied before any route handler
- [ ] CORS `origin` is set to the exact Vercel URL — no wildcards in production
- [ ] Aggregation responses never include individual `_id` or `userId` fields
- [ ] N ≥ 5 guard is tested with exactly 4 submissions (should return `INSUFFICIENT_DATA`)
- [ ] Rate limiter tested: 6th auth attempt within 1 hour should return 429
- [ ] `helmet()` applied — verify with https://securityheaders.com after deploy
- [ ] All `process.env` accesses go through `config/env.ts` which throws on missing required vars

---

*This document is the single source of truth for all technical decisions in WageGlass V1.*  
*All new tools, schema changes, and architectural decisions should be recorded here.*
