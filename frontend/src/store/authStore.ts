import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as authApi from "@/features/auth/api/authApi";
import { toUsuarioSesion } from "@/features/auth/types/auth.types";
import type { UsuarioSesion } from "@/features/auth/types/auth.types";
import { queryClient } from "@/shared/api/queryClient";

interface AuthState {
  /** Datos del usuario (nombre, email y rol). El token NO se guarda: viaja en la cookie HttpOnly. */
  usuario: UsuarioSesion | null;
  /** true mientras checkSession confirma la sesión con GET /auth/me. */
  cargando: boolean;
  login: (username: string, password: string) => Promise<UsuarioSesion>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  /** Limpia la sesión sin llamar al backend (lo usa el interceptor ante un 401). */
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await authApi.login({ username, password });
        const usuario = toUsuarioSesion(await authApi.getMe());
        queryClient.clear();
        set({ usuario, cargando: false });
        return usuario;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          queryClient.clear();
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = toUsuarioSesion(await authApi.getMe());
          set({ usuario, cargando: false });
        } catch {
          // Sin cookie válida (401) o cuenta desactivada (400): sin sesión.
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        queryClient.clear();
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: "foodstore-auth",
      storage: createJSONStorage(() => localStorage),
      // Solo se persiste el usuario; nunca el token ni el estado de carga.
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
