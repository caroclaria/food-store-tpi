import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import type { TipoNotificacion } from "@/store/notificationStore";

const DURACION_MS = 3500;

const ESTILOS: Record<TipoNotificacion, { caja: string; icono: string; circulo: string }> = {
  exito: { caja: "bg-menta-100 text-menta-800 ring-menta-200", icono: "✓", circulo: "bg-menta-300" },
  error: { caja: "bg-rosa-100 text-rosa-800 ring-rosa-200", icono: "!", circulo: "bg-rosa-300" },
  info: { caja: "bg-cielo-100 text-cielo-800 ring-cielo-200", icono: "i", circulo: "bg-cielo-300" },
};

function Toast() {
  const mensaje = useNotificationStore((s) => s.mensaje);
  const tipo = useNotificationStore((s) => s.tipo);
  const visible = useNotificationStore((s) => s.visible);
  const id = useNotificationStore((s) => s.id);
  const ocultar = useNotificationStore((s) => s.ocultar);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(ocultar, DURACION_MS);
    return () => window.clearTimeout(timer);
  }, [visible, id, ocultar]);

  if (!visible) return null;
  const estilo = ESTILOS[tipo];

  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg ring-1 ${estilo.caja}`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${estilo.circulo}`}>
        {estilo.icono}
      </span>
      <p className="flex-1 pt-0.5 font-semibold">{mensaje}</p>
      <button type="button" onClick={ocultar} aria-label="Cerrar" className="text-lg leading-none opacity-60 hover:opacity-100">
        &times;
      </button>
    </div>
  );
}

export default Toast;
