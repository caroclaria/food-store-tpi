import { useEffect } from "react";
import type { ReactNode } from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { SkeletonLista } from "./Skeleton";
import EstadoVacio from "./EstadoVacio";
import EstadoError from "./EstadoError";

interface DataTableProps<T> {
  /** Instancia creada con useReactTable en la página. */
  table: Table<T>;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  vacioTitulo: string;
  vacioDescripcion?: string;
  vacioAccion?: ReactNode;
}

const TAMANOS_PAGINA = [5, 10, 20];

const btnPag =
  "rounded-full bg-white px-3 py-1.5 font-bold ring-1 ring-crema-300 hover:bg-crema-50 disabled:cursor-not-allowed disabled:opacity-40";

/** Tabla de TanStack Table con paginación del lado del cliente. */
function DataTable<T>({
  table,
  isLoading,
  error,
  onRetry,
  vacioTitulo,
  vacioDescripcion,
  vacioAccion,
}: DataTableProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalFiltrado = table.getFilteredRowModel().rows.length;

  // Si se borra el último registro de la última página, vuelve a una válida.
  useEffect(() => {
    if (pageIndex > 0 && pageIndex >= pageCount) {
      table.setPageIndex(Math.max(pageCount - 1, 0));
    }
  }, [pageIndex, pageCount, table]);

  if (isLoading) return <SkeletonLista filas={5} />;

  if (error) {
    return <EstadoError titulo="No se pudieron cargar los datos" mensaje={error.message} onRetry={onRetry} />;
  }

  if (table.getCoreRowModel().rows.length === 0) {
    return <EstadoVacio titulo={vacioTitulo} descripcion={vacioDescripcion} accion={vacioAccion} />;
  }

  const desde = totalFiltrado === 0 ? 0 : pageIndex * pageSize + 1;
  const hasta = Math.min((pageIndex + 1) * pageSize, totalFiltrado);

  return (
    <div className="overflow-hidden rounded-3xl border border-crema-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-crema-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const alinearDerecha = header.column.id === "acciones";
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                      className={`border-b border-crema-200 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-tinta-500 ${
                        alinearDerecha ? "text-right" : "text-left"
                      }`}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-tinta-800"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="w-3 text-lavanda-700">
                            {sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : <span className="text-crema-300">↕</span>}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-crema-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-10 text-center text-tinta-500">
                  No hay resultados para la búsqueda.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-crema-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle text-tinta-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-crema-200 bg-crema-50 px-4 py-3 text-sm text-tinta-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span>
            {desde}–{hasta} de {totalFiltrado}
          </span>
          <label className="flex items-center gap-1.5">
            <span className="text-tinta-500">Filas:</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-lg border border-crema-300 bg-white px-2 py-1"
            >
              {TAMANOS_PAGINA.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className={btnPag}>
            ← Anterior
          </button>
          <span className="px-1">
            Página {pageCount === 0 ? 0 : pageIndex + 1} de {pageCount}
          </span>
          <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className={btnPag}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
