import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { notificarError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import PageHeader from "@/shared/components/PageHeader";
import Badge from "@/shared/ui/Badge";
import Button from "@/shared/ui/Button";
import { SearchInput } from "@/shared/ui/Input";
import { useCambiarEstadoUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { UserPublic } from "../types/usuario.types";

const columnHelper = createColumnHelper<UserPublic>();

function AdminUsuariosPage() {
  const usuarios = useUsuarios();
  const cambiarEstado = useCambiarEstadoUsuario();
  const mostrar = useNotificationStore((s) => s.mostrar);
  const miId = useAuthStore((s) => s.usuario?.id);

  const [filtro, setFiltro] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => {
    const cambiar = (u: UserPublic, activar: boolean) =>
      cambiarEstado.mutate(
        { id: u.id, activar },
        {
          onSuccess: () => mostrar(`${u.username} ${activar ? "activado" : "desactivado"}`),
          onError: (error) => notificarError(error, "No se pudo cambiar el estado"),
        }
      );

    return [
      columnHelper.accessor("username", {
        header: "Usuario",
        cell: (info) => <span className="font-extrabold text-tinta-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("full_name", { header: "Nombre" }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => <span className="text-tinta-500">{info.getValue()}</span>,
      }),
      columnHelper.accessor("role", {
        header: "Rol",
        cell: (info) =>
          info.getValue() === "admin" ? <Badge color="lavanda">Admin</Badge> : <Badge color="cielo">Cliente</Badge>,
      }),
      columnHelper.accessor("disabled", {
        header: "Estado",
        cell: (info) => (info.getValue() ? <Badge color="rosa">Desactivado</Badge> : <Badge color="menta">Activo</Badge>),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          // El botón Desactivar no se muestra en la fila del usuario de la sesión.
          if (u.id === miId) return <p className="text-right text-xs font-semibold text-tinta-400">Tu cuenta</p>;
          return (
            <div className="flex justify-end">
              {u.disabled ? (
                <Button size="sm" variant="menta" disabled={cambiarEstado.isPending} onClick={() => cambiar(u, true)}>
                  Activar
                </Button>
              ) : (
                <Button size="sm" variant="peligro" disabled={cambiarEstado.isPending} onClick={() => cambiar(u, false)}>
                  Desactivar
                </Button>
              )}
            </div>
          );
        },
      }),
    ];
  }, [cambiarEstado, mostrar, miId]);

  const table = useReactTable({
    data: usuarios.data ?? [],
    columns,
    state: { globalFilter: filtro, sorting },
    onGlobalFilterChange: setFiltro,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <PageHeader titulo="Usuarios" descripcion="Activá o desactivá cuentas de clientes y administradores." />
      <div className="mb-4">
        <SearchInput value={filtro} onChange={setFiltro} placeholder="Buscar por usuario, nombre o email..." />
      </div>
      <DataTable
        table={table}
        isLoading={usuarios.isPending}
        error={usuarios.error}
        onRetry={() => void usuarios.refetch()}
        vacioTitulo="No hay usuarios"
      />
    </div>
  );
}

export default AdminUsuariosPage;
