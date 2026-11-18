import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";
import { notificarError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonLista } from "@/shared/components/Skeleton";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { formatearFecha, formatearPrecio } from "@/shared/utils/format";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types/pedido.types";
import { ESTADOS, ETIQUETA_ESTADO } from "../types/pedido.types";

const POR_PAGINA = 5;

function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);

  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA, estado });
  const cancelar = useCancelarPedido();
  const mostrar = useNotificationStore((s) => s.mostrar);

  const confirmarCancelacion = () => {
    if (!aCancelar) return;
    cancelar.mutate(aCancelar.id, {
      onSuccess: (p) => {
        mostrar(`Pedido #${p.id} cancelado`);
        setACancelar(null);
      },
      onError: (error) => {
        notificarError(error, "No se pudo cancelar");
        setACancelar(null);
      },
    });
  };

  const filtrar = (nuevo: EstadoPedido | undefined) => {
    setEstado(nuevo);
    setPagina(0);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader titulo="Mis pedidos" descripcion="Seguí el estado de tus pedidos." />

      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {[undefined, ...ESTADOS].map((e) => (
          <button
            key={e ?? "todos"}
            type="button"
            onClick={() => filtrar(e)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              estado === e ? "bg-rosa-200 text-rosa-800 ring-1 ring-rosa-300" : "bg-white text-tinta-600 ring-1 ring-crema-300 hover:bg-crema-50"
            }`}
          >
            {e ? ETIQUETA_ESTADO[e] : "Todos"}
          </button>
        ))}
      </div>

      {pedidos.isPending ? (
        <SkeletonLista filas={3} />
      ) : pedidos.isError ? (
        <EstadoError mensaje={pedidos.error.message} onRetry={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          icono="🧾"
          titulo={estado ? "No hay pedidos con ese estado" : "Todavía no hiciste pedidos"}
          descripcion={estado ? undefined : "Cuando confirmes uno, lo vas a ver acá."}
          accion={
            estado ? undefined : (
              <Link to="/" className="rounded-xl bg-rosa-300 px-4 py-2 text-sm font-bold text-tinta-900 hover:bg-rosa-400">
                Ir al catálogo
              </Link>
            )
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {pedidos.data.items.map((p) => {
              const expandido = abierto === p.id;
              const cantidad = p.items.reduce((acc, i) => acc + i.cantidad, 0);
              return (
                <li key={p.id}>
                  <Card className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-black text-tinta-900">Pedido #{p.id}</h2>
                          <BadgeEstado estado={p.estado} />
                        </div>
                        <p className="mt-1 text-sm text-tinta-500">
                          {formatearFecha(p.created_at)} · {cantidad} {cantidad === 1 ? "producto" : "productos"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-tinta-900">{formatearPrecio(p.total)}</span>
                        <Button
                          variant="secundario"
                          size="sm"
                          onClick={() => setAbierto(expandido ? null : p.id)}
                          aria-expanded={expandido}
                        >
                          {expandido ? "Ocultar" : "Ver detalle"}
                        </Button>
                        {p.estado === "PENDIENTE" && (
                          <Button variant="peligro" size="sm" onClick={() => setACancelar(p)}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                    {expandido && (
                      <div className="mt-5 border-t border-crema-200 pt-5">
                        <PedidoDetalle pedido={p} />
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
          <Paginacion pagina={pagina} total={pedidos.data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}

      <ConfirmModal
        isOpen={aCancelar !== null}
        title={`¿Cancelar el pedido #${aCancelar?.id ?? ""}?`}
        confirmLabel="Sí, cancelar"
        cargando={cancelar.isPending}
        onConfirm={confirmarCancelacion}
        onClose={() => setACancelar(null)}
      >
        Se va a cancelar el pedido por {aCancelar ? formatearPrecio(aCancelar.total) : ""}. Esta acción no se
        puede deshacer.
      </ConfirmModal>
    </div>
  );
}

export default MisPedidosPage;
