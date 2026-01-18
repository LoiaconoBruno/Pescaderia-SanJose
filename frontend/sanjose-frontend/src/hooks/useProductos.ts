import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

export interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  stock: number;
  precio: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductoInput {
  codigo: string;
  descripcion: string;
  stock: number;
  precio: number;
}

export interface ProductoUpdateInput {
  codigo?: string;
  descripcion?: string;
  stock?: number;
  precio?: number;
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
      const msg = err?.response?.data?.message || "Error al cargar productos";
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

        if (!data.codigo?.trim()) throw new Error("El código es obligatorio");
        if (!data.descripcion?.trim()) throw new Error("La descripción es obligatoria");
        if (data.stock < 0) throw new Error("El stock no puede ser negativo");
        if (data.precio <= 0) throw new Error("El precio debe ser mayor a 0");

        await api.post("/productos", data);

        // ✅ refresca lista completa (evita desincronización)
        await fetchProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Error al crear producto";
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

        if (data.stock !== undefined && data.stock < 0) throw new Error("El stock no puede ser negativo");
        if (data.precio !== undefined && data.precio <= 0) throw new Error("El precio debe ser mayor a 0");

        await api.put(`/productos/${id}`, data);

        // ✅ refresca lista completa
        await fetchProductos();
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || err?.message || "Error al actualizar producto";
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

        // ✅ refresca lista completa
        await fetchProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Error al eliminar producto";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchProductos]
  );

  // Helpers
  const getProductoByCodigo = useCallback(
    (codigo: string) => productos.find((p) => p.codigo === codigo),
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
    getProductosConStockBajo,
  };
}
