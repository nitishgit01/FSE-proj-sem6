// ╔══════════════════════════════════════════════════════════════════╗
// ║  WageGlass — Shared Type Definitions                           ║
// ║  Imported by BOTH client (React) and server (Express).         ║
// ║  ZERO external dependencies — pure TypeScript only.            ║
// ╚══════════════════════════════════════════════════════════════════╝

// ────────────────────────────────────────────────────────────────────
// §1  ENUM-LIKE UNION TYPES
// ────────────────────────────────────────────────────────────────────

/** The industry vertical a submission belongs to. */
export type Industry =
  | "technology"
  | "finance"
  | "healthcare"
  | "design"
  | "marketing"
  | "education"
  | "legal"
  | "other";

/** Broad company headcount bracket. */
export type CompanySize = "startup" | "mid" | "enterprise";

/** Where the employee physically works. */
export type WorkMode = "remote" | "hybrid" | "onsite";

/** Self-reported gender (optional, used only for aggregate pay-gap analysis). */
export type Gender = "man" | "woman" | "non-binary" | "prefer_not_to_say";

/** Functional category a canonical job title belongs to. */
export type RoleCategory =
  | "engineering"
  | "design"
  | "product"
  | "data"
  | "marketing"
  | "finance"
  | "other";

// ────────────────────────────────────────────────────────────────────
// §2  CORE DOMAIN INTERFACES
// ────────────────────────────────────────────────────────────────────

/**
 * A registered user account.
 *
 * Passwords are stored as bcrypt hashes; the plaintext is never persisted.
 * `verificationToken` fields are `select: false` in MongoDB and should
 * never reach the client.
 */
export interface IUser {
  /** MongoDB ObjectId as a hex string. */
  _id: string;

  /** Email address (stored lowercase, used as the login identifier). */
  email: string;

  /** bcrypt hash of the user's password. */
  passwordHash: string;

  /** Whether the user has clicked the email-verification link. */
  isVerified: boolean;

  /** One-time token sent via email for account verification. */
  verificationToken?: string;

  /** Expiry timestamp for `verificationToken` (typically 24 h). */
  verificationTokenExpiry?: Date;

  /** Rolling count of salary submissions made by this user. */
  submissionCount: number;

  /** Timestamp of the most recent submission (used for 30-day rate limiting). */
  lastSubmittedAt?: Date;

  /** Account creation timestamp (Mongoose `timestamps: true`). */
  createdAt: Date;

  /** Last profile-update timestamp (Mongoose `timestamps: true`). */
  updatedAt: Date;
}

/**
 * A single anonymous salary submission.
 *
 * `totalComp` is computed server-side on every save as
 * `baseSalary + bonus + equity`. The raw job title typed by the user
 * is preserved in `jobTitleRaw`; `jobTitle` holds the normalised
 * canonical form used for aggregation.
 */
export interface ISubmission {
  /** MongoDB ObjectId as a hex string. */
  _id: string;

  /** ID of the submitting user, or `undefined` for guest submissions. */
  userId?: string;

  /** Normalised canonical job title (e.g. "Software Engineer"). */
  jobTitle: string;

  /** Original title exactly as the user typed it. */
  jobTitleRaw: string;

  /** Industry vertical. */
  industry: Industry;

  /** Company name (fully optional — some users prefer not to disclose). */
  company?: string;

  /** Broad size bracket of the company. */
  companySize: CompanySize;

  /** Annual base salary before tax. */
  baseSalary: number;

  /** Annual bonus / variable pay (defaults to 0). */
  bonus: number;

  /** Annual equity / RSU / stock-option value (defaults to 0). */
  equity: number;

  /** Server-computed total compensation: `baseSalary + bonus + equity`. */
  totalComp: number;

  /** ISO 4217 currency code, e.g. "USD", "INR", "EUR". */
  currency: string;

  /** ISO 3166-1 alpha-2 country code, e.g. "US", "IN". */
  country: string;

  /** City name (free-text, trimmed). */
  city: string;

  /** Remote / hybrid / onsite. */
  workMode: WorkMode;

  /** Total years of professional experience (0–50). */
  yearsExp: number;

  /** Self-reported gender (optional). */
  gender?: Gender;

  /** Technical skills or tools (optional tags). */
  skills: string[];

  /** Whether the submission has been admin-verified (V2 feature). */
  verified: boolean;

  /** Timestamp when the user clicked "Submit" (defaults to `Date.now`). */
  submittedAt: Date;

  /** Document creation timestamp (Mongoose `timestamps: true`). */
  createdAt: Date;
}

/**
 * A canonical job title with aliases for fuzzy matching / autocomplete.
 *
 * Example:
 * ```
 * { canonical: "Software Engineer",
 *   aliases: ["SWE", "Developer", "Programmer"],
 *   category: "engineering" }
 * ```
 */
export interface IRole {
  /** MongoDB ObjectId as a hex string. */
  _id: string;

  /** The normalised, display-ready job title. */
  canonical: string;

  /** Alternative spellings, abbreviations, and synonyms. */
  aliases: string[];

  /** Functional category this role belongs to. */
  category: RoleCategory;

  /** Document creation timestamp. */
  createdAt: Date;
}

/**
 * A salary-target alert (V2 feature — scaffolded now, implemented later).
 *
 * When a new submission matches the `jobTitle + country` combination and
 * the median salary crosses `targetSalary`, the alert fires once and
 * sets `triggered = true`.
 */
export interface IAlert {
  /** MongoDB ObjectId as a hex string. */
  _id: string;

  /** ID of the user who created this alert. */
  userId: string;

  /** Canonical job title to monitor. */
  jobTitle: string;

  /** ISO 3166-1 alpha-2 country code. */
  country: string;

  /** Salary threshold that triggers the alert. */
  targetSalary: number;

  /** ISO 4217 currency code. */
  currency: string;

  /** Whether the alert has already fired. */
  triggered: boolean;

  /** Alert creation timestamp. */
  createdAt: Date;
}

// ────────────────────────────────────────────────────────────────────
// §3  API CONTRACT — QUERY / REQUEST TYPES
// ────────────────────────────────────────────────────────────────────

/**
 * Query parameters accepted by `GET /api/stats`.
 *
 * `jobTitle` is the only required filter; all others are optional
 * refinements used by the sidebar filter panel.
 */
export interface FilterParams {
  /** Canonical job title to aggregate on (required). */
  jobTitle: string;

  /** ISO 3166-1 alpha-2 country code. */
  country?: string;

  /** City name (case-insensitive partial match). */
  city?: string;

  /** Filter by work mode. */
  workMode?: WorkMode;

  /** Filter by company size bracket. */
  companySize?: CompanySize;

  /** Minimum years of experience (inclusive). */
  expMin?: number;

  /** Maximum years of experience (inclusive). */
  expMax?: number;
}

/**
 * Shape of the 3-step submission form in the React client.
 *
 * This is what React Hook Form + Zod validates on the frontend.
 * The controller maps this to `CreateSubmissionPayload` before
 * sending it to the API.
 */
export interface SubmissionFormData {
  // ── Step 1: Role ──────────────────────────────────────────
  /** Job title exactly as the user types it. */
  jobTitle: string;

  /** Industry vertical. */
  industry: Industry;

  /** Company name (optional). */
  company?: string;

  /** Company size bracket. */
  companySize: CompanySize;

  /** Years of professional experience. */
  yearsExp: number;

  // ── Step 2: Compensation ──────────────────────────────────
  /** Annual base salary. */
  baseSalary: number;

  /** ISO 4217 currency code (e.g. "USD"). */
  currency: string;

  /** Annual bonus / variable pay. */
  bonus?: number;

  /** Annual equity / RSU value. */
  equity?: number;

  // ── Step 3: Location & Demographics ───────────────────────
  /** ISO 3166-1 alpha-2 country code. */
  country: string;

  /** City name. */
  city: string;

  /** Remote / hybrid / onsite. */
  workMode: WorkMode;

  /** Self-reported gender (optional). */
  gender?: Gender;
}

/**
 * Payload sent to `POST /api/submissions`.
 *
 * Identical to `SubmissionFormData` — kept as a separate type so
 * the API contract can diverge from the form shape in the future
 * (e.g. adding `captchaToken`, `source`, etc.).
 */
export interface CreateSubmissionPayload {
  /** Job title as typed by the user. */
  jobTitle: string;

  /** Industry vertical. */
  industry: Industry;

  /** Company name (optional). */
  company?: string;

  /** Company size bracket. */
  companySize: CompanySize;

  /** Years of experience. */
  yearsExp: number;

  /** Annual base salary. */
  baseSalary: number;

  /** ISO 4217 currency code. */
  currency: string;

  /** Annual bonus (defaults to 0 on server). */
  bonus?: number;

  /** Annual equity (defaults to 0 on server). */
  equity?: number;

  /** ISO 3166-1 alpha-2 country code. */
  country: string;

  /** City name. */
  city: string;

  /** Work mode. */
  workMode: WorkMode;

  /** Gender (optional). */
  gender?: Gender;
}

// ────────────────────────────────────────────────────────────────────
// §4  API CONTRACT — RESPONSE TYPES
// ────────────────────────────────────────────────────────────────────

/**
 * A single histogram bucket rendered by the salary-distribution bar chart.
 *
 * Example: `{ rangeMin: 80_000, rangeMax: 100_000, count: 12 }`
 */
export interface HistogramBucket {
  /** Lower bound of the salary range (inclusive). */
  rangeMin: number;

  /** Upper bound of the salary range (exclusive). */
  rangeMax: number;

  /** Number of submissions that fall within this range. */
  count: number;
}

/**
 * Percentile breakpoints computed from the aggregation pipeline.
 *
 * Used by the dashboard gauge and the "Where do I stand?" feature.
 */
export interface PercentileBreakpoints {
  /** 10th percentile — bottom-of-range anchor. */
  p10: number;

  /** 25th percentile — first quartile. */
  p25: number;

  /** 50th percentile — median total compensation. */
  p50: number;

  /** 75th percentile — third quartile. */
  p75: number;

  /** 90th percentile — top-of-range anchor. */
  p90: number;
}

/**
 * Full response shape from `GET /api/stats`.
 *
 * When `insufficient` is `true`, the N ≥ 5 anonymisation guard was
 * triggered and all numeric fields are zeroed out. The client should
 * display an "Insufficient data" state instead of the charts.
 */
export interface StatsResult {
  /** Number of submissions that matched the filter combination. */
  count: number;

  /** `true` when count < 5 (anonymisation guard). */
  insufficient: boolean;

  /** Percentile breakpoints for total compensation. */
  percentiles: PercentileBreakpoints;

  /** Histogram buckets for the salary-distribution bar chart (10 buckets). */
  histogram: HistogramBucket[];

  /** Dominant currency in this filter group (e.g. "USD"). */
  currency: string;
}

/**
 * Safe subset of `IUser` stored in the React auth context.
 *
 * This is what `GET /api/auth/me` returns. Sensitive fields like
 * `passwordHash` and `verificationToken` are stripped by the
 * server's `toJSON` transform.
 */
export interface AuthUser {
  /** MongoDB ObjectId as a hex string. */
  _id: string;

  /** User's email address. */
  email: string;

  /** Whether the email has been verified. */
  isVerified: boolean;

  /** Number of submissions the user has made. */
  submissionCount: number;

  /** Timestamp of the most recent submission. */
  lastSubmittedAt?: Date;

  /** Account creation timestamp. */
  createdAt: Date;
}

// ────────────────────────────────────────────────────────────────────
// §5  API WRAPPER & ERROR TYPES
// ────────────────────────────────────────────────────────────────────

/**
 * Structured error shape returned by every failed API response.
 *
 * `fields` is populated only for validation errors, mapping
 * field paths (e.g. `"baseSalary"`) to human-readable messages.
 */
export interface ApiError {
  /** Machine-readable error code (see `ERROR_CODES`). */
  code: string;

  /** Human-readable error description. */
  message: string;

  /** Per-field validation error messages (Zod path → message). */
  fields?: Record<string, string>;
}

/**
 * Generic API response wrapper used by every endpoint.
 *
 * Discriminated on the `success` field:
 * - `success: true`  → `data: T` is present.
 * - `success: false` → `error: ApiError` is present.
 *
 * @example
 * ```ts
 * // Success
 * const res: ApiResponse<StatsResult> = {
 *   success: true,
 *   data: { count: 42, insufficient: false, ... }
 * };
 *
 * // Error
 * const res: ApiResponse<StatsResult> = {
 *   success: false,
 *   error: { code: "VALIDATION_ERROR", message: "..." }
 * };
 * ```
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// ────────────────────────────────────────────────────────────────────
// §6  ERROR CODE CONSTANTS
// ────────────────────────────────────────────────────────────────────

/**
 * Machine-readable error codes used across the entire API surface.
 *
 * Import these instead of sprinkling magic strings:
 * ```ts
 * import { ERROR_CODES } from "@wageglass/shared";
 * if (err.code === ERROR_CODES.RATE_LIMITED) { ... }
 * ```
 */
export const ERROR_CODES = {
  /** Request body / query params failed Zod validation. */
  VALIDATION_ERROR: "VALIDATION_ERROR",

  /** No valid JWT token was provided. */
  UNAUTHORIZED: "UNAUTHORIZED",

  /** Token is valid but the user lacks permission (e.g. unverified email). */
  FORBIDDEN: "FORBIDDEN",

  /** The requested resource does not exist. */
  NOT_FOUND: "NOT_FOUND",

  /** Too many requests — client should back off and retry later. */
  RATE_LIMITED: "RATE_LIMITED",

  /** Fewer than 5 submissions match the filter — anonymisation guard. */
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",

  /** Unhandled server error — logged internally, generic message to client. */
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * Union type of all possible error code string values.
 *
 * Useful for exhaustive switches on the client:
 * ```ts
 * function handleError(code: ErrorCode) {
 *   switch (code) {
 *     case ERROR_CODES.RATE_LIMITED: ...
 *   }
 * }
 * ```
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ────────────────────────────────────────────────────────────────────
// §7  RUNTIME CONST ARRAYS (for Zod .enum() validation)
// ────────────────────────────────────────────────────────────────────

/**
 * Runtime arrays matching each union type — required by Zod's `z.enum()`
 * since TypeScript union types are erased at runtime.
 */
export const INDUSTRIES = [
  "technology", "finance", "healthcare", "design",
  "marketing", "education", "legal", "other",
] as const;

export const COMPANY_SIZES = ["startup", "mid", "enterprise"] as const;

export const WORK_MODES = ["remote", "hybrid", "onsite"] as const;

export const GENDERS = ["man", "woman", "non-binary", "prefer_not_to_say"] as const;

export const ROLE_CATEGORIES = [
  "engineering", "design", "product", "data",
  "marketing", "finance", "other",
] as const;

// ────────────────────────────────────────────────────────────────────
// §8  BACKWARDS-COMPATIBLE TYPE ALIASES
// ────────────────────────────────────────────────────────────────────

/**
 * Legacy name for `FilterParams`.
 * @deprecated Use `FilterParams` instead.
 */
export type StatsQuery = FilterParams;

/**
 * Legacy name for `AuthUser`.
 * @deprecated Use `AuthUser` instead.
 */
export type UserProfile = AuthUser;

/**
 * Legacy name for `CreateSubmissionPayload`.
 * @deprecated Use `CreateSubmissionPayload` instead.
 */
export type SubmissionRequest = CreateSubmissionPayload;

/**
 * Legacy enum-style error codes used by existing server middleware.
 *
 * Maps the old `ApiErrorCode.VALIDATION_ERROR` enum syntax to the
 * new `ERROR_CODES.VALIDATION_ERROR` const object values.
 *
 * @deprecated Use `ERROR_CODES` const object instead.
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

