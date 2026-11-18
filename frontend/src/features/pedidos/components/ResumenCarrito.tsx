import type { ReactNode } from "react";
import type { CartItem } from "@/store/cartStore";
import Card from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/format";

interface ResumenCarritoProps {
  items: CartItem[];
  total: number;
  children?: ReactNode;
}

/** Tarjeta lateral con las líneas del carrito y el total. */
function ResumenCarrito({ items, total, children }: ResumenCarritoProps) {
  return (
    <Card className="sticky top-24 p-6">
      <h2 className="text-lg font-extrabold text-tinta-900">Tu pedido</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.producto_id} className="flex justify-between gap-3">
            <span className="text-tinta-600">
              <span className="font-bold text-tinta-800">{i.cantidad}×</span> {i.nombre}
            </span>
            <span className="whitespace-nowrap font-semibold text-tinta-700">
              {formatearPrecio(i.precio_unitario * i.cantidad)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-menta-50 px-4 py-3 ring-1 ring-menta-100">
        <span className="font-bold text-menta-800">Total</span>
        <span className="text-2xl font-black text-tinta-900">{formatearPrecio(total)}</span>
      </div>
      <p className="mt-2 text-xs text-tinta-400">
        Los precios se confirman al crear el pedido y después no cambian.
      </p>
      {children && <div className="mt-5">{children}</div>}
    </Card>
  );
}

export default ResumenCarrito;
