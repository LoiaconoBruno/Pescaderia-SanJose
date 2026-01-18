import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, token, isLoading } = useAuth();

  // mientras restaura sesión (localStorage)
  if (isLoading) return <Loader text="Cargando sesión..." />;

  // si no está logueado => login
  if (!user || !token) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
