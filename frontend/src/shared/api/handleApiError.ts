import { useNotificationStore } from "@/store/notificationStore";

/** Error de la API con el código HTTP y un mensaje listo para mostrar. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
}

/**
 * FastAPI responde { detail: "texto" } en 400/401/403/404/409 y
 * { detail: [{ loc, msg }, ...] } en los 422 de validación.
 */
export function mensajeDeError(status: number, body: unknown): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return (detail as ValidationIssue[])
        .map((issue) => {
          const campo = issue.loc.filter((p) => p !== "body" && p !== "query").join(".");
          const msg = issue.msg.replace(/^Value error, /, "");
          return campo ? `${campo}: ${msg}` : msg;
        })
        .join(" · ");
    }
  }
  return `Error ${status} al comunicarse con el servidor`;
}

/** Mensaje de cualquier error capturado (ApiError, Error u otro). */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado";
}

/** Muestra un error en el Toast. Los 401 ya los maneja el interceptor. */
export function notificarError(error: unknown, contexto: string): void {
  if (error instanceof ApiError && error.status === 401) return;
  useNotificationStore.getState().mostrar(`${contexto}: ${handleApiError(error)}`, "error");
}
