/**
 * AuthContext — global authentication state.
 *
 * Provides: user, token, isAuthenticated, loading,
 *           login(), register(), logout(), updateProfile()
 *
 * The provider auto-hydrates from localStorage on mount and
 * validates the stored token against GET /api/auth/me.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import type { ApiUser, AuthResponse, ProfileResponse } from "../types/api";

/* ─── Context shape ─── */
interface AuthState {
  user: ApiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;                           // true while hydrating on mount
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (accessToken: string, email: string) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (data: Partial<ApiUser>) => Promise<ApiUser>;
  /** Refresh user object from the backend */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

/* ─── Provider ─── */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);       // hydrate check on mount

  /* Persist helpers */
  const persist = useCallback((t: string, u: ApiUser) => {
    localStorage.setItem("globepay-token", t);
    localStorage.setItem("globepay-user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem("globepay-token");
    localStorage.removeItem("globepay-user");
    setToken(null);
    setUser(null);
  }, []);

  /* ── Hydrate on mount ── */
  useEffect(() => {
    const storedToken = localStorage.getItem("globepay-token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Validate token with backend
    api.get<{ user: ApiUser }>("/auth/me")
      .then(({ data }) => {
        setToken(storedToken);
        setUser(data.user);
        localStorage.setItem("globepay-user", JSON.stringify(data.user));
      })
      .catch(() => {
        // Token invalid — try to keep local user data for demo mode
        try {
          const raw = localStorage.getItem("globepay-user");
          if (raw) {
            setToken(storedToken);
            setUser(JSON.parse(raw));
          }
        } catch {
          clear();
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auth actions ── */
  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    persist(data.token, data.user);
    return data;
  }, [persist]);

  const register = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", { email, password });
    persist(data.token, data.user);
    return data;
  }, [persist]);

  const loginWithGoogle = useCallback(async (accessToken: string, email: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/google", { credential: accessToken, email });
    persist(data.token, data.user);
    return data;
  }, [persist]);

  const logout = useCallback(() => {
    clear();
    window.location.href = "/login";
  }, [clear]);

  const updateProfile = useCallback(async (profileData: Partial<ApiUser>): Promise<ApiUser> => {
    const { data } = await api.put<ProfileResponse>("/auth/profile", profileData);
    // Merge into existing state
    const merged = { ...user!, ...data.user };
    localStorage.setItem("globepay-user", JSON.stringify(merged));
    setUser(merged);
    return merged;
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: ApiUser }>("/auth/me");
      localStorage.setItem("globepay-user", JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      // Silently ignore — might be offline / demo mode
    }
  }, []);

  /* ── Memoised value ── */
  const value = useMemo<AuthState>(() => ({
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    refreshUser,
  }), [user, token, loading, login, register, loginWithGoogle, logout, updateProfile, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ─── Hook ─── */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
