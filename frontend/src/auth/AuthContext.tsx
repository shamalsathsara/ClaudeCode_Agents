import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type User } from '../lib/api';

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (input: { email: string; password: string }) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .me()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (input: { email: string; password: string }) => {
    const u = await api.signIn(input);
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const u = await api.signUp(input);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
