import { useState } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonGrid } from "@/shared/components/Skeleton";
import { useDebounce } from "@/shared/hooks/useDebounce";
import Button from "@/shared/ui/Button";
import { SearchInput } from "@/shared/ui/Input";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

function chipClass(activo: boolean): string {
  return `whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
    activo
      ? "bg-rosa-200 text-rosa-800 ring-1 ring-rosa-300"
      : "bg-white text-tinta-600 ring-1 ring-crema-300 hover:bg-crema-50"
  }`;
}

function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const search = useDebounce(busqueda.trim());

  const categorias = useCategorias();
  const productos = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  });

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPagina(0);
  };

  const cambiarCategoria = (id: number | undefined) => {
    setCategoriaId(id);
    setPagina(0);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaId(undefined);
    setPagina(0);
  };

  const hayFiltros = Boolean(search) || categoriaId !== undefined;

  return (
    <div>
      {/* Encabezado */}
      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rosa-100 via-durazno-50 to-menta-100 px-6 py-8 sm:px-10 sm:py-10">
        <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lavanda-200/60 blur-2xl" />
        <div aria-hidden="true" className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-limon-200/70 blur-xl" />
        <p className="relative text-sm font-extrabold uppercase tracking-widest text-rosa-700">Food Store</p>
        <h1 className="relative mt-2 max-w-xl text-3xl font-black leading-tight tracking-tight text-tinta-900 sm:text-5xl">
          ¿Qué se te antoja hoy?
        </h1>
        <p className="relative mt-3 max-w-lg text-tinta-600">
          Elegí tus favoritos, armá el carrito y te lo llevamos. Pagás en efectivo o por transferencia.
        </p>
      </section>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <button type="button" className={chipClass(categoriaId === undefined)} onClick={() => cambiarCategoria(undefined)}>
            Todas
          </button>
          {categorias.data?.map((c) => (
            <button
              key={c.id}
              type="button"
              className={chipClass(categoriaId === c.id)}
              onClick={() => cambiarCategoria(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
        <SearchInput value={busqueda} onChange={cambiarBusqueda} placeholder="Buscar productos..." />
      </div>

      {/* Resultados */}
      {productos.isPending ? (
        <SkeletonGrid cantidad={POR_PAGINA} />
      ) : productos.isError ? (
        <EstadoError
          titulo="No pudimos cargar el catálogo"
          mensaje={productos.error.message}
          onRetry={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          icono="🔍"
          titulo={hayFiltros ? "No encontramos productos" : "Todavía no hay productos"}
          descripcion={hayFiltros ? "Probá con otra búsqueda o categoría." : "Volvé en un rato."}
          accion={
            hayFiltros ? (
              <Button variant="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              productos.isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            porPagina={POR_PAGINA}
            onCambiar={(p) => {
              setPagina(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}

export default CatalogoPage;
