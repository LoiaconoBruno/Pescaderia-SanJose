import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Package, TrendingUp, TrendingDown } from "lucide-react";
import image from "../assests/images.jpeg"

export default function PrivateLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Sidebar */}
      <aside className="w-72 bg-transparent/90 backdrop-blur-sm border-r border-slate-200 shadow-xl">
        <div className="p-6 flex items-center gap-10 border-b border-slate-200">
          {/* Logo de la Pescadería */}
          <img
            src={image}
            alt="Pescadería San José"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <p className="font-bold text-slate-900 leading-tight">San José</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink to="/productos" className={linkClass}>
            <Package size={18} /> Productos
          </NavLink>
          <NavLink to="/entradas" className={linkClass}>
            <TrendingUp size={18} /> Entradas
          </NavLink>
          <NavLink to="/salidas" className={linkClass}>
            <TrendingDown size={18} /> Salidas
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Panel</h1>
              <p className="text-sm text-cyan-100">Gestioná tu inventario</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border border-white/20 transition"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
