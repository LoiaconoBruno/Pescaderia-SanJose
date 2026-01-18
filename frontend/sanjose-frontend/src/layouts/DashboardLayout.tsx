import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Fish } from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6">
        <div className="flex items-center gap-3 mb-10">
          <Fish className="w-8 h-8 text-blue-600" />
          <h2 className="text-xl font-bold">Pescadería</h2>
        </div>

        <nav className="space-y-3">
          <button onClick={() => navigate("/dashboard/productos")} className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-100">
            📦 Productos
          </button>
          <button onClick={() => navigate("/dashboard/entrada")} className="w-full text-left px-4 py-2 rounded-lg hover:bg-green-100">
            📈 Entrada
          </button>
          <button onClick={() => navigate("/dashboard/salida")} className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-100">
            📉 Salida
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 flex justify-between">
          <span>Bienvenido, {user?.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </header>

        {/* Content */}
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

