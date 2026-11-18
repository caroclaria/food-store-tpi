import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productosApi from "../api/productosApi";
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";

export const PRODUCTOS_KEY = ["productos"] as const;

/** Listado paginado en el servidor. La queryKey incluye los filtros. */
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, filtros],
    queryFn: () => productosApi.getProductos(filtros),
    // Mientras llega la página nueva se sigue mostrando la anterior.
    placeholderData: keepPreviousData,
  });
}

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (body: ProductoCreate) => productosApi.crearProducto(body),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductoUpdate }) =>
      productosApi.actualizarProducto(id, body),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductoStockUpdate }) =>
      productosApi.actualizarStock(id, body),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (id: number) => productosApi.eliminarProducto(id),
    onSuccess: invalidar,
  });
}
