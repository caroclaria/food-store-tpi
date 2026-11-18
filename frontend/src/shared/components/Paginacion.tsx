interface PaginacionProps {
  /** Página actual, empezando en 0. */
  pagina: number;
  total: number;
  porPagina: number;
  onCambiar: (pagina: number) => void;
}

const btn =
  "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

/** Paginación del lado del servidor: el padre pide skip = página × limit. */
function Paginacion({ pagina, total, porPagina, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  if (total <= porPagina) return null;

  const desde = pagina * porPagina + 1;
  const hasta = Math.min((pagina + 1) * porPagina, total);

  return (
    <nav
      aria-label="Paginación"
      className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-tinta-500">
        Mostrando <span className="font-bold text-tinta-700">{desde}–{hasta}</span> de {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={`${btn} bg-white text-tinta-700 ring-1 ring-crema-300 hover:bg-crema-50`}
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina === 0}
        >
          ← Anterior
        </button>
        {Array.from({ length: paginas }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-current={i === pagina ? "page" : undefined}
            onClick={() => onCambiar(i)}
            className={`${btn} ${
              i === pagina
                ? "bg-lavanda-200 text-lavanda-800"
                : "text-tinta-600 hover:bg-crema-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          type="button"
          className={`${btn} bg-white text-tinta-700 ring-1 ring-crema-300 hover:bg-crema-50`}
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina >= paginas - 1}
        >
          Siguiente →
        </button>
      </div>
    </nav>
  );
}

export default Paginacion;
