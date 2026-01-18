import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

export interface Movimiento {
  id: number;
  tipo: "ENTRADA" | "SALIDA";
  fecha: string;
  numero_factura?: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EntradaInput {
  numero_factura: string;
  fecha: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
}

interface SalidaInput {
  fecha: string;
  codigo: string;
  descripcion: string;
  cantidad: number; // 👉 SIEMPRE POSITIVO DESDE EL FORM
}

type UseMovimientosOptions = {
  refreshProductos?: () => Promise<void> | void;
};

export function useMovimientos(options?: UseMovimientosOptions) {
  const refreshProductos = options?.refreshProductos;

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     FETCH MOVIMIENTOS
     ========================= */
  const fetchMovimientos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await api.get<Movimiento[]>("/movimientos");
      setMovimientos(res.data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Error al cargar movimientos";
      setError(msg);
      console.error("fetchMovimientos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* =========================
     CREATE ENTRADA
     ========================= */
  const createEntrada = useCallback(
    async (data: EntradaInput) => {
      try {
        setError(null);

        const payload = {
          ...data,
          cantidad: Math.max(1, Math.abs(data.cantidad)), // siempre positivo
        };

        await api.post("/movimientos/entrada", payload);

        await fetchMovimientos();
        if (refreshProductos) await refreshProductos();
      } catch (err: any) {
        console.error("createEntrada:", err?.response?.data);
        const msg =
          err?.response?.data?.message || "Error al crear entrada";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchMovimientos, refreshProductos]
  );

  /* =========================
     CREATE SALIDA  ✅ FIX
     ========================= */
  const createSalida = useCallback(
    async (data: SalidaInput) => {
      try {
        setError(null);

        // 🔥 PAYLOAD LIMPIO
        // El backend define tipo y signo
        const payload = {
          fecha: data.fecha,
          codigo: data.codigo,
          descripcion: data.descripcion,
          cantidad: Math.abs(data.cantidad), // POSITIVO
        };

        await api.post("/movimientos/salida", payload);

        await fetchMovimientos();
        if (refreshProductos) await refreshProductos();
      } catch (err: any) {
        console.error("createSalida:", err?.response?.data);
        const msg =
          err?.response?.data?.message || "Error al crear salida";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchMovimientos, refreshProductos]
  );

  /* =========================
     INIT
     ========================= */
  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  return {
    movimientos,
    isLoading,
    error,
    fetchMovimientos,
    createEntrada,
    createSalida,
  };
}
