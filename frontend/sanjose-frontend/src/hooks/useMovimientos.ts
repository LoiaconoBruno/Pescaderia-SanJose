import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

export interface Movimiento {
  id: number;
  producto_id: number;
  producto?: {
    id: number;
    codigo: number;
    descripcion: string;
    stock: number;
    tipo_cantidad?: "unidades" | "cajas" | "kg";
  };
  numero_factura?: number; // ✅ ENTERO, opcional (solo para entradas)
  fecha: string; // ✅ "2026-01-18" formato CustomDate
  descripcion: string;
  cantidad: number; // Positivo para ENTRADA, negativo para SALIDA
  tipo: "ENTRADA" | "SALIDA";
  estado: boolean; // true = activo, false = anulado
  createdAt?: string;
  updatedAt?: string;
}

interface EntradaInput {
  numero_factura: number; // ✅ ENTERO
  fecha: string; // "2026-01-18"
  producto_id: number;
  descripcion: string;
  cantidad: number;
}

interface SalidaInput {
  fecha: string; // "2026-01-18"
  producto_id: number;
  descripcion: string;
  cantidad: number;
}

interface EditarCantidadInput {
  cantidad: number;
}

interface EditarProductoInput {
  producto_id: number;
  cantidad: number;
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
      const msg = err?.response?.data?.error || "Error al cargar movimientos";
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

        // Validaciones antes de enviar
        if (!data.numero_factura || data.numero_factura <= 0) {
          throw new Error("Número de factura inválido");
        }
        if (!data.producto_id || data.producto_id <= 0) {
          throw new Error("Producto no seleccionado");
        }
        if (!data.fecha) {
          throw new Error("Fecha requerida");
        }
        if (!data.descripcion?.trim()) {
          throw new Error("Descripción requerida");
        }
        if (!data.cantidad || data.cantidad <= 0) {
          throw new Error("Cantidad debe ser mayor a 0");
        }

        // Payload con nombres exactos que espera el backend Go
        const payload = {
          producto_id: data.producto_id,          // Go: ProductoID
          numero_factura: Math.floor(data.numero_factura), // Go: NumeroFactura (int)
          fecha: data.fecha,                       // Go: Fecha (string "2006-01-02")
          descripcion: data.descripcion.trim(),    // Go: Descripcion
          cantidad: Math.max(1, Math.abs(data.cantidad)), // Go: Cantidad (siempre positivo)
        };

        console.log("📤 Payload enviado:", payload);
        console.log("📤 Payload JSON:", JSON.stringify(payload));

        const response = await api.post("/movimientos/entrada", payload);
        console.log("✅ Respuesta exitosa:", response.data);

        await fetchMovimientos();
        if (refreshProductos) await refreshProductos();
      } catch (err: any) {
        console.error("❌ Error completo:", err);
        console.error("📋 Response status:", err?.response?.status);
        console.error("📄 Response data:", err?.response?.data);
        console.error("🔍 Request config:", err?.config);

        // Mensajes de error más específicos
        let msg = "Error al crear entrada";

        if (err?.response?.status === 500) {
          const errorData = err?.response?.data;
          if (typeof errorData === 'string') {
            msg = `Error del servidor: ${errorData}`;
          } else {
            msg = "Error en el servidor. Revisa los logs del backend";
          }
        } else if (err?.response?.status === 400) {
          msg = err?.response?.data?.error || "Datos inválidos";
        } else if (err?.response?.status === 404) {
          msg = "Producto no encontrado";
        } else if (err?.response?.data?.error) {
          msg = err.response.data.error;
        } else if (err?.message) {
          msg = err.message;
        }

        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchMovimientos, refreshProductos]
  );

  /* =========================
     CREATE SALIDA
     ========================= */
  const createSalida = useCallback(
    async (data: SalidaInput) => {
      try {
        setError(null);

        // Validaciones
        if (!data.producto_id || data.producto_id <= 0) {
          throw new Error("Producto no seleccionado");
        }
        if (!data.fecha) {
          throw new Error("Fecha requerida");
        }
        if (!data.cantidad || data.cantidad <= 0) {
          throw new Error("Cantidad debe ser mayor a 0");
        }

        const payload = {
          fecha: data.fecha,
          producto_id: data.producto_id,
          descripcion: data.descripcion?.trim() || "Salida",
          cantidad: Math.abs(data.cantidad), // POSITIVO
        };

        console.log("Enviando salida:", payload);
        await api.post("/movimientos/salida", payload);

        await fetchMovimientos();
        if (refreshProductos) await refreshProductos();
      } catch (err: any) {
        console.error("createSalida:", err?.response?.data);
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Error al crear salida";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchMovimientos, refreshProductos]
  );

  /* =========================
     ANULAR MOVIMIENTO
     ========================= */
  const anularMovimiento = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await api.put(`/movimientos/${id}/cancelar`);
        await fetchMovimientos();
        if (refreshProductos) await refreshProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.error || "Error al anular movimiento";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchMovimientos, refreshProductos]
  );

  /* =========================
     EDITAR CANTIDAD
     ========================= */
  const editarCantidad = useCallback(
    async (id: number, data: EditarCantidadInput) => {
      try {
        setError(null);
        await api.put(`/movimientos/${id}/editar-cantidad`, {
          cantidad: Math.abs(data.cantidad),
        });
        await fetchMovimientos();
        if (refreshProductos) await refreshProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.error || "Error al editar cantidad";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchMovimientos, refreshProductos]
  );

  /* =========================
     EDITAR PRODUCTO
     ========================= */
  const editarProducto = useCallback(
    async (id: number, data: EditarProductoInput) => {
      try {
        setError(null);
        await api.put(`/movimientos/${id}/editar-producto`, {
          producto_id: data.producto_id,
          cantidad: Math.abs(data.cantidad),
        });
        await fetchMovimientos();
        if (refreshProductos) await refreshProductos();
      } catch (err: any) {
        const msg = err?.response?.data?.error || "Error al editar producto";
        setError(msg);
        throw new Error(msg);
      }
    },
    [fetchMovimientos, refreshProductos]
  );

  /* =========================
     HELPERS
     ========================= */
  const getMovimientosPorTipo = useCallback(
    (tipo: "ENTRADA" | "SALIDA") => movimientos.filter((m) => m.tipo === tipo),
    [movimientos]
  );

  const getMovimientosActivos = useCallback(
    () => movimientos.filter((m) => m.estado === true),
    [movimientos]
  );

  const getMovimientosAnulados = useCallback(
    () => movimientos.filter((m) => m.estado === false),
    [movimientos]
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
    anularMovimiento,
    editarCantidad,
    editarProducto,
    getMovimientosPorTipo,
    getMovimientosActivos,
    getMovimientosAnulados,
  };
}
