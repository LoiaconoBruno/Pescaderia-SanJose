import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  const [isLoading, setIsLoading] = useState(true); // Iniciar en true mientras chequeamos localStorage
  const [error, setError] = useState<string | null>(null);

  // Restaurar sesión al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      } catch (err) {
        console.error("Error al restaurar sesión:", err);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }

    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete api.defaults.headers.common.Authorization;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get<User>("/auth/profile");
      setUser(response.data);
      localStorage.setItem("auth_user", JSON.stringify(response.data));
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

      setToken(newToken);
      setUser(newUser);

      // Guardar en localStorage
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));

      // Setear Authorization para todas las requests
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
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

        setToken(newToken);
        setUser(newUser);

        // Guardar en localStorage
        localStorage.setItem("auth_token", newToken);
        localStorage.setItem("auth_user", JSON.stringify(newUser));

        // Setear Authorization para todas las requests
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
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
