import axios from "axios";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ApiError, mensajeDeError } from "./handleApiError";

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api/v1";

/**
 * Instancia única de Axios. withCredentials: el navegador envía y acepta la
 * cookie HttpOnly con el JWT. El frontend nunca lee ni guarda el token.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// En el login un 401 significa "credenciales incorrectas" y en /auth/me lo
// maneja checkSession: en esas rutas el interceptor no limpia la sesión.
const RUTAS_EXCLUIDAS = ["/auth/token", "/auth/me"];
const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

let registrado = false;

/**
 * Interceptor de respuesta (se registra una vez, en main.tsx):
 * - 401 fuera de /auth/token y /auth/me, o 400 «Cuenta de usuario desactivada»:
 *   limpia el authStore; ProtectedRoute lleva a /login al quedar sin usuario.
 * - Todo error se convierte en ApiError con el detail del backend.
 */
export function registrarInterceptores(): void {
  if (registrado) return;
  registrado = true;

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        return Promise.reject(
          new ApiError(0, `No se pudo conectar con el servidor (${API_URL}).`)
        );
      }

      const { status, data } = error.response;
      const mensaje = mensajeDeError(status, data);
      const url = error.config?.url ?? "";
      const excluida = RUTAS_EXCLUIDAS.some((ruta) => url.endsWith(ruta));

      const sesionInvalida =
        (status === 401 && !excluida) || (status === 400 && mensaje === CUENTA_DESACTIVADA);

      if (sesionInvalida) {
        const { usuario, limpiarSesion } = useAuthStore.getState();
        if (usuario) {
          limpiarSesion();
          useNotificationStore
            .getState()
            .mostrar(
              status === 401 ? "Tu sesión venció. Iniciá sesión de nuevo." : mensaje,
              "error"
            );
        }
      }

      return Promise.reject(new ApiError(status, mensaje));
    }
  );
}
