import { useState, useEffect } from "react";
import { LogOut, Package, TrendingDown, TrendingUp, Fish, Waves, Menu, X } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("productos");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simular datos de usuario para la demo
  const user = { email: "usuario@pescaderia.com" };

  // Cerrar menú mobile al cambiar de tab
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Prevenir scroll cuando el menú mobile está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header responsive */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Waves className="absolute -bottom-6 -left-6 w-24 h-24 sm:w-32 sm:h-32 text-white" />
          <Fish className="absolute top-2 right-10 w-16 h-16 sm:w-24 sm:h-24 text-white transform rotate-12" />
          <Waves className="absolute -bottom-4 right-4 w-20 h-20 sm:w-28 sm:h-28 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          {/* Mobile: Stack vertical */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                  <Fish className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    Pescadería
                  </h1>
                  <p className="text-cyan-100 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate max-w-[200px] sm:max-w-none">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Botón logout solo mobile */}
              <button
                onClick={() => alert('Cerrar sesión')}
                className="sm:hidden flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg transition-all duration-200 border border-white/20"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Botón logout desktop */}
            <button
              onClick={() => alert('Cerrar sesión')}
              className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-all duration-200 border border-white/20 hover:scale-105"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm lg:text-base">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs - Mobile: Menú hamburguesa, Desktop: Tabs horizontales */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Botón hamburguesa */}
          <div className="sm:hidden flex items-center justify-between py-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              {activeTab === "productos" && <><Package size={20} /> Productos</>}
              {activeTab === "entrada" && <><TrendingUp size={20} /> Entrada</>}
              {activeTab === "salida" && <><TrendingDown size={20} /> Salida</>}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile: Menú desplegable */}
          {mobileMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200">
              <div className="py-2">
                <button
                  onClick={() => setActiveTab("productos")}
                  className={`w-full text-left px-4 py-3 font-medium transition-colors flex items-center gap-3 ${activeTab === "productos"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Package size={20} />
                  <span>Productos</span>
                </button>
                <button
                  onClick={() => setActiveTab("entrada")}
                  className={`w-full text-left px-4 py-3 font-medium transition-colors flex items-center gap-3 ${activeTab === "entrada"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <TrendingUp size={20} />
                  <span>Entrada</span>
                </button>
                <button
                  onClick={() => setActiveTab("salida")}
                  className={`w-full text-left px-4 py-3 font-medium transition-colors flex items-center gap-3 ${activeTab === "salida"
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <TrendingDown size={20} />
                  <span>Salida</span>
                </button>
              </div>
            </div>
          )}

          {/* Desktop: Tabs horizontales */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => setActiveTab("productos")}
              className={`py-3 lg:py-4 px-4 lg:px-6 font-medium transition-all duration-200 rounded-t-xl relative text-sm lg:text-base ${activeTab === "productos"
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
              className={`py-3 lg:py-4 px-4 lg:px-6 font-medium transition-all duration-200 rounded-t-xl relative text-sm lg:text-base ${activeTab === "entrada"
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
              className={`py-3 lg:py-4 px-4 lg:px-6 font-medium transition-all duration-200 rounded-t-xl relative text-sm lg:text-base ${activeTab === "salida"
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
      </div>

      {/* Overlay para cerrar menú mobile */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/20 z-10"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Content responsive */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === "productos" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Gestión de Productos
              </h2>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
              <Fish className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base sm:text-lg font-medium">
                Componente de productos en desarrollo
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                Aquí podrás gestionar todo tu inventario de productos
              </p>
            </div>
          </div>
        )}

        {activeTab === "entrada" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Entrada de Mercadería
              </h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
              <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base sm:text-lg font-medium">
                Componente de entrada en desarrollo
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                Registra aquí las nuevas llegadas de productos
              </p>
            </div>
          </div>
        )}

        {activeTab === "salida" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-red-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Salida de Mercadería
              </h2>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
              <TrendingDown className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base sm:text-lg font-medium">
                Componente de salida en desarrollo
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                Gestiona las ventas y salidas de productos
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
