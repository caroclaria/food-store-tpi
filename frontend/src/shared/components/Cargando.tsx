function Cargando({ mensaje = "Cargando..." }: { mensaje?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex gap-1.5">
        <span className="h-3 w-3 animate-bounce rounded-full bg-rosa-300 [animation-delay:-0.3s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-menta-300 [animation-delay:-0.15s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-lavanda-300" />
      </div>
      <p className="text-sm font-semibold text-tinta-500">{mensaje}</p>
    </div>
  );
}

export default Cargando;
