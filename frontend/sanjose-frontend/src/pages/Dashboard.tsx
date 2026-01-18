import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ajustá ruta si la tenés distinta
import { LogOut, Package, TrendingDown, TrendingUp, Fish, Waves } from "lucide-react";

type Tab = "productos" | "entrada" | "salida";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("productos");

  // Si no hay sesión, mandá a /login (cuando ya terminó de cargar)
  useEffect(() => {
    if (!isLoading && (!user || !token)) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, user, token, navigate]);

  // Loader mientras verifica sesión
  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header con efecto de ola */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Waves className="absolute -bottom-6 -left-6 w-32 h-32 text-white" />
          <Fish className="absolute top-4 right-20 w-24 h-24 text-white transform rotate-12" />
          <Waves className="absolute -bottom-4 right-10 w-28 h-28 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Fish className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Pescadería</h1>
              <p className="text-cyan-100 text-sm mt-1">Bienvenido, {user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl transition-all duration-200 border border-white/20 hover:scale-105"
          >
            <LogOut size={18} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Tabs modernos */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2">
          <button
            onClick={() => setActiveTab("productos")}
            className={`py-4 px-6 font-medium transition-all duration-200 rounded-t-xl relative ${activeTab === "productos"
              ? "text-blue-600 bg-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
          >
            <div className="flex items-center gap-2">
              <Package size={20} />
              <span>Productos</span>
            </div>
            {activeTab === "productos" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("entrada")}
            className={`py-4 px-6 font-medium transition-all duration-200 rounded-t-xl relative ${activeTab === "entrada"
              ? "text-green-600 bg-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <span>Entrada</span>
            </div>
            {activeTab === "entrada" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("salida")}
            className={`py-4 px-6 font-medium transition-all duration-200 rounded-t-xl relative ${activeTab === "salida"
              ? "text-red-600 bg-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
          >
            <div className="flex items-center gap-2">
              <TrendingDown size={20} />
              <span>Salida</span>
            </div>
            {activeTab === "salida" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "productos" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 transform transition-all duration-300 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 text-center">
              <Fish className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Componente de productos en desarrollo</p>
              <p className="text-gray-500 text-sm mt-2">
                Aquí podrás gestionar todo tu inventario de productos
              </p>
            </div>
          </div>
        )}

        {activeTab === "entrada" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 transform transition-all duration-300 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Entrada de Mercadería</h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center">
              <TrendingUp className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Componente de entrada en desarrollo</p>
              <p className="text-gray-500 text-sm mt-2">
                Registra aquí las nuevas llegadas de productos
              </p>
            </div>
          </div>
        )}

        {activeTab === "salida" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 transform transition-all duration-300 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Salida de Mercadería</h2>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-8 text-center">
              <TrendingDown className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Componente de salida en desarrollo</p>
              <p className="text-gray-500 text-sm mt-2">
                Gestiona las ventas y salidas de productos
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
