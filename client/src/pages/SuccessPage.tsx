import React, { useMemo } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { computePercentile } from '../lib/percentile';
import { formatCompact } from '../lib/formatters';
import type { FormData } from '../components/forms/submissionSchema';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SuccessState {
  submissionId: string;
  formData: FormData;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SuccessPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as SuccessState | null;

  // Guard: if someone navigates here directly without submitting, redirect
  if (!state?.submissionId) {
    return <Navigate to="/submit" replace />;
  }

  const { formData } = state;

  // Build the link back to the stats page with pre-applied filters
  const statsHref = useMemo(() => {
    const params = new URLSearchParams();
    if (formData.jobTitle) params.set('jobTitle', formData.jobTitle);
    if (formData.country)  params.set('country',  formData.country);
    if (formData.city)     params.set('city',      formData.city);
    return `/dashboard?${params.toString()}`;
  }, [formData]);

  const totalComp =
    (formData.baseSalary ?? 0) +
    (formData.bonus  ?? 0) +
    (formData.equity ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* ── Success card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-10 text-center">

          {/* Icon */}
          <div className="text-6xl mb-4">🎉</div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Salary submitted!
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Thank you for contributing to salary transparency.
            Your data is now part of the anonymised dataset.
          </p>

          {/* Submission summary chip */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100
            text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd" />
            </svg>
            Submission ID: {state.submissionId.slice(-8).toUpperCase()}
          </div>

          {/* What you submitted */}
          <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-8 text-left space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Your submission
            </p>
            {[
              { label: 'Role',     value: formData.jobTitle },
              { label: 'Location', value: [formData.city, formData.country].filter(Boolean).join(', ') },
              { label: 'Total TC', value: formatCompact(totalComp, formData.currency) },
              { label: 'Mode',     value: formData.workMode },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">{value}</span>
              </div>
            ))}
          </div>

          {/* Logged-in: show explore CTA; guest: show dual CTAs */}
          {user ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                See how your salary compares to your peers.
              </p>
              <Link
                to={statsHref}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700
                  text-white font-semibold py-3 rounded-2xl transition-colors text-sm"
              >
                Explore salaries for {formData.jobTitle} →
              </Link>
            </>
          ) : (
            <>
              {/* Teaser for guests */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-5 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  See where you stand 📊
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Create a free account to unlock your personal percentile rank after each submission.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700
                    text-white font-semibold py-3 rounded-2xl transition-colors text-sm"
                >
                  Create a free account →
                </Link>
                <Link
                  to={statsHref}
                  className="flex items-center justify-center gap-2 w-full border border-gray-200
                    text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-2xl transition-colors text-sm"
                >
                  Explore salaries without an account
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd" />
          </svg>
          Your identity is never attached to your salary record.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
