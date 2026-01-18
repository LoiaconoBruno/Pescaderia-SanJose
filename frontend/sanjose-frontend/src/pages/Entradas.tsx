import { useState } from "react";
import { useMovimientos } from "../hooks/useMovimientos";
import { useProductos } from "../hooks/useProductos";
import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Package,
  Hash,
} from "lucide-react";

type FormData = {
  numero_factura: string;
  fecha: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
};

export default function Entradas() {
  const { productos, fetchProductos } = useProductos();

  const { movimientos, isLoading, error, createEntrada } = useMovimientos({
    refreshProductos: fetchProductos,
  });

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm: FormData = {
    numero_factura: "",
    fecha: new Date().toISOString().split("T")[0],
    codigo: "",
    descripcion: "",
    cantidad: 0,
  };

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createEntrada(formData);
      setFormData(initialForm);
      setShowModal(false);
      setSuccessMessage("¡Entrada registrada exitosamente!");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductoChange = (codigo: string) => {
    const producto = productos.find((p) => p.codigo === codigo);
    if (producto) {
      setFormData((prev) => ({
        ...prev,
        codigo: producto.codigo,
        descripcion: producto.descripcion,
      }));
    } else {
      setFormData((prev) => ({ ...prev, codigo, descripcion: "" }));
    }
  };

  const hoy = new Date().toDateString();

  const entradasHoy = movimientos.filter(
    (m) => m.tipo === "ENTRADA" && new Date(m.fecha).toDateString() === hoy
  );

  const filteredMovimientos = movimientos.filter(
    (m) =>
      m.tipo === "ENTRADA" &&
      (m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalEntradas = movimientos.filter((m) => m.tipo === "ENTRADA").length;

  const totalKg = movimientos
    .filter((m) => m.tipo === "ENTRADA")
    .reduce((sum, m) => sum + m.cantidad, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <main className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Entradas de Mercadería
              </h3>
            </div>
            <p className="text-slate-600 ml-16">Registra compras y nuevas adquisiciones</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
          >
            <Plus size={20} />
            Nueva Entrada
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 mb-6 flex gap-3 items-center shadow-sm animate-slideIn">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-6 flex gap-3 items-center shadow-sm animate-slideIn">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Entradas Hoy</p>
                <p className="text-4xl font-bold text-green-600">{entradasHoy.length}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4" />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Total Este Mes</p>
                <p className="text-4xl font-bold text-emerald-600">{totalEntradas}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-4" />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-teal-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-100 p-3 rounded-xl">
                <Hash className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Cantidad Total</p>
                <p className="text-4xl font-bold text-teal-600">
                  {totalKg}
                  <span className="text-xl ml-1 text-slate-500">kg</span>
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mt-4" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Cargando entradas...</p>
            </div>
          ) : filteredMovimientos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-slate-500 mb-4 text-lg">No hay entradas registradas</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
              >
                Registrar la primera entrada →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Factura</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Código</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Descripción</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovimientos.map((movimiento) => (
                    <tr
                      key={movimiento.id}
                      className="border-b border-slate-100 hover:bg-green-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {new Date(movimiento.fecha).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold text-sm">
                          {movimiento.numero_factura}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono">{movimiento.codigo}</td>
                      <td className="px-6 py-4 text-slate-700">{movimiento.descripcion}</td>
                      <td className="px-6 py-4">
                        <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                          +{movimiento.cantidad} kg
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Registrar Entrada</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Número de Factura
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numero_factura}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, numero_factura: e.target.value }))
                    }
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    placeholder="FAC-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Producto</label>
                  <select
                    required
                    value={formData.codigo}
                    onChange={(e) => handleProductoChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.codigo}>
                        {producto.codigo} - {producto.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cantidad (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cantidad: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? "Guardando..." : "Registrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
