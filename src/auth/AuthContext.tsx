import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { PASSWORD_SHA256, USERNAME } from './credentials';
import { sha256Hex } from './hash';

const STORAGE_KEY = 'quiz_tool_auth';

type AuthValue = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

const readSession = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(readSession);

  const login = useCallback(async (username: string, password: string) => {
    const ok = username.trim() === USERNAME && (await sha256Hex(password)) === PASSWORD_SHA256;
    if (ok) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* session just won't survive a reload */
      }
    }
    setAuthenticated(ok);
    return ok;
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
