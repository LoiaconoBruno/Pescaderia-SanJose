import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // ajustá la ruta real
import { Clock, User, Bell, Search, Menu } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [time, setTime] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (showNotifications && !target.closest(".notifications-container")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu size={24} className="text-slate-700" />
          </button>
          <div>
            <h2 className="text-sm text-slate-500 font-semibold uppercase tracking-wide">
              Bienvenido
            </h2>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              San Jose
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none text-slate-700 w-32 placeholder:text-slate-400"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <Clock size={18} className="text-blue-600" />
            <span className="font-bold text-blue-900">{time}</span>
          </div>

          <div className="relative notifications-container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all relative"
            >
              <Bell size={20} className="text-slate-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-slideDown">
                {/* ... igual que el tuyo ... */}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <User size={20} className="text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-slate-900">
                {user?.email || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 font-medium">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
