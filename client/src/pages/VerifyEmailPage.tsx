import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type PageState = 'loading' | 'success' | 'expired' | 'error';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { } = useAuth(); // ensure AuthProvider updates
  const [state, setState] = useState<PageState>('loading');
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent]   = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) { setState('error'); return; }

    fetch(`${API}/auth/verify/${token}`, { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          setState('success');
          // Force re-fetch of /me to update auth context
          window.dispatchEvent(new Event('wg:auth-update'));
        } else {
          const body = await res.json();
          const msg: string = body?.error?.message ?? '';
          if (msg.toLowerCase().includes('expired')) {
            setState('expired');
          } else {
            setState('error');
          }
        }
      })
      .catch(() => setState('error'));
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    try {
      await fetch(`${API}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verifying your email…</p>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Email verified!</h1>
          <p className="text-gray-500 text-sm mb-8">
            You're all set. Explore real, anonymous salary data.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
              text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Explore Salaries →
          </Link>
        </div>
      </div>
    );
  }

  // ── Expired ────────────────────────────────────────────────────────
  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">⏱️</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">This link has expired</h1>
          <p className="text-gray-500 text-sm mb-8">
            Verification links are valid for 24 hours. Enter your email to get a new one.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left">
            {resendSent ? (
              <p className="text-sm text-green-600 font-medium text-center">
                ✓ New link sent! Check your inbox.
              </p>
            ) : (
              <>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Your email address
                </label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mb-3"
                />
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || !resendEmail.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                    text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                >
                  {resendLoading ? 'Sending…' : 'Request a new link'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Generic error ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Invalid verification link</h1>
        <p className="text-gray-500 text-sm mb-6">
          This link is no longer valid. Try registering again or contact support.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 border border-gray-200 text-gray-700
            font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          ← Back to register
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
