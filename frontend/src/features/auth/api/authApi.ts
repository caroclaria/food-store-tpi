import { api } from "@/shared/api/axiosInstance";
import type { UserPublic } from "@/features/usuarios/types/usuario.types";
import type { LoginCredentials, MensajeResponse, UserCreate } from "../types/auth.types";

/** POST /auth/token con formulario OAuth2: el backend responde con la cookie. */
export async function login({ username, password }: LoginCredentials): Promise<MensajeResponse> {
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post<MensajeResponse>("/auth/token", form);
  return data;
}

export async function logout(): Promise<MensajeResponse> {
  const { data } = await api.post<MensajeResponse>("/auth/logout");
  return data;
}

export async function getMe(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>("/auth/me");
  return data;
}

export async function register(body: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>("/auth/register", body);
  return data;
}
