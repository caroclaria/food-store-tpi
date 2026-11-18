import { api } from "@/shared/api/axiosInstance";
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoRead,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const params: Record<string, string | number | boolean> = {
    skip: filtros.skip,
    limit: filtros.limit,
  };
  if (filtros.search) params.search = filtros.search;
  if (filtros.categoria_id !== undefined) params.categoria_id = filtros.categoria_id;
  if (filtros.disponible !== undefined) params.disponible = filtros.disponible;
  const { data } = await api.get<ProductosPaginados>("/productos", { params });
  return data;
}

export async function crearProducto(body: ProductoCreate): Promise<ProductoRead> {
  const { data } = await api.post<ProductoRead>("/productos", body);
  return data;
}

export async function actualizarProducto(id: number, body: ProductoUpdate): Promise<ProductoRead> {
  const { data } = await api.put<ProductoRead>(`/productos/${id}`, body);
  return data;
}

export async function actualizarStock(id: number, body: ProductoStockUpdate): Promise<ProductoRead> {
  const { data } = await api.patch<ProductoRead>(`/productos/${id}/stock`, body);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
