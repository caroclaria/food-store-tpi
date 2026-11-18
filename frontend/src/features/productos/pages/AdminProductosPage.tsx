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
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { useNotificationStore } from "@/store/notificationStore";
import { notificarError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import PageHeader from "@/shared/components/PageHeader";
import Badge from "@/shared/ui/Badge";
import Button from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { SearchInput } from "@/shared/ui/Input";
import { formatearPrecio } from "@/shared/utils/format";
import ProductoFormModal from "../components/ProductoFormModal";
import ProductoImagen from "../components/ProductoImagen";
import StockModal from "../components/StockModal";
import { useEliminarProducto, useProductos } from "../hooks/useProductos";
import type { ProductoRead } from "../types/producto.types";

const columnHelper = createColumnHelper<ProductoRead>();

type EstadoFormulario = null | "nuevo" | ProductoRead;

function AdminProductosPage() {
  // El panel pide hasta 100 productos y pagina del lado del cliente.
  const productos = useProductos({ skip: 0, limit: 100 });
  const categorias = useCategorias();
  const eliminar = useEliminarProducto();
  const mostrar = useNotificationStore((s) => s.mostrar);

  const [formulario, setFormulario] = useState<EstadoFormulario>(null);
  const [stock, setStock] = useState<ProductoRead | null>(null);
  const [aEliminar, setAEliminar] = useState<ProductoRead | null>(null);
  const [filtro, setFiltro] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "nombre", desc: false }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: "Producto",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProductoImagen
              url={row.original.imagen_url}
              nombre={row.original.nombre}
              categoria={row.original.categoria.nombre}
              className="h-11 w-11 shrink-0 rounded-xl"
              emojiClassName="text-xl"
            />
            <span className="font-extrabold text-tinta-900">{row.original.nombre}</span>
          </div>
        ),
      }),
      columnHelper.accessor((p) => p.categoria.nombre, {
        id: "categoria",
        header: "Categoría",
        cell: (info) => <Badge color="crema">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("precio_base", {
        header: "Precio",
        cell: (info) => <span className="font-bold">{formatearPrecio(info.getValue())}</span>,
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: (info) => {
          const valor = info.getValue();
          return <Badge color={valor === 0 ? "rosa" : valor < 5 ? "durazno" : "menta"}>{valor} u.</Badge>;
        },
      }),
      columnHelper.accessor("disponible", {
        header: "Estado",
        cell: (info) =>
          info.getValue() ? <Badge color="menta">Disponible</Badge> : <Badge color="rosa">No disponible</Badge>,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="menta" onClick={() => setStock(row.original)}>
              Stock
            </Button>
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
    data: productos.data?.items ?? [],
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
      onSuccess: () => mostrar(`"${aEliminar.nombre}" dado de baja`),
      onError: (error) => notificarError(error, "No se pudo eliminar"),
      onSettled: () => setAEliminar(null),
    });
  };

  const sinCategorias = categorias.isSuccess && categorias.data.length === 0;

  return (
    <div>
      <PageHeader
        titulo="Productos"
        descripcion="Alta, edición, stock y baja lógica de productos."
        acciones={
          <Button onClick={() => setFormulario("nuevo")} disabled={!categorias.isSuccess || sinCategorias}>
            + Nuevo producto
          </Button>
        }
      />

      {sinCategorias && (
        <p className="mb-4 rounded-2xl bg-limon-100 p-3 text-sm font-semibold text-limon-800">
          Primero creá una categoría para poder cargar productos.
        </p>
      )}

      <div className="mb-4">
        <SearchInput value={filtro} onChange={setFiltro} placeholder="Buscar producto o categoría..." />
      </div>

      <DataTable
        table={table}
        isLoading={productos.isPending}
        error={productos.error}
        onRetry={() => void productos.refetch()}
        vacioTitulo="No hay productos"
        vacioDescripcion="Cargá el primero con el botón «Nuevo producto»."
      />

      {formulario !== null && (
        <ProductoFormModal
          key={formulario === "nuevo" ? "nuevo" : formulario.id}
          producto={formulario === "nuevo" ? null : formulario}
          categorias={categorias.data ?? []}
          onClose={() => setFormulario(null)}
        />
      )}

      {stock && <StockModal key={stock.id} producto={stock} onClose={() => setStock(null)} />}

      <ConfirmModal
        isOpen={aEliminar !== null}
        title={`¿Dar de baja "${aEliminar?.nombre ?? ""}"?`}
        confirmLabel="Dar de baja"
        cargando={eliminar.isPending}
        onConfirm={confirmarEliminar}
        onClose={() => setAEliminar(null)}
      >
        El producto deja de verse en el catálogo. Los pedidos ya hechos conservan su nombre y precio.
      </ConfirmModal>
    </div>
  );
}

export default AdminProductosPage;
