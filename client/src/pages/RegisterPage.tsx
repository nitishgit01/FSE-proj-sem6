import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

// ─── Schema ───────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    email:           z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters required')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Component ────────────────────────────────────────────────────────

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [apiError, setApiError]   = useState<string | null>(null);

  // Resend throttle — max 1 click per 60 s
  const resendCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendSent, setResendSent]         = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async ({ email, password }: RegisterFormData) => {
    setApiError(null);
    try {
      await registerUser(email, password);
      setSubmittedEmail(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      // Always show the same message — don't reveal if email exists
      setApiError(e.message ?? 'Something went wrong. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendDisabled) return;

    setResendDisabled(true);
    setResendSent(false);

    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail }),
      });
      setResendSent(true);
    } catch {
      // Silently succeed — anti-enumeration
    }

    // Restore button after 60 s
    resendCooldownRef.current = setTimeout(() => {
      setResendDisabled(false);
      setResendSent(false);
    }, 60_000);
  };

  // ── Success state ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-1">
            We've sent a verification link to
          </p>
          <p className="font-semibold text-blue-600 text-sm mb-6">{submittedEmail}</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs text-gray-500 mb-4">
              The link expires in 24 hours. Didn't receive it?
            </p>

            {resendSent ? (
              <p className="text-sm text-green-600 font-medium">✓ Verification email resent!</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled}
                className={`
                  text-sm font-semibold px-4 py-2 rounded-xl border transition-colors w-full
                  ${resendDisabled
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                  }
                `}
              >
                {resendDisabled && !resendSent ? 'Resend available in 60s' : 'Resend verification email'}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already verified?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <span className="text-2xl font-extrabold text-blue-600 tracking-tight">WageGlass</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">100% anonymous — we never expose your identity</p>

          {apiError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="register-email"
              type="email"
              label="Email address"
              autoComplete="email"
              hint="Only used for verification — never stored in plain text"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="register-password"
              type="password"
              label="Password"
              autoComplete="new-password"
              hint="Min 8 chars, 1 uppercase, 1 number"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="register-confirm-password"
              type="password"
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              id="register-submit"
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="mt-2"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
