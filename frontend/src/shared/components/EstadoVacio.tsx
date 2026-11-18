import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  icono?: string;
  accion?: ReactNode;
}

function EstadoVacio({ titulo, descripcion, icono = "🍽️", accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-crema-300 bg-crema-50 px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lavanda-100 text-3xl">
        <span aria-hidden="true">{icono}</span>
      </div>
      <p className="text-lg font-extrabold text-tinta-800">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-tinta-500">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

export default EstadoVacio;
