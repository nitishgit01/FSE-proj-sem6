import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser } from '@shared/types/index';

// ─── API base ──────────────────────────────────────────────────────────

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',            // send wg_token cookie
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });

  const body = await res.json();

  if (!res.ok) {
    const err = new Error(body?.error?.message ?? 'Request failed') as Error & {
      status: number;
      code: string;
    };
    err.status = res.status;
    err.code   = body?.error?.code ?? 'UNKNOWN';
    throw err;
  }

  return body.data as T;
}

// ─── Types ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:      AuthUser | null;
  isLoading: boolean;
  login:     (email: string, password: string) => Promise<void>;
  logout:    () => Promise<void>;
  register:  (email: string, password: string) => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  /** Restore session from cookie on mount */
  useEffect(() => {
    apiFetch<{ user: AuthUser }>('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))           // 401 → unauthenticated, that's fine
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { user } = await apiFetch<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(user);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => null);
    setUser(null);
    window.location.href = '/';   // hard redirect clears any in-memory state
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<void> => {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // No user set — email must be verified first
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
