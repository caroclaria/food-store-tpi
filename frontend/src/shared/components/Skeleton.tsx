export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-crema-200 ${className}`} />;
}

/** Grilla de tarjetas fantasma mientras carga el catálogo. */
export function SkeletonGrid({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando productos"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-crema-200 bg-white">
          <Skeleton className="h-44 rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Filas fantasma para listas y tablas. */
export function SkeletonLista({ filas = 4 }: { filas?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default Skeleton;
