import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function PrivateRoute() {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  // Espera a que el AuthProvider restaure sesión desde localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-slate-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Si no hay sesión, mandamos a login
  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ Si hay sesión, renderiza las rutas hijas
  return <Outlet />;
}

