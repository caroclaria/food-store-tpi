import { api } from "@/shared/api/axiosInstance";
import type { CategoriaCreate, CategoriaRead, CategoriaUpdate } from "../types/categoria.types";

export async function getCategorias(): Promise<CategoriaRead[]> {
  const { data } = await api.get<CategoriaRead[]>("/categorias");
  return data;
}

export async function crearCategoria(body: CategoriaCreate): Promise<CategoriaRead> {
  const { data } = await api.post<CategoriaRead>("/categorias", body);
  return data;
}

export async function actualizarCategoria(id: number, body: CategoriaUpdate): Promise<CategoriaRead> {
  const { data } = await api.put<CategoriaRead>(`/categorias/${id}`, body);
  return data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
