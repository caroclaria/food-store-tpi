import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as categoriasApi from "../api/categoriasApi";
import type { CategoriaCreate, CategoriaUpdate } from "../types/categoria.types";

export const CATEGORIAS_KEY = ["categorias"] as const;

export function useCategorias() {
  return useQuery({ queryKey: CATEGORIAS_KEY, queryFn: categoriasApi.getCategorias });
}

/** Las categorías van embebidas en los productos: se invalidan ambos. */
function useInvalidarCatalogo() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: (body: CategoriaCreate) => categoriasApi.crearCategoria(body),
    onSuccess: invalidar,
  });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CategoriaUpdate }) =>
      categoriasApi.actualizarCategoria(id, body),
    onSuccess: invalidar,
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.eliminarCategoria(id),
    onSuccess: invalidar,
  });
}
