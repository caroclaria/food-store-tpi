import { useCallback, useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import { useNotificationStore } from "@/store/notificationStore";
import { notificarError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import PageHeader from "@/shared/components/PageHeader";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import type { ButtonVariant } from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import Modal from "@/shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "@/shared/utils/format";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types/pedido.types";
import { ESTADOS, ETIQUETA_ESTADO, ETIQUETA_FORMA_PAGO, TRANSICIONES } from "../types/pedido.types";

const ACCION: Record<EstadoPedido, { label: string; variant: ButtonVariant }> = {
  PENDIENTE: { label: "Pendiente", variant: "secundario" },
  EN_PREPARACION: { label: "Preparar", variant: "durazno" },
  ENTREGADO: { label: "Entregar", variant: "menta" },
  CANCELADO: { label: "Cancelar", variant: "peligro" },
};

const columnHelper = createColumnHelper<Pedido>();

function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);

  // El panel pide hasta 100 pedidos y pagina del lado del cliente.
  const pedidos = usePedidos({ skip: 0, limit: 100, estado });
  const usuarios = useUsuarios();
  const cambiarEstado = useCambiarEstadoPedido();
  const mostrar = useNotificationStore((s) => s.mostrar);

  const nombres = useMemo(
    () => new Map((usuarios.data ?? []).map((u) => [u.id, u.username])),
    [usuarios.data]
  );

  const { mutate, isPending } = cambiarEstado;
  const aplicar = useCallback(
    (pedido: Pedido, nuevo: EstadoPedido) =>
      mutate(
        { id: pedido.id, estado: nuevo },
        {
          onSuccess: (p) => {
            mostrar(`Pedido #${p.id}: ${ETIQUETA_ESTADO[p.estado]}`);
            setACancelar(null);
          },
          onError: (error) => {
            notificarError(error, "No se pudo cambiar el estado");
            setACancelar(null);
          },
        }
      ),
    [mutate, mostrar]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "#",
        cell: (info) => <span className="font-black text-tinta-900">#{info.getValue()}</span>,
      }),
      columnHelper.accessor((p) => nombres.get(p.usuario_id) ?? `Usuario ${p.usuario_id}`, {
        id: "cliente",
        header: "Cliente",
        cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      }),
      columnHelper.accessor("created_at", {
        header: "Fecha",
        cell: (info) => <span className="whitespace-nowrap text-tinta-500">{formatearFecha(info.getValue())}</span>,
      }),
      columnHelper.accessor("forma_pago", {
        header: "Pago",
        cell: (info) => ETIQUETA_FORMA_PAGO[info.getValue()],
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: (info) => <span className="font-bold">{formatearPrecio(info.getValue())}</span>,
      }),
      columnHelper.accessor("estado", {
        header: "Estado",
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Button variant="fantasma" size="sm" onClick={() => setDetalle(p)}>
                Ver
              </Button>
              {TRANSICIONES[p.estado].map((siguiente) => (
                <Button
                  key={siguiente}
                  size="sm"
                  variant={ACCION[siguiente].variant}
                  disabled={isPending}
                  onClick={() => (siguiente === "CANCELADO" ? setACancelar(p) : aplicar(p, siguiente))}
                >
                  {ACCION[siguiente].label}
                </Button>
              ))}
            </div>
          );
        },
      }),
    ],
    [nombres, isPending, aplicar]
  );

  const table = useReactTable({
    data: pedidos.data?.items ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <PageHeader titulo="Pedidos" descripcion="Avanzá o cancelá los pedidos según su estado." />

      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {[undefined, ...ESTADOS].map((e) => (
          <button
            key={e ?? "todos"}
            type="button"
            onClick={() => setEstado(e)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              estado === e ? "bg-lavanda-200 text-lavanda-800 ring-1 ring-lavanda-300" : "bg-white text-tinta-600 ring-1 ring-crema-300 hover:bg-crema-50"
            }`}
          >
            {e ? ETIQUETA_ESTADO[e] : "Todos"}
          </button>
        ))}
      </div>

      <DataTable
        table={table}
        isLoading={pedidos.isPending}
        error={pedidos.error}
        onRetry={() => void pedidos.refetch()}
        vacioTitulo={estado ? "No hay pedidos con ese estado" : "Todavía no hay pedidos"}
      />

      <Modal isOpen={detalle !== null} title={`Pedido #${detalle?.id ?? ""}`} onClose={() => setDetalle(null)} size="lg">
        {detalle && (
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-tinta-500">
                Cliente: <span className="font-bold text-tinta-800">{nombres.get(detalle.usuario_id) ?? detalle.usuario_id}</span>
              </span>
              <BadgeEstado estado={detalle.estado} />
            </div>
            <PedidoDetalle pedido={detalle} />
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={aCancelar !== null}
        title={`¿Cancelar el pedido #${aCancelar?.id ?? ""}?`}
        confirmLabel="Sí, cancelar"
        cargando={cambiarEstado.isPending}
        onConfirm={() => aCancelar && aplicar(aCancelar, "CANCELADO")}
        onClose={() => setACancelar(null)}
      >
        El stock de cada producto del pedido se va a restituir. Esta acción no se puede deshacer.
      </ConfirmModal>
    </div>
  );
}

export default AdminPedidosPage;
