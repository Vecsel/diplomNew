import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ru } from "@/lib/i18n/ru";
import { API_UNAUTHORIZED_EVENT } from "@/lib/api-client";
import { mapApiErrorToUi } from "@/lib/api-error-mapper";
import { type AuthUser, loginRequest, meRequest } from "./auth-api";

const AUTH_TOKEN_KEY = "auth-token";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  isLoginLoading: boolean;
  loginError: string | null;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearLoginError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setLoginError(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const onUnauthorized = () => {
      toast.error(ru.auth.sessionExpired);
      logout();
    };
    window.addEventListener(API_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(API_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      setIsAuthChecking(false);
      return;
    }

    setToken(storedToken);
    void meRequest(storedToken)
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  const login = useCallback(async (loginValue: string, password: string) => {
    setIsLoginLoading(true);
    setLoginError(null);
    try {
      const auth = await loginRequest(loginValue, password);
      localStorage.setItem(AUTH_TOKEN_KEY, auth.accessToken);
      setToken(auth.accessToken);

      const me = await meRequest(auth.accessToken);
      setUser(me);
      toast.success(ru.auth.loginSuccess);
      navigate("/users", { replace: true });
      return true;
    } catch (error) {
      const mapped = mapApiErrorToUi(error, ru.auth.loginFailed);
      setLoginError(mapped.message);
      toast.error(mapped.message);
      return false;
    } finally {
      setIsLoginLoading(false);
    }
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAuthChecking,
      isLoginLoading,
      loginError,
      login,
      logout,
      clearLoginError: () => setLoginError(null)
    }),
    [user, token, isAuthChecking, isLoginLoading, loginError, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
