import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PRODUCTOS_KEY } from "@/features/productos/hooks/useProductos";
import * as pedidosApi from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "../types/pedido.types";

export const PEDIDOS_KEY = ["pedidos"] as const;
export const RESUMEN_KEY = [...PEDIDOS_KEY, "resumen"] as const;

/** Propios (user) o todos (admin): lo decide el backend según la sesión. */
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: [...PEDIDOS_KEY, "lista", filtros],
    queryFn: () => pedidosApi.getPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: RESUMEN_KEY, queryFn: pedidosApi.getResumenPedidos });
}

/** Un pedido cambia el stock: se invalidan pedidos (incluye resumen) y productos. */
function useInvalidarPedidos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: PEDIDOS_KEY });
    void queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (body: PedidoCreate) => pedidosApi.crearPedido(body),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      pedidosApi.cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelarPedido(id),
    onSuccess: invalidar,
  });
}
