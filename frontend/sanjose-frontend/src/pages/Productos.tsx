import { useState } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  Package,
  Search,
  CheckCircle,
  X,
} from "lucide-react";

// Datos demo
const productosDemo = [
  { id: 1, codigo: 101, descripcion: "Merluza Fresca", stock: 45, tipo_cantidad: "kg" },
  { id: 2, codigo: 102, descripcion: "Salmon Rosado", stock: 8, tipo_cantidad: "kg" },
  { id: 3, codigo: 103, descripcion: "Langostinos", stock: 120, tipo_cantidad: "unidades" },
  { id: 4, codigo: 104, descripcion: "Camarones", stock: 5, tipo_cantidad: "kg" },
];

type FormData = {
  codigo: number;
  descripcion: string;
  stock: number;
  tipo_cantidad: "unidades" | "cajas" | "kg";
};

export default function Productos() {
  const [productos] = useState(productosDemo);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const initialForm: FormData = {
    codigo: 0,
    descripcion: "",
    stock: 0,
    tipo_cantidad: "unidades",
  };

  const [formData, setFormData] = useState<FormData>(initialForm);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setFormData(initialForm);
      setShowModal(false);
      setSuccessMessage("¡Producto creado exitosamente!");
      setIsSubmitting(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    setSuccessMessage("Producto eliminado");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const filteredProductos = productos.filter(
    (p) =>
      p.codigo.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStock = productos.filter((p) => p.stock < 10).length;
  const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
        {/* Header Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
                <Package className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Productos
              </h3>
            </div>
            <p className="text-slate-600 text-sm sm:text-base ml-9 sm:ml-16">
              Gestiona tu catálogo de productos
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:scale-105 transition font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex gap-2 sm:gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 w-5 h-5" />
            <p className="text-green-700 font-medium text-sm sm:text-base">{successMessage}</p>
          </div>
        )}

        {/* Stats Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                  Total Productos
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">
                  {productos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="bg-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                  Stock Bajo
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-600">
                  {lowStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-purple-100 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                  Stock Total
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">
                  {totalStock}
                  <span className="text-base sm:text-lg lg:text-xl ml-1 text-slate-500">items</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Responsive */}
        <div className="mb-4 sm:mb-6 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white/80 text-sm sm:text-base"
          />
        </div>

        {/* Mobile: Cards, Desktop: Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border overflow-hidden">
          {filteredProductos.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-base sm:text-lg mb-4">
                No hay productos registrados
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base"
              >
                Agregar primer producto
              </button>
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
                            className={`px-2 py-0.5 rounded text-xs font-bold ${p.stock > 10
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                              }`}
                          >
                            {p.stock > 10 ? "✓" : "⚠"}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">{p.descripcion}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition ml-2"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">Stock: </span>
                        <span
                          className={`font-bold ${p.stock < 10 ? "text-amber-600" : "text-slate-900"
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
                        Unidad
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold">
                        Estado
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs sm:text-sm font-bold">
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
                            className={`font-bold text-sm ${p.stock < 10 ? "text-amber-600" : ""
                              }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="px-2 lg:px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                            {p.tipo_cantidad || "unidades"}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span
                            className={`px-2 lg:px-3 py-1 rounded text-xs font-bold ${p.stock > 10
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                              }`}
                          >
                            {p.stock > 10 ? "✓ Normal" : "⚠ Bajo"}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 hover:bg-red-100 rounded-lg lg:rounded-xl transition"
                          >
                            <Trash2 size={18} className="text-red-600" />
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

        {/* Modal Responsive */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10 flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Agregar Producto
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/50 rounded-lg transition sm:hidden"
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
                      setFormData({ ...formData, codigo: Number(e.target.value) || 0 })
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
                        tipo_cantidad: e.target.value as "unidades" | "cajas" | "kg",
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
                      setFormData({ ...formData, stock: Number(e.target.value) || 0 })
                    }
                    placeholder="100"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm sm:text-base"
                  />
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
      </main>
    </div>
  );
}
