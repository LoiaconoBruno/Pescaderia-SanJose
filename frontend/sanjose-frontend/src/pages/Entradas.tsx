import { useState, useMemo } from "react";
import { useProductos } from "../hooks/useProductos";
import { useMovimientos } from "../hooks/useMovimientos";
import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Package,
  X,
  Edit2,
} from "lucide-react";

interface ProductoEntrada {
  producto_id: number;
  cantidad: number;
}

interface FormData {
  numero_factura: number;
  fecha: string;
  descripcion: string;
  productos: ProductoEntrada[];
}

export default function Entradas() {
  const { productos, fetchProductos } = useProductos();
  const {
    movimientos,
    isLoading,
    error,
    createEntrada,
    anularMovimiento,
    editarCantidad,
  } = useMovimientos({
    refreshProductos: fetchProductos,
  });

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState<any>(null);
  const [editCantidad, setEditCantidad] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const initialForm: FormData = {
    numero_factura: 0,
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    productos: [{ producto_id: 0, cantidad: 0 }],
  };

  const [formData, setFormData] = useState<FormData>(initialForm);

  // Agrupar movimientos de entrada por factura
  const facturasAgrupadas = useMemo(() => {
    const entradas = movimientos.filter((m) => m.tipo === "ENTRADA");
    const grupos = new Map();

    entradas.forEach((mov) => {
      const key = `${mov.numero_factura}-${mov.fecha}`;
      if (!grupos.has(key)) {
        grupos.set(key, {
          numero_factura: mov.numero_factura,
          fecha: mov.fecha,
          descripcion: mov.descripcion,
          productos: [],
          estado: mov.estado,
        });
      }
      grupos.get(key).productos.push(mov);
    });

    return Array.from(grupos.values()).sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [movimientos]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // Validar que hay al menos un producto
      if (formData.productos.length === 0) {
        setFormError("Debes agregar al menos un producto");
        setIsSubmitting(false);
        return;
      }

      // Validar que todos los productos tienen datos válidos
      for (const prod of formData.productos) {
        if (!prod.producto_id || prod.producto_id === 0) {
          setFormError("Todos los productos deben estar seleccionados");
          setIsSubmitting(false);
          return;
        }
        if (!prod.cantidad || prod.cantidad <= 0) {
          setFormError("Todas las cantidades deben ser mayores a 0");
          setIsSubmitting(false);
          return;
        }
      }

      // Crear una entrada por cada producto en la factura
      for (const prod of formData.productos) {
        await createEntrada({
          numero_factura: formData.numero_factura,
          fecha: formData.fecha,
          producto_id: prod.producto_id,
          descripcion: formData.descripcion,
          cantidad: prod.cantidad,
        });
      }

      setFormData(initialForm);
      setShowModal(false);
      setSuccessMessage("¡Factura registrada exitosamente!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setFormError(err.message || "Error al registrar la factura");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnularFactura = async (numeroFactura: number, fecha: string) => {
    if (!confirm("¿Anular toda la factura? Esto anulará todos los productos asociados.")) {
      return;
    }

    try {
      // Encontrar todos los movimientos de esta factura
      const movimientosFactura = movimientos.filter(
        (m) =>
          m.tipo === "ENTRADA" &&
          m.numero_factura === numeroFactura &&
          m.fecha === fecha &&
          m.estado === true
      );

      // Anular cada uno
      for (const mov of movimientosFactura) {
        await anularMovimiento(mov.id);
      }

      setSuccessMessage("Factura anulada exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setFormError(err.message || "Error al anular factura");
    }
  };

  const handleEditarProducto = (mov: any) => {
    setEditingMovimiento(mov);
    setEditCantidad(Math.abs(mov.cantidad));
    setShowEditModal(true);
  };

  const handleGuardarEdicion = async () => {
    if (!editingMovimiento) return;

    try {
      await editarCantidad(editingMovimiento.id, { cantidad: editCantidad });
      setShowEditModal(false);
      setSuccessMessage("Cantidad actualizada exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setFormError(err.message || "Error al actualizar cantidad");
    }
  };

  const agregarProducto = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { producto_id: 0, cantidad: 0 }],
    });
  };

  const eliminarProducto = (index: number) => {
    const nuevos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: nuevos });
  };

  const totalKg = facturasAgrupadas.reduce(
    (sum, f) =>
      sum + f.productos.reduce((s: number, p: any) => s + Math.abs(p.cantidad), 0),
    0
  );

  const filteredFacturas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return facturasAgrupadas.filter(
      (f) =>
        f.numero_factura.toString().includes(term) ||
        f.productos.some(
          (p: any) =>
            p.producto?.codigo.toString().includes(term) ||
            p.producto?.descripcion.toLowerCase().includes(term)
        )
    );
  }, [facturasAgrupadas, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <main className="max-w-7xl mx-auto">
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
            <p className="text-slate-600 ml-16">Registra facturas con múltiples productos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
          >
            <Plus size={20} />
            Nueva Factura
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 mb-6 flex gap-3 items-center shadow-sm">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {(error || formError) && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-6 flex gap-3 items-center shadow-sm">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <p className="text-red-700 font-medium">{error || formError}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Facturas</p>
                <p className="text-4xl font-bold text-green-600">{facturasAgrupadas.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Total Productos</p>
                <p className="text-4xl font-bold text-emerald-600">
                  {facturasAgrupadas.reduce((s, f) => s + f.productos.length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-teal-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Cantidad Total</p>
                <p className="text-4xl font-bold text-teal-600">
                  {totalKg}
                  <span className="text-xl ml-1 text-slate-500">items</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por número de factura o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white/80"
          />
        </div>

        {/* Facturas */}
        {isLoading ? (
          <div className="bg-white/80 rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-slate-600">Cargando facturas...</p>
          </div>
        ) : filteredFacturas.length === 0 ? (
          <div className="bg-white/80 rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No hay facturas registradas</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-green-600 hover:text-green-700 font-semibold"
            >
              Registrar primera factura
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFacturas.map((factura) => (
              <div
                key={`${factura.numero_factura}-${factura.fecha}`}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden ${factura.estado ? "border-green-200" : "border-red-200 opacity-60"
                  }`}
              >
                {/* Header Factura */}
                <div
                  className={`p-6 ${factura.estado
                      ? "bg-gradient-to-r from-green-50 to-emerald-50"
                      : "bg-gray-100"
                    } border-b flex justify-between items-center`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 px-4 py-2 rounded-xl">
                      <span className="text-blue-700 font-bold text-lg">
                        Factura #{factura.numero_factura}
                      </span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(factura.fecha).toLocaleDateString("es-AR")}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${factura.estado
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {factura.estado ? "✓ Activa" : "✗ Anulada"}
                    </div>
                  </div>
                  {factura.estado && (
                    <button
                      onClick={() =>
                        handleAnularFactura(factura.numero_factura, factura.fecha)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition font-medium"
                    >
                      <X className="w-5 h-5" />
                      Anular Factura
                    </button>
                  )}
                </div>

                {/* Productos */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700">
                          Cantidad
                        </th>
                        {factura.estado && (
                          <th className="px-6 py-3 text-right text-xs font-bold text-slate-700">
                            Acciones
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {factura.productos.map((mov: any) => (
                        <tr key={mov.id} className="border-b hover:bg-green-50/30">
                          <td className="px-6 py-4 font-mono text-sm">
                            {mov.producto?.codigo}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {mov.producto?.descripcion || mov.descripcion}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                              +{Math.abs(mov.cantidad)} {mov.producto?.tipo_cantidad || "u"}
                            </span>
                          </td>
                          {factura.estado && (
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleEditarProducto(mov)}
                                className="p-2 hover:bg-blue-100 rounded-xl transition"
                                title="Editar cantidad"
                              >
                                <Edit2 className="w-5 h-5 text-blue-600" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Nueva Factura */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 sticky top-0 z-10">
                <h3 className="text-2xl font-bold text-slate-900">
                  Nueva Factura de Entrada
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-3 flex gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-700 text-sm font-medium">{formError}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Número de Factura
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.numero_factura || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numero_factura: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none"
                      placeholder="1001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Descripción General
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none"
                    placeholder="Compra pescado fresco del puerto"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-slate-700">Productos</label>
                    <button
                      type="button"
                      onClick={agregarProducto}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                    >
                      <Plus size={18} /> Agregar producto
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.productos.map((prod, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl"
                      >
                        <div className="flex-1">
                          <select
                            required
                            value={prod.producto_id}
                            onChange={(e) => {
                              const nuevos = [...formData.productos];
                              nuevos[index].producto_id = parseInt(e.target.value);
                              setFormData({ ...formData, productos: nuevos });
                            }}
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                          >
                            <option value={0}>Seleccionar producto</option>
                            {productos.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.codigo} - {p.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            required
                            min={1}
                            value={prod.cantidad || ""}
                            onChange={(e) => {
                              const nuevos = [...formData.productos];
                              nuevos[index].cantidad = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, productos: nuevos });
                            }}
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                            placeholder="unidades/cajas/kg"
                          />
                        </div>
                        {formData.productos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarProducto(index)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                          >
                            <X className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormError("");
                    }}
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-semibold shadow-lg"
                  >
                    {isSubmitting ? "Guardando..." : "Registrar Factura"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEditModal && editingMovimiento && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-xl font-bold text-slate-900">Editar Cantidad</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Producto</p>
                  <p className="font-semibold">
                    {editingMovimiento.producto?.descripcion}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nueva Cantidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editCantidad}
                    onChange={(e) => setEditCantidad(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarEdicion}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
