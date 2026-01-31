import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  AlertCircle,
  Package,
  Search,
  CheckCircle,
  X,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import api from "../lib/axios";

type Producto = {
  id: number;
  codigo: number;
  descripcion: string;
  stock: number;
  tipo_cantidad: "unidades" | "cajas" | "kg" | string;
};

type Movimiento = {
  id: number;
  producto_id: number;
  numero_factura: number;
  fecha: string;
  descripcion: string;
  cantidad: number;
  tipo: "ENTRADA" | "SALIDA";
  estado: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  codigo: number;
  descripcion: string;
  stock: number;
  tipo_cantidad: "unidades" | "cajas" | "kg";
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showMovimientosModal, setShowMovimientosModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
    null,
  );
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const initialForm: FormData = {
    codigo: 0,
    descripcion: "",
    stock: 0,
    tipo_cantidad: "unidades",
  };

  const [formData, setFormData] = useState<FormData>(initialForm);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 4000);
  };

  const cargarProductos = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await api.get("/productos");
      setProductos(res.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando productos";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async (productoId: number) => {
    setLoadingMovimientos(true);
    try {
      const res = await api.get(`/productos/${productoId}/movimientos`);
      setMovimientos(res.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando movimientos";
      showError(msg);
      setMovimientos([]);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  const verMovimientos = async (producto: Producto) => {
    setSelectedProducto(producto);
    setShowMovimientosModal(true);
    await cargarMovimientos(producto.id);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (!formData.codigo || formData.codigo <= 0) {
        showError("Código inválido");
        return;
      }
      if (!formData.descripcion.trim()) {
        showError("Descripción requerida");
        return;
      }
      if (formData.stock < 0) {
        showError("Stock inválido");
        return;
      }

      await api.post("/productos", {
        codigo: formData.codigo,
        descripcion: formData.descripcion.trim(),
        stock: formData.stock,
        tipo_cantidad: formData.tipo_cantidad,
      });

      setFormData(initialForm);
      setShowModal(false);
      showSuccess("¡Producto creado exitosamente!");
      await cargarProductos();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear producto";
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProductos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return productos.filter(
      (p) =>
        p.codigo.toString().includes(term) ||
        p.descripcion.toLowerCase().includes(term),
    );
  }, [productos, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shrink-0">
              <Package className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Productos
              </h3>
              <p className="text-slate-600 text-sm md:text-base mt-1">
                Gestiona tu catálogo de productos
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 font-medium"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>
        {/* Mensajes */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex gap-2 sm:gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 w-5 h-5" />
            <p className="text-green-700 font-medium text-sm sm:text-base">
              {successMessage}
            </p>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex gap-2 sm:gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 w-5 h-5" />
            <p className="text-red-700 font-medium text-sm sm:text-base">
              {errorMessage}
            </p>
          </div>
        )}
        {/* Search */}
        <div className="mb-4 sm:mb-6 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white/80 text-sm sm:text-base"
          />
        </div>
        {/* Tabla / Cards */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full" />
                <p className="text-slate-700 font-medium">
                  Cargando productos...
                </p>
              </div>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-base sm:text-lg mb-4">
                {searchTerm
                  ? "No se encontraron productos"
                  : "No hay productos registrados"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base"
                >
                  Agregar primer producto
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="sm:hidden divide-y">
                {filteredProductos.map((p) => (
                  <div key={p.id} className="p-4 hover:bg-blue-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-500">
                            #{p.codigo}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              p.stock > 10
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {p.stock > 10 ? "✓" : "⚠"}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {p.descripcion}
                        </p>
                      </div>
                      <button
                        onClick={() => verMovimientos(p)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver movimientos"
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">Stock: </span>
                        <span
                          className={`font-bold ${
                            p.stock < 10 ? "text-amber-600" : "text-slate-900"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                        {p.tipo_cantidad || "unidades"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold">
                        Código
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold">
                        Descripción
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold">
                        Stock
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold">
                        Unidades
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs sm:text-sm font-bold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProductos.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-blue-50/50">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-mono text-sm">
                          {p.codigo}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm">
                          {p.descripcion}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span
                            className={`font-bold text-sm ${
                              p.stock < 10 ? "text-amber-600" : ""
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="px-2 lg:px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                            {p.tipo_cantidad || "unidades"}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                          <button
                            onClick={() => verMovimientos(p)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 font-medium text-sm"
                            title="Ver movimientos"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden lg:inline">
                              Ver movimientos
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {/* Modal Crear Producto */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10 flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Agregar Producto
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/50 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Código
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.codigo || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codigo: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="101"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    placeholder="Merluza fresca"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tipo de Cantidad
                  </label>
                  <select
                    required
                    value={formData.tipo_cantidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo_cantidad: e.target.value as any,
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm sm:text-base"
                  >
                    <option value="unidades">Unidades</option>
                    <option value="cajas">Cajas</option>
                    <option value="kg">Kilogramos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="100"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm sm:text-base"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Este será el stock inicial del producto
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-2 border-slate-300 rounded-lg sm:rounded-xl py-2.5 sm:py-3 font-semibold hover:bg-slate-50 transition text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 font-semibold disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal Movimientos */}
        // Modificar solo la parte del Modal de Movimientos en el componente
        Productos
        {/* Modal Movimientos */}
        {showMovimientosModal && selectedProducto && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Movimientos del Producto
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedProducto.descripcion}
                  </p>
                  {/* ✨ NUEVO: Mostrar stock inicial y actual */}
                  <div className="flex gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Stock Inicial:</span>
                      <span className="font-bold text-blue-600">
                        {selectedProducto.stock -
                          movimientos.reduce((sum, m) => sum + m.cantidad, 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Stock Actual:</span>
                      <span className="font-bold text-green-600">
                        {selectedProducto.stock}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMovimientosModal(false)}
                  className="p-1.5 hover:bg-white/50 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {loadingMovimientos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full" />
                  </div>
                ) : movimientos.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">
                      No hay movimientos registrados para este producto
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Stock inicial: {selectedProducto.stock}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {movimientos.map((mov) => (
                      <div
                        key={mov.id}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          mov.estado
                            ? "border-slate-200 bg-white hover:shadow-md"
                            : "border-red-200 bg-red-50/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {mov.tipo === "ENTRADA" ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                                  <TrendingUp className="w-4 h-4" />
                                  ENTRADA
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                                  <TrendingDown className="w-4 h-4" />
                                  SALIDA
                                </div>
                              )}
                              {!mov.estado && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                                  ANULADO
                                </span>
                              )}
                            </div>

                            <p className="text-slate-900 font-medium mb-1">
                              {mov.descripcion}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                              <span>Fecha: {mov.fecha}</span>
                              {mov.numero_factura > 0 && (
                                <span>Factura: #{mov.numero_factura}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${
                                mov.cantidad > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {mov.cantidad > 0 ? "+" : ""}
                              {mov.cantidad}
                            </div>
                            <span className="text-xs text-slate-500">
                              {selectedProducto.tipo_cantidad}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t bg-slate-50">
                <button
                  onClick={() => setShowMovimientosModal(false)}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white rounded-lg py-3 font-semibold transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
