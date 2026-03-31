import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } finally { setLoggingOut(false); }
  };

  // Truncate email for display: "nitish@exa..." → never expose full address
  const shortEmail = user?.email
    ? user.email.length > 22
      ? user.email.slice(0, 20) + '…'
      : user.email
    : '';

  return (
    <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
      <nav
        className="max-w-screen-xl mx-auto px-4 py-3.5 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* ── Brand ──────────────────────────────────────────────── */}
        <Link
          to="/"
          className="text-lg font-extrabold text-blue-600 tracking-tight hover:text-blue-700 transition-colors"
          aria-label="WageGlass home"
        >
          WageGlass
        </Link>

        {/* ── Right side ──────────────────────────────────────────── */}
        {isLoading ? (
          // Skeleton while session is restoring
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-8 w-28 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : user ? (
          /* ── Authenticated ──────────────────────────────────────── */
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className={`
                text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors
                ${location.pathname.startsWith('/dashboard')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
              `}
            >
              Explore
            </Link>

            {user.email && (
              <span
                className="hidden sm:inline text-xs text-gray-400 font-medium max-w-[140px] truncate"
                title={user.email}
                aria-label="Your account email"
              >
                {shortEmail}
              </span>
            )}

            <button
              id="navbar-logout"
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                text-sm font-semibold px-3 py-1.5 rounded-xl border border-gray-200
                text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50
                transition-colors disabled:opacity-50
              "
            >
              {loggingOut ? 'Signing out…' : 'Log out'}
            </button>
          </div>
        ) : (
          /* ── Unauthenticated ────────────────────────────────────── */
          <div className="flex items-center gap-2">
            <Link
              id="navbar-login"
              to="/login"
              state={{ returnUrl: location.pathname }}
              className="
                text-sm font-semibold px-3 py-1.5 rounded-xl border border-gray-200
                text-gray-700 hover:bg-gray-50 transition-colors
              "
            >
              Log in
            </Link>

            <Link
              id="navbar-get-started"
              to="/submit"
              className="
                text-sm font-semibold px-4 py-1.5 rounded-xl
                bg-blue-600 hover:bg-blue-700 text-white transition-colors
              "
            >
              Get started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
