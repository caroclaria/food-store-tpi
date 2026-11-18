import Button from "@/shared/ui/Button";

interface EstadoErrorProps {
  titulo?: string;
  mensaje: string;
  onRetry?: () => void;
}

function EstadoError({ titulo = "Algo salió mal", mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-rosa-200 bg-rosa-50 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-extrabold text-rosa-800">{titulo}</p>
        <p className="mt-0.5 text-sm text-rosa-700">{mensaje}</p>
      </div>
      {onRetry && (
        <Button variant="secundario" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default EstadoError;
