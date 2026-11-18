export type ColorResumen = "limon" | "durazno" | "menta" | "rosa" | "lavanda" | "cielo";

const COLORES: Record<ColorResumen, { caja: string; icono: string; texto: string }> = {
  limon: { caja: "bg-limon-50 ring-limon-200", icono: "bg-limon-200", texto: "text-limon-800" },
  durazno: { caja: "bg-durazno-50 ring-durazno-200", icono: "bg-durazno-200", texto: "text-durazno-800" },
  menta: { caja: "bg-menta-50 ring-menta-200", icono: "bg-menta-200", texto: "text-menta-800" },
  rosa: { caja: "bg-rosa-50 ring-rosa-200", icono: "bg-rosa-200", texto: "text-rosa-800" },
  lavanda: { caja: "bg-lavanda-50 ring-lavanda-200", icono: "bg-lavanda-200", texto: "text-lavanda-800" },
  cielo: { caja: "bg-cielo-50 ring-cielo-200", icono: "bg-cielo-200", texto: "text-cielo-800" },
};

interface ResumenCardProps {
  titulo: string;
  valor: string;
  icono: string;
  color: ColorResumen;
  detalle?: string;
}

function ResumenCard({ titulo, valor, icono, color, detalle }: ResumenCardProps) {
  const c = COLORES[color];
  return (
    <div className={`rounded-3xl p-5 ring-1 ${c.caja}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-extrabold ${c.texto}`}>{titulo}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${c.icono}`} aria-hidden="true">
          {icono}
        </span>
      </div>
      <p className="mt-3 text-4xl font-black tracking-tight text-tinta-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-tinta-500">{detalle}</p>}
    </div>
  );
}

export default ResumenCard;
