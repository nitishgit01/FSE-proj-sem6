import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

// ─── Schema ───────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [apiError, setApiError]             = useState<string | null>(null);
  const [showVerifyBanner, setVerifyBanner] = useState(false);
  const [emailValue, setEmailValue]         = useState('');
  const [resendLoading, setResendLoading]   = useState(false);
  const [resendSent, setResendSent]         = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setApiError(null);
    setVerifyBanner(false);
    setEmailValue(email);

    try {
      await login(email, password);
      const returnUrl = (location.state as { returnUrl?: string })?.returnUrl ?? '/';
      navigate(returnUrl, { replace: true });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 403) {
        setVerifyBanner(true);
      } else if (e.status === 429) {
        setApiError(e.message ?? 'Too many attempts. Please wait.');
      } else {
        setApiError('Invalid email or password.');
      }
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-8">
          <span className="text-2xl font-extrabold text-blue-600 tracking-tight">WageGlass</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

          {/* Verify banner */}
          {showVerifyBanner && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-medium mb-2">
                Please verify your email address before logging in.
              </p>
              {resendSent ? (
                <p className="text-xs text-amber-600">✓ Verification email sent!</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-xs font-semibold text-amber-700 underline hover:no-underline disabled:opacity-60"
                >
                  {resendLoading ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          {/* Error message */}
          {apiError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="login-email"
              type="email"
              label="Email address"
              autoComplete="email"
              error={errors.email?.message}
              {...formRegister('email')}
            />

            <Input
              id="login-password"
              type="password"
              label="Password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...formRegister('password')}
            />

            <Button
              id="login-submit"
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
