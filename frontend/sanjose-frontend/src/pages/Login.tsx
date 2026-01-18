import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Fish, Eye, EyeOff, Waves, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Por favor complete todos los campos");
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 px-4 py-12 relative overflow-hidden">
      {/* Decoración */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Waves className="absolute -top-10 -left-10 w-64 h-64 text-cyan-200/30 -rotate-12" />
        <Fish className="absolute top-20 right-20 w-32 h-32 text-blue-200/20 rotate-45" />
        <Waves className="absolute -bottom-20 right-10 w-96 h-96 text-teal-200/20" />
        <Fish className="absolute bottom-40 left-10 w-24 h-24 text-cyan-300/30 -rotate-12" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 px-8 py-10 text-center relative">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-xl">
                <Fish className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Pescadería</h1>
            <p className="text-cyan-100 font-medium">Sistema de Gestión</p>
            <div className="h-1 w-20 bg-white/40 rounded-full mx-auto mt-3" />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">Bienvenido</h2>
              <p className="text-slate-600">Ingresa tus credenciales</p>
            </div>

            {(localError || error) && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex gap-3 animate-shake">
                <span className="text-red-600">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{localError || error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg hover:scale-[1.02]"
              >
                {isLoading ? "Iniciando sesión..." : <>Iniciar sesión <ArrowRight size={20} /></>}
              </button>
            </div>

            <div className="text-center text-sm text-slate-600">
              ¿No tienes cuenta?{" "}
              <Link to="/signup" className="text-cyan-600 font-bold hover:underline">
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          Sistema de gestión para pescaderías
        </p>
      </div>
    </main>
  );
}
