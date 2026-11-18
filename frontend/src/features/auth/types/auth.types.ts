import type { Rol, UserPublic } from "@/features/usuarios/types/usuario.types";

export interface LoginCredentials {
  username: string;
  password: string;
}

/** Mismos campos que UserCreate del backend. */
export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface MensajeResponse {
  message: string;
}

/** Lo que guarda el authStore: datos del usuario, nunca el token. */
export interface UsuarioSesion {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
}

export function toUsuarioSesion(user: UserPublic): UsuarioSesion {
  const { id, username, full_name, email, role } = user;
  return { id, username, full_name, email, role };
}
