import { formatearFecha, formatearPrecio } from "@/shared/utils/format";
import type { Pedido } from "../types/pedido.types";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido.types";

/** Líneas y datos de entrega de un pedido (copia inmutable de nombre y precio). */
function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl ring-1 ring-crema-200">
        <table className="min-w-full text-sm">
          <thead className="bg-crema-50 text-xs uppercase tracking-wide text-tinta-500">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-extrabold">Producto</th>
              <th scope="col" className="px-4 py-2 text-right font-extrabold">Precio</th>
              <th scope="col" className="px-4 py-2 text-right font-extrabold">Cant.</th>
              <th scope="col" className="px-4 py-2 text-right font-extrabold">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crema-100">
            {pedido.items.map((d) => (
              <tr key={d.producto_id}>
                <td className="px-4 py-2 font-semibold text-tinta-800">{d.nombre_producto}</td>
                <td className="px-4 py-2 text-right text-tinta-600">{formatearPrecio(d.precio_unitario)}</td>
                <td className="px-4 py-2 text-right text-tinta-600">{d.cantidad}</td>
                <td className="px-4 py-2 text-right font-bold text-tinta-800">{formatearPrecio(d.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-menta-50">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right font-extrabold text-menta-800">Total</td>
              <td className="px-4 py-2 text-right text-base font-black text-tinta-900">{formatearPrecio(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-crema-50 p-3">
          <dt className="text-xs font-bold uppercase tracking-wide text-tinta-400">Entrega</dt>
          <dd className="mt-0.5 font-semibold text-tinta-800">{pedido.direccion_entrega}</dd>
        </div>
        <div className="rounded-2xl bg-crema-50 p-3">
          <dt className="text-xs font-bold uppercase tracking-wide text-tinta-400">Pago</dt>
          <dd className="mt-0.5 font-semibold text-tinta-800">{ETIQUETA_FORMA_PAGO[pedido.forma_pago]}</dd>
        </div>
        {pedido.notas && (
          <div className="rounded-2xl bg-crema-50 p-3 sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-tinta-400">Notas</dt>
            <dd className="mt-0.5 text-tinta-700">{pedido.notas}</dd>
          </div>
        )}
        <div className="text-xs text-tinta-400 sm:col-span-2">
          Creado el {formatearFecha(pedido.created_at)} · Última actualización {formatearFecha(pedido.updated_at)}
        </div>
      </dl>
    </div>
  );
}

export default PedidoDetalle;
