import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    setError(null);
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

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);

          // Refrescar perfil del backend
          try {
            const response = await api.get<User>("/auth/profile");
            setUser(response.data);
            localStorage.setItem("auth_user", JSON.stringify(response.data));
          } catch {
            // Si falla, mantenemos el usuario del localStorage
            console.warn("No se pudo verificar la sesión");
          }
        }
      } catch (err) {
        console.error("Error al restaurar sesión:", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<{ token: string; user: User }>("/auth/login", {
        email,
        password,
      });

      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || // ✅ Tu backend usa "error" no "message"
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
          confirm_password: confirmPassword, // ✅ Así lo espera tu backend
        });

        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem("auth_token", newToken);
        localStorage.setItem("auth_user", JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
      } catch (err: any) {
        const msg =
          err?.response?.data?.error || // ✅ Tu backend usa "error"
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
