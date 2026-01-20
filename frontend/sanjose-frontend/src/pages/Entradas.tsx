import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import { useMovimientos, type Movimiento } from "../hooks/useMovimientos"; // ajustá el path si es otro
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Producto = {
  id: number;
  codigo: number;
  descripcion: string;
  stock: number;
  tipo_cantidad?: "unidades" | "cajas" | "kg";
};

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
  // ✅ Movimientos reales desde backend
  const {
    movimientos,
    isLoading,
    error: movimientosError,
    createEntrada,
    anularMovimiento,
    editarCantidad,
    fetchMovimientos,
  } = useMovimientos();

  // ✅ Productos reales desde backend (para el select)
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosLoading, setProductosLoading] = useState(true);
  const [productosError, setProductosError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState<Movimiento | null>(null);
  const [editCantidad, setEditCantidad] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [expandedFacturas, setExpandedFacturas] = useState<Set<string>>(new Set());

  const initialForm: FormData = {
    numero_factura: 0,
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    productos: [{ producto_id: 0, cantidad: 0 }],
  };

  const [formData, setFormData] = useState<FormData>(initialForm);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ✅ Cargar productos reales
  const fetchProductos = async () => {
    try {
      setProductosLoading(true);
      setProductosError(null);
      const res = await api.get<Producto[]>("/productos");
      setProductos(res.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Error al cargar productos";
      setProductosError(msg);
    } finally {
      setProductosLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Solo ENTRADAS
  const entradas = useMemo(
    () => movimientos.filter((m) => m.tipo === "ENTRADA"),
    [movimientos]
  );

  // Agrupar por factura (numero_factura + fecha)
  const facturasAgrupadas = useMemo(() => {
    const grupos = new Map<string, any>();

    entradas.forEach((mov) => {
      if (!mov.numero_factura) return; // por seguridad
      const key = `${mov.numero_factura}-${mov.fecha}`;

      if (!grupos.has(key)) {
        grupos.set(key, {
          numero_factura: mov.numero_factura,
          fecha: mov.fecha,
          descripcion: mov.descripcion,
          productos: [] as Movimiento[],
          estado: mov.estado,
        });
      }

      grupos.get(key).productos.push(mov);

      // Si algún movimiento está anulado, marcamos factura como anulado (o podés hacer lógica distinta)
      if (mov.estado === false) {
        grupos.get(key).estado = false;
      }
    });

    return Array.from(grupos.values()).sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [entradas]);


  const filteredFacturas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return facturasAgrupadas.filter(
      (f: any) =>
        f.numero_factura.toString().includes(term) ||
        f.productos.some(
          (p: any) =>
            p.producto?.codigo?.toString().includes(term) ||
            p.producto?.descripcion?.toLowerCase().includes(term)
        )
    );
  }, [facturasAgrupadas, searchTerm]);

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

  const toggleFactura = (key: string) => {
    const newExpanded = new Set(expandedFacturas);
    if (newExpanded.has(key)) newExpanded.delete(key);
    else newExpanded.add(key);
    setExpandedFacturas(newExpanded);
  };

  // ✅ Crear factura: crea N movimientos de entrada (uno por producto)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      if (!formData.numero_factura || formData.numero_factura <= 0) {
        throw new Error("Número de factura inválido");
      }
      if (!formData.fecha) {
        throw new Error("Fecha requerida");
      }
      if (!formData.descripcion.trim()) {
        throw new Error("Descripción requerida");
      }
      if (formData.productos.length === 0) {
        throw new Error("Debes agregar al menos un producto");
      }

      for (const prod of formData.productos) {
        if (!prod.producto_id || prod.producto_id === 0) {
          throw new Error("Todos los productos deben estar seleccionados");
        }
        if (!prod.cantidad || prod.cantidad <= 0) {
          throw new Error("Todas las cantidades deben ser mayores a 0");
        }
      }

      // ⚠️ Creamos 1 entrada por cada producto
      for (const prod of formData.productos) {
        await createEntrada({
          numero_factura: formData.numero_factura,
          fecha: formData.fecha,
          producto_id: prod.producto_id,
          descripcion: formData.descripcion,
          cantidad: prod.cantidad,
        });
      }

      // refrescar (por si createEntrada ya lo hace, igual queda bien)
      await fetchMovimientos();

      setFormData(initialForm);
      setShowModal(false);
      showSuccess("¡Factura registrada exitosamente!");
    } catch (err: any) {
      setFormError(err?.message || "Error al registrar la factura");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Anular factura: anula todos los movimientos de esa factura
  const handleAnularFactura = async (numeroFactura: number, fecha: string) => {
    if (!confirm("¿Anular toda la factura?")) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const movsFactura = entradas.filter(
        (m) => m.numero_factura === numeroFactura && m.fecha === fecha && m.estado === true
      );

      for (const m of movsFactura) {
        await anularMovimiento(m.id);
      }

      showSuccess("Factura anulada exitosamente");
    } catch (err: any) {
      setFormError(err?.message || "Error al anular la factura");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditarProducto = (mov: Movimiento) => {
    setEditingMovimiento(mov);
    setEditCantidad(Math.abs(mov.cantidad));
    setShowEditModal(true);
  };

  const handleGuardarEdicion = async () => {
    if (!editingMovimiento) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      if (!editCantidad || editCantidad <= 0) {
        throw new Error("Cantidad inválida");
      }

      await editarCantidad(editingMovimiento.id, { cantidad: editCantidad });
      setShowEditModal(false);
      showSuccess("Cantidad actualizada exitosamente");
    } catch (err: any) {
      setFormError(err?.message || "Error al editar la cantidad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const globalError = formError || movimientosError || productosError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-3 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
                <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Entradas
              </h3>
            </div>
            <p className="text-slate-600 text-sm sm:text-base ml-9 sm:ml-16">
              Registra facturas con múltiples productos
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium text-sm sm:text-base w-full sm:w-auto"
            disabled={productosLoading}
            title={productosLoading ? "Cargando productos..." : "Nueva factura"}
          >
            <Plus size={20} />
            Nueva Factura
          </button>
        </div>

        {/* Mensajes */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex gap-2 sm:gap-3 items-center shadow-sm">
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <CheckCircle className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-green-700 font-medium text-sm sm:text-base">{successMessage}</p>
          </div>
        )}

        {globalError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex gap-2 sm:gap-3 items-center shadow-sm">
            <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <AlertCircle className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-red-700 font-medium text-sm sm:text-base">{globalError}</p>
          </div>
        )}

        {/* Cargando */}
        {(isLoading || productosLoading) && (
          <div className="bg-white/80 rounded-xl sm:rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full" />
              <p className="text-slate-700 font-medium">
                Cargando datos...
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4 sm:mb-6 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Buscar factura o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white/80 text-sm sm:text-base"
          />
        </div>

        {/* Facturas */}
        {filteredFacturas.length === 0 ? (
          <div className="bg-white/80 rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-base sm:text-lg">No hay facturas registradas</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base"
              disabled={productosLoading}
            >
              Registrar primera factura
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredFacturas.map((factura: any) => {
              const key = `${factura.numero_factura}-${factura.fecha}`;
              const isExpanded = expandedFacturas.has(key);

              return (
                <div
                  key={key}
                  className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border overflow-hidden ${factura.estado ? "border-green-200" : "border-red-200 opacity-60"
                    }`}
                >
                  <div
                    className={`p-3 sm:p-4 lg:p-6 ${factura.estado
                      ? "bg-gradient-to-r from-green-50 to-emerald-50"
                      : "bg-gray-100"
                      } border-b`}
                  >
                    <div className="flex flex-col gap-3 sm:hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 px-3 py-1.5 rounded-lg">
                            <span className="text-blue-700 font-bold text-sm">
                              #{factura.numero_factura}
                            </span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${factura.estado
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {factura.estado ? "✓" : "✗"}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFactura(key)}
                          className="p-2 hover:bg-white/50 rounded-lg transition"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(factura.fecha).toLocaleDateString("es-AR")}
                      </div>
                      <div className="text-slate-600 text-sm">
                        {factura.productos.length} producto{factura.productos.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="hidden sm:flex justify-between items-center">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="bg-blue-100 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl">
                          <span className="text-blue-700 font-bold text-base lg:text-lg">
                            Factura #{factura.numero_factura}
                          </span>
                        </div>
                        <div className="text-slate-600 flex items-center gap-2 text-sm lg:text-base">
                          <Calendar className="w-4 h-4" />
                          {new Date(factura.fecha).toLocaleDateString("es-AR")}
                        </div>
                        <div
                          className={`px-2.5 lg:px-3 py-1 rounded-lg text-xs font-bold ${factura.estado
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {factura.estado ? "✓ Activa" : "✗ Anulada"}
                        </div>
                      </div>

                      {factura.estado && (
                        <button
                          onClick={() => handleAnularFactura(factura.numero_factura, factura.fecha)}
                          className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg lg:rounded-xl transition font-medium text-sm lg:text-base"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4 lg:w-5 lg:h-5" />
                          <span className="hidden lg:inline">Anular</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {(isExpanded || window.innerWidth >= 640) && (
                    <>
                      <div className="sm:hidden divide-y">
                        {factura.productos.map((mov: Movimiento) => (
                          <div key={mov.id} className="p-3 hover:bg-green-50/30">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-mono text-xs text-slate-500 mb-1">
                                  {mov.producto?.codigo}
                                </p>
                                <p className="font-medium text-sm">
                                  {mov.producto?.descripcion}
                                </p>
                              </div>
                              {factura.estado && (
                                <button
                                  onClick={() => handleEditarProducto(mov)}
                                  className="p-1.5 hover:bg-blue-100 rounded-lg transition ml-2"
                                >
                                  <Edit2 className="w-4 h-4 text-blue-600" />
                                </button>
                              )}
                            </div>
                            <div className="inline-block">
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                +{Math.abs(mov.cantidad)} {mov.producto?.tipo_cantidad || "u"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 lg:px-6 py-2 lg:py-3 text-left text-xs font-bold text-slate-700">
                                Código
                              </th>
                              <th className="px-4 lg:px-6 py-2 lg:py-3 text-left text-xs font-bold text-slate-700">
                                Descripción
                              </th>
                              <th className="px-4 lg:px-6 py-2 lg:py-3 text-left text-xs font-bold text-slate-700">
                                Cantidad
                              </th>
                              {factura.estado && (
                                <th className="px-4 lg:px-6 py-2 lg:py-3 text-right text-xs font-bold text-slate-700">
                                  Acciones
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {factura.productos.map((mov: Movimiento) => (
                              <tr key={mov.id} className="border-b hover:bg-green-50/30">
                                <td className="px-4 lg:px-6 py-3 lg:py-4 font-mono text-sm">
                                  {mov.producto?.codigo}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm">
                                  {mov.producto?.descripcion}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <span className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                    +{Math.abs(mov.cantidad)} {mov.producto?.tipo_cantidad || "u"}
                                  </span>
                                </td>
                                {factura.estado && (
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                                    <button
                                      onClick={() => handleEditarProducto(mov)}
                                      className="p-2 hover:bg-blue-100 rounded-lg lg:rounded-xl transition"
                                      title="Editar cantidad"
                                    >
                                      <Edit2 className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {factura.estado && (
                        <div className="sm:hidden p-3 border-t">
                          <button
                            onClick={() => handleAnularFactura(factura.numero_factura, factura.fecha)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-medium text-sm"
                            disabled={isSubmitting}
                          >
                            <X className="w-5 h-5" />
                            Anular Factura
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Nueva Factura */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 sticky top-0 z-10 flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Nueva Factura
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {formError && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl p-3 flex gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5 w-5 h-5" />
                    <p className="text-red-700 text-sm font-medium">{formError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm sm:text-base"
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
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm sm:text-base"
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
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm sm:text-base"
                    placeholder="Compra pescado fresco"
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
                      <Plus size={18} /> Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.productos.map((prod, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-3 items-start bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl"
                      >
                        <div className="flex-1 w-full">
                          <select
                            required
                            value={prod.producto_id}
                            onChange={(e) => {
                              const nuevos = [...formData.productos];
                              nuevos[index].producto_id = parseInt(e.target.value);
                              setFormData({ ...formData, productos: nuevos });
                            }}
                            className="w-full px-3 sm:px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm sm:text-base"
                          >
                            <option value={0}>
                              {productosLoading ? "Cargando..." : "Seleccionar producto"}
                            </option>
                            {productos.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.codigo} - {p.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
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
                            className="flex-1 sm:w-32 px-3 sm:px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm sm:text-base"
                            placeholder="Cantidad"
                          />
                          {formData.productos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarProducto(index)}
                              className="p-2 hover:bg-red-100 rounded-lg transition flex-shrink-0"
                            >
                              <X className="w-5 h-5 text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormError("");
                    }}
                    className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-50 font-semibold text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || productos.length === 0}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-semibold shadow-lg text-sm sm:text-base"
                    title={productos.length === 0 ? "Primero cargá productos" : "Registrar"}
                  >
                    {isSubmitting ? "Guardando..." : "Registrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar cantidad */}
        {showEditModal && editingMovimiento && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Editar Cantidad
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Producto</p>
                  <p className="font-semibold text-sm sm:text-base">
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-50 font-semibold text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarEdicion}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
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
