import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { Fish, Eye, EyeOff, Waves, UserPlus, CheckCircle } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const passwordStrength = useMemo<"weak" | "medium" | "strong">(() => {
    if (password.length < 6) return "weak";
    if (password.length >= 10) return "strong";
    return "medium";
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password || !confirmPassword) {
      setLocalError("Por favor complete todos los campos");
      return;
    }

    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }

    try {
      await signup(email, password, confirmPassword);
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Error al crear cuenta");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 px-4 py-12 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Waves className="absolute -top-10 -right-10 w-64 h-64 text-emerald-200/30 rotate-12" />
        <Fish className="absolute top-20 left-20 w-32 h-32 text-teal-200/20 -rotate-45" />
        <Waves className="absolute -bottom-20 left-10 w-96 h-96 text-green-200/20" />
        <Fish className="absolute bottom-40 right-10 w-24 h-24 text-emerald-300/30 rotate-12" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 px-8 py-10 text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
            </div>

            <div className="flex justify-center relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-xl">
                <UserPlus className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-2 relative">
              <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                Crear Cuenta
              </h1>
              <p className="text-emerald-100 font-medium">
                Regístrate para gestionar tu pescadería
              </p>
              <div className="h-1 w-20 bg-white/40 rounded-full mx-auto mt-3" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Únete ahora
              </h2>
              <p className="text-slate-600">Completa los datos para comenzar</p>
            </div>

            {(localError || error) && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex gap-3 animate-shake">
                <div className="text-red-600 text-xl">⚠️</div>
                <p className="text-red-700 text-sm font-medium">
                  {localError || error}
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@pescaderia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-700"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password strength */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <div
                        className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 1
                          ? passwordStrength === "weak"
                            ? "bg-red-500"
                            : passwordStrength === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          : "bg-slate-200"
                          }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 6
                          ? passwordStrength === "medium"
                            ? "bg-yellow-500"
                            : passwordStrength === "strong"
                              ? "bg-green-500"
                              : "bg-slate-200"
                          : "bg-slate-200"
                          }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === "strong"
                          ? "bg-green-500"
                          : "bg-slate-200"
                          }`}
                      />
                    </div>

                    <p className="text-xs text-slate-500">
                      {passwordStrength === "weak" &&
                        "🔓 Débil - Mínimo 6 caracteres"}
                      {passwordStrength === "medium" &&
                        "🔐 Media - Agrega más caracteres"}
                      {passwordStrength === "strong" &&
                        "🔒 Fuerte - ¡Excelente!"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-slate-700"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    <span>Las contraseñas coinciden</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Crear cuenta
                  </>
                )}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">o</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          Al registrarte, aceptas nuestros términos y condiciones
        </p>
      </div>
    </main>
  );
}
