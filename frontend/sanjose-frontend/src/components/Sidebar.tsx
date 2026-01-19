import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ChevronLeft,
  Fish,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  Waves,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type MenuItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  color: string;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false); // ✅ cerrar/ocultar sidebar

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Productos",
      href: "/productos",
      icon: Package,
      color: "from-blue-500 to-indigo-500",
    },
    {
      name: "Entradas",
      href: "/entradas",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Salidas",
      href: "/salidas",
      icon: TrendingDown,
      color: "from-red-500 to-orange-500",
    },
    {
      name: "Proveedores",
      href: "/proveedores",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Reportes",
      href: "/reportes",
      icon: BarChart3,
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Configuración",
      href: "/configuracion",
      icon: Settings,
      color: "from-slate-500 to-slate-600",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Si está oculto, muestro un botón flotante para volver a abrirlo
  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        className="fixed top-5 left-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl border border-slate-700/50 hover:bg-slate-800 transition"
      >
        <Menu size={18} />
        <span className="font-semibold">Menú</span>
      </button>
    );
  }

  return (
    <>
      {/* Overlay para móviles: cierra al click afuera */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={() => setHidden(true)}
      />
      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen overflow-y-auto flex flex-col shadow-2xl border-r border-slate-700/50",
          "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white",
          "transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          "lg:relative lg:translate-x-0", // Para desktop: no fixed, relativo al layout
        ].join(" ")}
      >
        {/* Header / Logo */}
        <div className="p-6 border-b border-slate-700/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10" />
          <div className="absolute top-0 right-0 opacity-10">
            <Waves className="w-24 h-24 text-cyan-400" />
          </div>
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} relative z-10`}
          >
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <Fish size={collapsed ? 28 : 24} className="text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fadeIn">
                <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  San Jose
                </h1>
                <p className="text-xs text-cyan-300/80 font-medium">
                  Gestión de Stock
                </p>
              </div>
            )}
          </div>
          {/* Acciones: colapsar + cerrar (cerrar solo en mobile) */}
          <div className="absolute right-3 top-3 flex items-center gap-2 z-20">
            {/* Cerrar sidebar (solo visible en mobile) */}
            <button
              type="button"
              onClick={() => setHidden(true)}
              className="w-8 h-8 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/50 flex items-center justify-center transition lg:hidden"
              aria-label="Cerrar menú"
              title="Cerrar"
            >
              <X size={16} />
            </button>
            {/* Colapsar (solo en desktop, ya que en mobile se oculta completamente) */}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="w-8 h-8 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/50 flex items-center justify-center transition hidden lg:flex"
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
              title={collapsed ? "Expandir" : "Colapsar"}
            >
              <ChevronLeft
                size={16}
                className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  [
                    "w-full flex items-center rounded-xl transition-all duration-200 relative overflow-hidden",
                    collapsed ? "justify-center px-3" : "gap-3 px-4",
                    "py-3.5",
                    "no-underline",
                    "select-none",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
                    "active:bg-transparent",
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
                  ].join(" ")
                }
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {({ isActive }) => (
                  <>
                    {/* brillo suave detrás cuando está activo */}
                    {isActive && (
                      <span className="absolute inset-0 bg-white/10" />
                    )}

                    <Icon
                      size={20}
                      className={[
                        "relative z-10 transition-transform",
                        isActive ? "drop-shadow" : "group-hover:scale-110",
                      ].join(" ")}
                    />

                    {!collapsed && (
                      <span className="font-semibold relative z-10">
                        {item.name}
                      </span>
                    )}

                    {isActive && !collapsed && (
                      <span className="ml-auto relative z-10 w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            type="button"
            onClick={handleLogout}
            className={[
              "w-full flex items-center rounded-xl transition-all duration-200 group",
              collapsed ? "justify-center px-3" : "gap-3 px-4",
              "py-3.5",
              "bg-red-600/10 text-red-300 hover:bg-red-600/20 hover:text-red-200",
            ].join(" ")}
            title={collapsed ? "Cerrar sesión" : ""}
          >
            <LogOut
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            {!collapsed && <span className="font-semibold">Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

