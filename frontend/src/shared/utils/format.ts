const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

export function formatearPrecio(valor: number): string {
  return moneda.format(valor);
}

const fechaHora = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatearFecha(iso: string): string {
  return fechaHora.format(new Date(iso));
}

const tiene = (texto: string, claves: string[]) => claves.some((c) => texto.includes(c));

/** Emoji y color de respaldo según la categoría (o el nombre), para productos sin imagen. */
export function estiloCategoria(nombre: string): { emoji: string; fondo: string } {
  const n = nombre.toLowerCase();
  if (tiene(n, ["pizza", "fugazz"])) return { emoji: "🍕", fondo: "from-durazno-100 to-rosa-100" };
  if (tiene(n, ["hambur", "burger"])) return { emoji: "🍔", fondo: "from-limon-100 to-durazno-100" };
  if (tiene(n, ["bebida", "agua", "gaseosa", "limonada", "jugo"]))
    return { emoji: "🥤", fondo: "from-cielo-100 to-menta-100" };
  if (tiene(n, ["postre", "flan", "brownie", "cheesecake", "helado", "torta"]))
    return { emoji: "🍰", fondo: "from-rosa-100 to-lavanda-100" };
  return { emoji: "🍽️", fondo: "from-lavanda-100 to-menta-100" };
}
