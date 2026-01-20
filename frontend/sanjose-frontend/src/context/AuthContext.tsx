import {
  createContext,
  useContext,
  useState,
  useCallback,
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
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ← Cambiado a false (ya no carga sesión)
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    // Solo limpiamos el estado (ya no hay localStorage)
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get<User>("/auth/profile");
      setUser(response.data);
    } catch (err) {
      console.warn("No se pudo refrescar el perfil:", err);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<{ token: string; user: User }>("/auth/login", {
        email,
        password,
      });

      const { token: newToken, user: newUser } = response.data;

      // Solo guardamos en memoria (state)
      setToken(newToken);
      setUser(newUser);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Credenciales inválidas o error de conexión";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
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
        setIsLoading(true);
        setError(null);

        const response = await api.post<{ token: string; user: User }>("/auth/signup", {
          email,
          password,
          confirm_password: confirmPassword,
        });

        const { token: newToken, user: newUser } = response.data;

        // Solo guardamos en memoria (state)
        setToken(newToken);
        setUser(newUser);
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Error al crear la cuenta";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, error, login, signup, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}
