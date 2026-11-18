import { create } from "zustand";

export type TipoNotificacion = "exito" | "error" | "info";

interface NotificationState {
  mensaje: string;
  tipo: TipoNotificacion;
  visible: boolean;
  /** Cambia en cada aviso para reiniciar el temporizador del Toast. */
  id: number;
  mostrar: (mensaje: string, tipo?: TipoNotificacion) => void;
  ocultar: () => void;
}

// Estado de interfaz: lo lee el Toast (montado una vez en App.tsx).
export const useNotificationStore = create<NotificationState>()((set) => ({
  mensaje: "",
  tipo: "info",
  visible: false,
  id: 0,
  mostrar: (mensaje, tipo = "exito") =>
    set((state) => ({ mensaje, tipo, visible: true, id: state.id + 1 })),
  ocultar: () => set({ visible: false }),
}));
