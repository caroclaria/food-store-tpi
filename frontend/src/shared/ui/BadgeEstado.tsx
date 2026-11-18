import type { EstadoPedido } from "@/features/pedidos/types/pedido.types";
import { ETIQUETA_ESTADO } from "@/features/pedidos/types/pedido.types";

const ESTILOS: Record<EstadoPedido, { caja: string; punto: string }> = {
  PENDIENTE: { caja: "bg-limon-100 text-limon-800 ring-limon-200", punto: "bg-limon-300" },
  EN_PREPARACION: { caja: "bg-durazno-100 text-durazno-800 ring-durazno-200", punto: "bg-durazno-300" },
  ENTREGADO: { caja: "bg-menta-100 text-menta-800 ring-menta-200", punto: "bg-menta-400" },
  CANCELADO: { caja: "bg-rosa-100 text-rosa-800 ring-rosa-200", punto: "bg-rosa-400" },
};

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const estilo = ESTILOS[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${estilo.caja}`}
    >
      <span className={`h-2 w-2 rounded-full ${estilo.punto}`} />
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

export default BadgeEstado;
