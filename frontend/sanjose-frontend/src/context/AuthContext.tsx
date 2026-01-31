import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import api from "../lib/axios";

interface User {
  id: number;
  email: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  booting: boolean; // solo al iniciar la app
  authSubmitting: boolean; // solo login / signup
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Restaurar sesión
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }

    setBooting(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthSubmitting(true);
      setError(null);

      const { data } = await api.post<{ token: string; user: User }>(
        "/auth/login",
        {
          email,
          password,
        },
      );

      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Credenciales inválidas";
      setError(msg);
      throw new Error(msg);
    } finally {
      setAuthSubmitting(false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      if (password !== confirmPassword) {
        const msg = "Las contraseñas no coinciden";
        setError(msg);
        throw new Error(msg);
      }

      try {
        setAuthSubmitting(true);
        setError(null);

        const { data } = await api.post<{ token: string; user: User }>(
          "/auth/signup",
          {
            email,
            password,
            confirm_password: confirmPassword,
          },
        );

        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);

        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Error al crear la cuenta";
        setError(msg);
        throw new Error(msg);
      } finally {
        setAuthSubmitting(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete api.defaults.headers.common.Authorization;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      authSubmitting,
      error,
      login,
      signup,
      logout,
    }),
    [user, token, booting, authSubmitting, error, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
