import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Fish, Eye, EyeOff, Waves, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, authSubmitting } = useAuth(); // 👈 antes: isLoading

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const from =
    ((location.state as any)?.from?.pathname as string) || "/productos";

  // Si ya está autenticado, ir a productos (o a la ruta original)
  useEffect(() => {
    if (user) navigate(from, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim() || !password.trim()) {
      setLocalError("Por favor complete todos los campos");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError("Formato de email inválido");
      return;
    }

    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true }); // 🚀 navegación inmediata
    } catch (err: any) {
      setLocalError(
        err.message || "Error al iniciar sesión. Verifica tus credenciales.",
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 px-3 sm:px-4 py-6 sm:py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Waves className="absolute -top-10 -left-10 w-40 h-40 sm:w-64 sm:h-64 text-cyan-200/30 -rotate-12" />
        <Fish className="absolute top-10 sm:top-20 right-10 sm:right-20 w-20 h-20 sm:w-32 sm:h-32 text-blue-200/20 rotate-45" />
        <Waves className="absolute -bottom-20 right-5 sm:right-10 w-60 h-60 sm:w-96 sm:h-96 text-teal-200/20" />
        <Fish className="absolute bottom-20 sm:bottom-40 left-5 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 text-cyan-300/30 -rotate-12" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 px-6 sm:px-8 py-8 sm:py-10 text-center relative">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-xl">
                <Fish className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Pescadería San José
            </h1>
            <p className="text-cyan-100 font-medium text-sm sm:text-base">
              Sistema de Gestión
            </p>
            <div className="h-1 w-16 sm:w-20 bg-white/40 rounded-full mx-auto mt-2 sm:mt-3" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 space-y-5 sm:space-y-6"
          >
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Bienvenido
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Ingresa tus credenciales
              </p>
            </div>

            {localError && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3 animate-shake">
                <span className="text-red-600 text-lg sm:text-xl flex-shrink-0">
                  ⚠️
                </span>
                <p className="text-red-700 text-xs sm:text-sm font-medium">
                  {localError}
                </p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authSubmitting}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-700 mb-1.5 sm:mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authSubmitting}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    disabled={authSubmitting}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <Eye size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 sm:py-3.5 rounded-lg sm:rounded-xl flex justify-center items-center gap-2 shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all text-sm sm:text-base"
              >
                {authSubmitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs sm:text-sm mt-4 sm:mt-6 px-4">
          Sistema de gestión para pescaderías
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </main>
  );
}
