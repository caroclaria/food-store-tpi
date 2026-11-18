import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./handleApiError";

// Errores que no tiene sentido reintentar.
const SIN_REINTENTO = new Set([400, 401, 403, 404, 422]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        !(error instanceof ApiError && SIN_REINTENTO.has(error.status)) && failureCount < 2,
    },
  },
});
