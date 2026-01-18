import { useState } from "react";
import { useProductos } from "../hooks/useProductos";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

import {
  Plus,
  Trash2,
  AlertCircle,
  Package,
  DollarSign,
  Search,
  CheckCircle,
} from "lucide-react";

type FormData = {
  codigo: string;
  descripcion: string;
  stock: number;
  precio: number;
};

export default function Productos() {
  const { productos, isLoading, error, createProducto, deleteProducto } =
    useProductos();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const initialForm: FormData = {
    codigo: "",
    descripcion: "",
    stock: 0,
    precio: 0,
  };

  const [formData, setFormData] = useState<FormData>(initialForm);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProducto(formData);
      setFormData(initialForm);
      setShowModal(false);
      setSuccessMessage("¡Producto creado exitosamente!");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await deleteProducto(id);
      setSuccessMessage("Producto eliminado");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProductos = productos.filter(
    (p) =>
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStock = productos.filter((p) => p.stock < 10).length;
  const totalValue = productos.reduce((sum, p) => sum + p.stock * p.precio, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Productos
              </h3>
            </div>
            <p className="text-slate-600 ml-16">
              Gestiona tu catálogo de productos
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 mb-6 flex gap-3 animate-slideIn">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-6 flex gap-3 animate-slideIn">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Package className="w-6 h-6 text-blue-600" />}
            label="Total Productos"
            value={productos.length}
            gradientClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
            iconBgClassName="bg-blue-100"
            valueClassName="text-blue-600"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6 text-amber-600" />}
            label="Stock Bajo"
            value={lowStock}
            gradientClassName="bg-gradient-to-r from-amber-500 to-orange-500"
            iconBgClassName="bg-amber-100"
            valueClassName="text-amber-600"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-purple-600" />}
            label="Valor Total"
            value={`$${(totalValue / 1000).toFixed(0)}k`}
            gradientClassName="bg-gradient-to-r from-purple-500 to-pink-500"
            iconBgClassName="bg-purple-100"
            valueClassName="text-purple-600"
          />
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código o descripción..."
            className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white/80"
          />
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden">
          {isLoading ? (
            <Loader text="Cargando productos..." />
          ) : filteredProductos.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <Th>Código</Th>
                  <Th>Descripción</Th>
                  <Th>Stock</Th>
                  <Th>Precio</Th>
                  <Th>Estado</Th>
                  <Th align="right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-blue-50/50">
                    <td className="px-6 py-4 font-mono">{p.codigo}</td>
                    <td className="px-6 py-4">{p.descripcion}</td>
                    <td className="px-6 py-4">
                      <span className={p.stock < 10 ? "text-amber-600 font-bold" : "font-bold"}>
                        {p.stock} kg
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      ${p.precio.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold ${p.stock > 10
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {p.stock > 10 ? "✓ Normal" : "⚠ Bajo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-red-100 rounded-xl"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <Modal title="Agregar Producto" onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Código"
                required
                value={formData.codigo}
                onChange={(v) => setFormData({ ...formData, codigo: v })}
                placeholder="PROD-001"
              />

              <Input
                label="Descripción"
                required
                value={formData.descripcion}
                onChange={(v) => setFormData({ ...formData, descripcion: v })}
                placeholder="Merluza fresca"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Stock"
                  type="number"
                  required
                  min={0}
                  value={formData.stock}
                  onChange={(v) => setFormData({ ...formData, stock: Number(v) || 0 })}
                />

                <Input
                  label="Precio"
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={formData.precio}
                  onChange={(v) => setFormData({ ...formData, precio: Number(v) || 0 })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-2 border-slate-300 rounded-xl py-3 font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}

/* helper */
function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      className={`px-6 py-4 text-sm font-bold ${align === "right" ? "text-right" : "text-left"
        }`}
    >
      {children}
    </th>
  );
}
