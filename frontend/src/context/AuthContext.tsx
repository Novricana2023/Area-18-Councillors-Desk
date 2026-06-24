"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, clearAuthToken, hasAuthToken, setAuthToken } from "@/lib/api";
import { COUNCILLOR_ROLES, isSuperAdminUser } from "@/lib/constants";
import type { AuthResponseDto, LoginDto, RegisterDto } from "@/lib/types";

const AUTH_USER_KEY = "auth_user";

function readCachedUser(): AuthResponseDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthResponseDto) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: AuthResponseDto | null) {
  if (typeof window === "undefined") return;
  if (user) {
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(AUTH_USER_KEY);
  }
}

interface AuthContextValue {
  user: AuthResponseDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  isCouncillor: boolean;
  isSuperAdmin: boolean;
  login: (dto: LoginDto) => Promise<AuthResponseDto>;
  councillorLogin: (dto: LoginDto) => Promise<AuthResponseDto>;
  register: (dto: RegisterDto) => Promise<AuthResponseDto>;
  googleLogin: (idToken: string, portal?: "citizen" | "councillor") => Promise<AuthResponseDto>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthResponseDto | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistAuth(response: AuthResponseDto) {
  setAuthToken(response.token, response.expiresAt);
  writeCachedUser(response);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponseDto | null>(() => readCachedUser());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!hasAuthToken()) {
      clearAuthToken();
      writeCachedUser(null);
      setUser(null);
      return;
    }
    try {
      const current = await api.auth.me();
      setUser(current);
      writeCachedUser(current);
    } catch {
      clearAuthToken();
      writeCachedUser(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!hasAuthToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    const cached = readCachedUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (dto: LoginDto) => {
    const response = await api.auth.login(dto);
    persistAuth(response);
    setUser(response);
    return response;
  }, []);

  const councillorLogin = useCallback(async (dto: LoginDto) => {
    const response = await api.auth.councillorLogin(dto);
    persistAuth(response);
    setUser(response);
    return response;
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    const response = await api.auth.register(dto);
    persistAuth(response);
    setUser(response);
    return response;
  }, []);

  const googleLogin = useCallback(async (idToken: string, portal: "citizen" | "councillor" = "citizen") => {
    const response = await api.auth.google({ idToken, portal });
    persistAuth(response);
    setUser(response);
    return response;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    writeCachedUser(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isCouncillor: user ? COUNCILLOR_ROLES.includes(user.role) : false,
      isSuperAdmin: user ? isSuperAdminUser(user.email, user.role) : false,
      login,
      councillorLogin,
      register,
      googleLogin,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading, login, councillorLogin, register, googleLogin, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
