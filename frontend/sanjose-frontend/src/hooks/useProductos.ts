import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

export interface Producto {
  id: number;
  codigo: number; // ✅ ENTERO, no string
  descripcion: string;
  stock: number;
  tipo_cantidad?: "unidades" | "cajas" | "kg"; // ✅ Tipo de medida (opcional por compatibilidad)
  created_at?: string;
  updated_at?: string;
}

export interface ProductoInput {
  codigo: number; // ✅ ENTERO
  descripcion: string;
  stock: number;
  tipo_cantidad?: "unidades" | "cajas" | "kg"; // ✅ Tipo de medida (opcional)
}

export interface ProductoUpdateInput {
  codigo?: number; // ✅ ENTERO
  descripcion?: string;
  stock?: number;
  tipo_cantidad?: "unidades" | "cajas" | "kg"; // ✅ Tipo de medida (opcional)
}

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<Producto[]>("/productos");
      setProductos(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Error al cargar productos";
      setError(msg);
      console.error("fetchProductos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProducto = useCallback(
    async (data: ProductoInput) => {
      try {
        setError(null);
        // Validaciones
        if (!data.codigo) throw new Error("El código es obligatorio");
        if (!data.descripcion?.trim()) throw new Error("La descripción es obligatoria");
        if (data.stock < 0) throw new Error("El stock no puede ser negativo");

        await api.post("/productos", data);
        await fetchProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Error al crear producto";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchProductos]
  );

  const updateProducto = useCallback(
    async (id: number, data: ProductoUpdateInput) => {
      try {
        setError(null);
        if (data.stock !== undefined && data.stock < 0) {
          throw new Error("El stock no puede ser negativo");
        }
        await api.put(`/productos/${id}`, data);
        await fetchProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Error al actualizar producto";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchProductos]
  );

  const deleteProducto = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await api.delete(`/productos/${id}`);
        await fetchProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.error || "Error al eliminar producto";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchProductos]
  );

  // Helpers
  const getProductoByCodigo = useCallback(
    (codigo: number) => productos.find((p) => p.codigo === codigo),
    [productos]
  );

  const getProductoById = useCallback(
    (id: number) => productos.find((p) => p.id === id),
    [productos]
  );

  const getProductosConStockBajo = useCallback(
    (limite = 10) => productos.filter((p) => p.stock <= limite),
    [productos]
  );

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return {
    productos,
    isLoading,
    error,
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductoByCodigo,
    getProductoById,
    getProductosConStockBajo,
  };
}
