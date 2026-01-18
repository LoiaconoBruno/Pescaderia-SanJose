import { useMemo, useState } from "react";
import { useProductos } from "../hooks/useProductos";
import { useMovimientos } from "../hooks/useMovimientos";

import Modal from "../components/Modal";
import Input from "../components/Input";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import EmptyStateSalidas from "../components/EmptyStateSalidas";

import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Calendar,
  Package,
  Hash,
} from "lucide-react";

type FormData = {
  fecha: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
};

export default function Salidas() {
  // ✅ Productos (para validar stock + actualizar stock luego de salida)
  const { productos, fetchProductos } = useProductos();

  // ✅ Movimientos (le pasamos refreshProductos)
  const { movimientos, isLoading, error, createSalida } = useMovimientos({
    refreshProductos: fetchProductos,
  });

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm: FormData = {
    fecha: new Date().toISOString().split("T")[0],
    codigo: "",
    descripcion: "",
    cantidad: 0,
  };

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const openModal = async () => {
    // ✅ refresca productos para que el stock del select sea actual
    try {
      await fetchProductos();
    } catch { }
    setShowModal(true);
  };

  const handleProductoChange = (codigo: string) => {
    const producto = productos.find((p) => p.codigo === codigo);
    if (!producto) return;

    setFormData((prev) => ({
      ...prev,
      codigo: producto.codigo,
      descripcion: producto.descripcion,
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const producto = productos.find((p) => p.codigo === formData.codigo);
    if (!producto) {
      setFormError("Producto no encontrado");
      setIsSubmitting(false);
      return;
    }

    if (producto.stock < formData.cantidad) {
      setFormError(`Stock insuficiente. Disponible: ${producto.stock} kg`);
      setIsSubmitting(false);
      return;
    }

    try {
      await createSalida(formData);

      setFormData({
        ...initialForm,
        fecha: new Date().toISOString().split("T")[0],
      });

      setShowModal(false);
      setSuccessMessage("¡Salida registrada exitosamente!");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const salidasHoy = useMemo(() => {
    const hoy = new Date().toDateString();
    return movimientos.filter(
      (m) => m.tipo === "SALIDA" && new Date(m.fecha).toDateString() === hoy
    );
  }, [movimientos]);

  const totalSalidas = useMemo(() => {
    return movimientos.filter((m) => m.tipo === "SALIDA").length;
  }, [movimientos]);

  const cantidadTotal = useMemo(() => {
    return movimientos
      .filter((m) => m.tipo === "SALIDA")
      .reduce((sum, m) => sum + Math.abs(m.cantidad), 0);
  }, [movimientos]);

  const filteredMovimientos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return movimientos.filter(
      (m) =>
        m.tipo === "SALIDA" &&
        (m.codigo.toLowerCase().includes(term) ||
          m.descripcion.toLowerCase().includes(term))
    );
  }, [movimientos, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-red-50">
      <main className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <TrendingDown className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Salidas de Mercadería
              </h3>
            </div>
            <p className="text-slate-600 ml-16">Registra ventas y despachos</p>
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
          >
            <Plus size={20} />
            Nueva Salida
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Calendar className="w-6 h-6 text-red-600" />}
            label="Salidas Hoy"
            value={salidasHoy.length}
            gradientClassName="bg-gradient-to-r from-red-500 to-orange-500"
            iconBgClassName="bg-red-100"
            valueClassName="text-red-600"
          />
          <StatCard
            icon={<Package className="w-6 h-6 text-orange-600" />}
            label="Total"
            value={totalSalidas}
            gradientClassName="bg-gradient-to-r from-orange-500 to-amber-500"
            iconBgClassName="bg-orange-100"
            valueClassName="text-orange-600"
          />
          <StatCard
            icon={<Hash className="w-6 h-6 text-rose-600" />}
            label="Cantidad Total"
            value={
              <span>
                {cantidadTotal}
                <span className="text-xl ml-1 text-slate-500">kg</span>
              </span>
            }
            gradientClassName="bg-gradient-to-r from-rose-500 to-pink-500"
            iconBgClassName="bg-rose-100"
            valueClassName="text-rose-600"
          />
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {isLoading ? (
            <Loader text="Cargando salidas..." />
          ) : filteredMovimientos.length === 0 ? (
            <EmptyStateSalidas onAdd={openModal} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Código</Th>
                    <Th>Descripción</Th>
                    <Th>Cantidad</Th>
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovimientos.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-slate-100 hover:bg-red-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {new Date(m.fecha).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono">
                        {m.codigo}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {m.descripcion}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md">
                          -{Math.abs(m.cantidad)} kg
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                          Completada
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
          <Modal
            title="Registrar Salida"
            onClose={() => {
              setShowModal(false);
              setFormError("");
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-3 flex gap-2 animate-shake">
                  <AlertCircle
                    className="text-red-600 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <p className="text-red-700 text-sm font-medium">{formError}</p>
                </div>
              )}

              <Input
                label="Fecha"
                type="date"
                required
                value={formData.fecha}
                onChange={(v) => setFormData({ ...formData, fecha: v })}
              />

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Producto
                </label>
                <select
                  required
                  value={formData.codigo}
                  onChange={(e) => handleProductoChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.codigo}>
                      {p.codigo} - {p.descripcion} (Stock: {p.stock} kg)
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Descripción" value={formData.descripcion} onChange={() => { }} readOnly />

              <Input
                label="Cantidad (kg)"
                type="number"
                required
                min={1}
                value={formData.cantidad}
                onChange={(v) =>
                  setFormData({ ...formData, cantidad: Number(v) || 0 })
                }
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormError("");
                  }}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "Guardando..." : "Registrar"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
      {children}
    </th>
  );
}
