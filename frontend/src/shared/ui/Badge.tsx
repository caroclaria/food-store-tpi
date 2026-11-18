import type { ReactNode } from "react";

export type BadgeColor = "menta" | "rosa" | "lavanda" | "durazno" | "limon" | "cielo" | "crema";

const COLORES: Record<BadgeColor, string> = {
  menta: "bg-menta-100 text-menta-800",
  rosa: "bg-rosa-100 text-rosa-800",
  lavanda: "bg-lavanda-100 text-lavanda-800",
  durazno: "bg-durazno-100 text-durazno-800",
  limon: "bg-limon-100 text-limon-800",
  cielo: "bg-cielo-100 text-cielo-800",
  crema: "bg-crema-200 text-tinta-700",
};

function Badge({ color, children }: { color: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${COLORES[color]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
