// ============================================================
// WageGlass — Shared TypeScript Types
// Used by BOTH client and server. Push changes here first.
// ============================================================

// ────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────

export const INDUSTRIES = [
  'technology',
  'finance',
  'healthcare',
  'design',
  'marketing',
  'education',
  'legal',
  'other',
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const COMPANY_SIZES = ['startup', 'mid', 'enterprise'] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const WORK_MODES = ['remote', 'hybrid', 'onsite'] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const GENDERS = ['man', 'woman', 'non-binary', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export const ROLE_CATEGORIES = [
  'engineering',
  'design',
  'product',
  'data',
  'marketing',
  'finance',
  'other',
] as const;
export type RoleCategory = (typeof ROLE_CATEGORIES)[number];

// ────────────────────────────────────────────────────────────
// Document Interfaces (Mongoose schemas implement these)
// ────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  submissionCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmission {
  _id: string;
  userId?: string;
  jobTitle: string;
  jobTitleRaw: string;
  industry: Industry;
  company?: string;
  companySize: CompanySize;
  baseSalary: number;
  bonus: number;
  equity: number;
  totalComp: number;
  currency: string;
  country: string;
  city: string;
  workMode: WorkMode;
  yearsExp: number;
  gender?: Gender;
  skills: string[];
  verified: boolean;
  submittedAt: Date;
  createdAt: Date;
}

export interface IRole {
  _id: string;
  canonical: string;
  aliases: string[];
  category: RoleCategory;
  createdAt: Date;
}

export interface IAlert {
  _id: string;
  userId: string;
  jobTitle: string;
  country: string;
  targetSalary: number;
  currency: string;
  triggered: boolean;
  createdAt: Date;
}

// ────────────────────────────────────────────────────────────
// API Request Types
// ────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SubmissionRequest {
  jobTitle: string;
  industry: Industry;
  company?: string;
  companySize: CompanySize;
  yearsExp: number;
  baseSalary: number;
  currency: string;
  bonus?: number;
  equity?: number;
  country: string;
  city: string;
  workMode: WorkMode;
  gender?: Gender;
}

// ────────────────────────────────────────────────────────────
// API Response Types
// ────────────────────────────────────────────────────────────

export interface StatsQuery {
  jobTitle: string;
  country?: string;
  city?: string;
  workMode?: WorkMode;
  companySize?: CompanySize;
  expMin?: number;
  expMax?: number;
}

export interface HistogramBucket {
  rangeMin: number;
  rangeMax: number;
  count: number;
}

export interface Percentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface StatsResult {
  count: number;
  insufficient: boolean;
  percentiles: Percentiles;
  histogram: HistogramBucket[];
  currency: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  isVerified: boolean;
  submissionCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
}

// ────────────────────────────────────────────────────────────
// API Wrapper Types
// ────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ────────────────────────────────────────────────────────────
// Error Codes
// ────────────────────────────────────────────────────────────

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
