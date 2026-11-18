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
import { useNotificationStore } from "@/store/notificationStore";
import { notificarError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import PageHeader from "@/shared/components/PageHeader";
import Button from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { SearchInput } from "@/shared/ui/Input";
import CategoriaFormModal from "../components/CategoriaFormModal";
import { useCategorias, useEliminarCategoria } from "../hooks/useCategorias";
import type { CategoriaRead } from "../types/categoria.types";

const columnHelper = createColumnHelper<CategoriaRead>();

/** El formulario está cerrado (null), en alta ("nueva") o editando una categoría. */
type EstadoFormulario = null | "nueva" | CategoriaRead;

function AdminCategoriasPage() {
  const categorias = useCategorias();
  const eliminar = useEliminarCategoria();
  const mostrar = useNotificationStore((s) => s.mostrar);

  const [formulario, setFormulario] = useState<EstadoFormulario>(null);
  const [aEliminar, setAEliminar] = useState<CategoriaRead | null>(null);
  const [filtro, setFiltro] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "nombre", desc: false }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: "Nombre",
        cell: (info) => <span className="font-extrabold text-tinta-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("descripcion", {
        header: "Descripción",
        enableSorting: false,
        cell: (info) => <span className="text-tinta-500">{info.getValue() || "—"}</span>,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="lavanda" onClick={() => setFormulario(row.original)}>
              Editar
            </Button>
            <Button size="sm" variant="peligro" onClick={() => setAEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: categorias.data ?? [],
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

  const confirmarEliminar = () => {
    if (!aEliminar) return;
    eliminar.mutate(aEliminar.id, {
      onSuccess: () => mostrar(`Categoría "${aEliminar.nombre}" dada de baja`),
      onError: (error) => notificarError(error, "No se pudo eliminar"),
      onSettled: () => setAEliminar(null),
    });
  };

  return (
    <div>
      <PageHeader
        titulo="Categorías"
        descripcion="Alta, edición y baja lógica de categorías."
        acciones={<Button onClick={() => setFormulario("nueva")}>+ Nueva categoría</Button>}
      />

      <div className="mb-4">
        <SearchInput value={filtro} onChange={setFiltro} placeholder="Buscar categoría..." />
      </div>

      <DataTable
        table={table}
        isLoading={categorias.isPending}
        error={categorias.error}
        onRetry={() => void categorias.refetch()}
        vacioTitulo="No hay categorías"
        vacioDescripcion="Creá la primera para empezar a cargar productos."
      />

      {formulario !== null && (
        <CategoriaFormModal
          key={formulario === "nueva" ? "nueva" : formulario.id}
          categoria={formulario === "nueva" ? null : formulario}
          onClose={() => setFormulario(null)}
        />
      )}

      <ConfirmModal
        isOpen={aEliminar !== null}
        title={`¿Dar de baja "${aEliminar?.nombre ?? ""}"?`}
        confirmLabel="Dar de baja"
        cargando={eliminar.isPending}
        onConfirm={confirmarEliminar}
        onClose={() => setAEliminar(null)}
      >
        La categoría deja de listarse pero su nombre queda reservado. Sus productos siguen visibles: para
        retirarlos del catálogo, dalos de baja desde Productos.
      </ConfirmModal>
    </div>
  );
}

export default AdminCategoriasPage;
