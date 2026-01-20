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
  producto_id: number;
  descripcion: string;
  cantidad: number;
};

// Función helper para formatear fechas correctamente
const formatearFecha = (fechaString: string) => {
  const [year, month, day] = fechaString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString("es-AR");
};

export default function Salidas() {
  const { productos, fetchProductos } = useProductos();
  const { movimientos, isLoading, error, createSalida } = useMovimientos({
    refreshProductos: fetchProductos,
  });

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm: FormData = {
    fecha: new Date().toISOString().split("T")[0],
    producto_id: 0,
    descripcion: "",
    cantidad: 0,
  };

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const openModal = async () => {
    try {
      await fetchProductos();
    } catch { }
    setShowModal(true);
  };

  const handleProductoChange = (producto_id: number) => {
    const producto = productos.find((p) => p.id === producto_id);
    if (!producto) return;

    setFormData((prev) => ({
      ...prev,
      producto_id: producto.id,
      descripcion: producto.descripcion,
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const producto = productos.find((p) => p.id === formData.producto_id);
    if (!producto) {
      setFormError("Producto no encontrado");
      setIsSubmitting(false);
      return;
    }

    if (producto.stock < formData.cantidad) {
      setFormError(`Stock insuficiente. Disponible: ${producto.stock} u`);
      setIsSubmitting(false);
      return;
    }

    try {
      await createSalida({
        fecha: formData.fecha,
        producto_id: formData.producto_id,
        descripcion: formData.descripcion,
        cantidad: formData.cantidad,
      });

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
    const hoy = new Date().toISOString().split("T")[0];
    return movimientos.filter(
      (m) => m.tipo === "SALIDA" && m.estado === true && m.fecha === hoy
    );
  }, [movimientos]);

  const totalSalidas = useMemo(() => {
    return movimientos.filter((m) => m.tipo === "SALIDA" && m.estado === true).length;
  }, [movimientos]);

  const cantidadTotal = useMemo(() => {
    return movimientos
      .filter((m) => m.tipo === "SALIDA" && m.estado === true)
      .reduce((sum, m) => sum + Math.abs(m.cantidad), 0);
  }, [movimientos]);

  const filteredMovimientos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return movimientos.filter(
      (m) =>
        m.tipo === "SALIDA" &&
        m.estado === true &&
        (m.producto?.codigo.toString().toLowerCase().includes(term) ||
          m.producto?.descripcion.toLowerCase().includes(term) ||
          m.descripcion.toLowerCase().includes(term))
    );
  }, [movimientos, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-red-50 pb-6">
      <main className="max-w-7xl mx-auto px-4 py-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2.5 rounded-xl shadow-lg shrink-0">
              <TrendingDown className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Salidas
              </h3>
              <p className="text-slate-600 text-sm md:text-base mt-1">Registra ventas y despachos</p>
            </div>
          </div>

          <button
            onClick={openModal}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-5 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 font-medium"
          >
            <Plus size={20} />
            Nueva Salida
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-3.5 mb-4 flex gap-3 items-start shadow-sm animate-slideIn">
            <div className="bg-green-100 p-1.5 rounded-lg shrink-0">
              <CheckCircle className="text-green-600" size={18} />
            </div>
            <p className="text-green-700 font-medium text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-3.5 mb-4 flex gap-3 items-start shadow-sm animate-slideIn">
            <div className="bg-red-100 p-1.5 rounded-lg shrink-0">
              <AlertCircle className="text-red-600" size={18} />
            </div>
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={<Calendar className="w-5 h-5 md:w-6 md:h-6 text-red-600" />}
            label="Salidas Hoy"
            value={salidasHoy.length}
            gradientClassName="bg-gradient-to-r from-red-500 to-orange-500"
            iconBgClassName="bg-red-100"
            valueClassName="text-red-600"
          />
          <StatCard
            icon={<Package className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />}
            label="Total"
            value={totalSalidas}
            gradientClassName="bg-gradient-to-r from-orange-500 to-amber-500"
            iconBgClassName="bg-orange-100"
            valueClassName="text-orange-600"
          />
          <StatCard
            icon={<Hash className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />}
            label="Cantidad Total"
            value={
              <span>
                {cantidadTotal}
                <span className="text-lg md:text-xl ml-1 text-slate-500">u</span>
              </span>
            }
            gradientClassName="bg-gradient-to-r from-rose-500 to-pink-500"
            iconBgClassName="bg-rose-100"
            valueClassName="text-rose-600"
          />
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>
        </div>

        {/* Mobile Cards / Desktop Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {isLoading ? (
            <Loader text="Cargando salidas..." />
          ) : filteredMovimientos.length === 0 ? (
            <EmptyStateSalidas onAdd={openModal} />
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredMovimientos.map((m) => (
                  <div key={m.id} className="p-4 hover:bg-red-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-slate-500 mb-1">
                          #{m.producto?.codigo}
                        </div>
                        <div className="font-medium text-slate-900 text-sm truncate">
                          {m.producto?.descripcion || m.descripcion}
                        </div>
                      </div>
                      <span className="ml-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md whitespace-nowrap">
                        -{Math.abs(m.cantidad)} u
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">
                        {formatearFecha(m.fecha)}
                      </span>
                      <span className="px-2 py-1 rounded-md font-semibold bg-green-100 text-green-700">
                        ✓ Completada
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Código</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Descripción</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Cantidad</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovimientos.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-slate-100 hover:bg-red-50/50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {formatearFecha(m.fecha)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-mono text-sm">
                          {m.producto?.codigo}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">
                          {m.producto?.descripcion || m.descripcion}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md">
                            -{Math.abs(m.cantidad)} u
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                            ✓ Completada
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-3 flex gap-2 animate-shake">
                  <AlertCircle
                    className="text-red-600 flex-shrink-0 mt-0.5"
                    size={18}
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
                  value={formData.producto_id}
                  onChange={(e) => handleProductoChange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                >
                  <option value={0}>Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.descripcion} (Stock: {p.stock} u)
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Descripción"
                value={formData.descripcion}
                onChange={(v) => setFormData({ ...formData, descripcion: v })}
                placeholder="Venta cliente, despacho, etc."
              />

              <Input
                label="Cantidad (unidades)"
                type="number"
                required
                min={1}
                value={formData.cantidad}
                onChange={(v) =>
                  setFormData({ ...formData, cantidad: Number(v) || 0 })
                }
              />

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormError("");
                  }}
                  className="flex-1 px-4 py-3 text-sm border-2 border-slate-300 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-50 active:scale-95 transition-all duration-200 font-semibold shadow-lg"
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
