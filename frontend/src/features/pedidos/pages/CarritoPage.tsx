import { Link, useNavigate } from "react-router-dom";
import ProductoImagen from "@/features/productos/components/ProductoImagen";
import { useCartStore } from "@/store/cartStore";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/format";
import ResumenCarrito from "../components/ResumenCarrito";

const btnCantidad =
  "flex h-8 w-8 items-center justify-center rounded-full bg-crema-100 text-lg font-black text-tinta-700 hover:bg-crema-200 disabled:cursor-not-allowed disabled:opacity-40";

function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const quitar = useCartStore((s) => s.quitar);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-6">
        <EstadoVacio
          icono="🛒"
          titulo="Tu carrito está vacío"
          descripcion="Sumá algo rico desde el catálogo."
          accion={
            <Link to="/" className="rounded-xl bg-rosa-300 px-4 py-2 text-sm font-bold text-tinta-900 hover:bg-rosa-400">
              Ver catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titulo="Carrito"
        descripcion="Revisá las cantidades antes de confirmar."
        acciones={
          <Button variant="fantasma" size="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.producto_id}>
              <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <ProductoImagen
                  url={item.imagen_url}
                  nombre={item.nombre}
                  categoria={item.nombre}
                  className="h-20 w-20 shrink-0 rounded-2xl"
                  emojiClassName="text-3xl"
                />
                <div className="flex-1">
                  <p className="font-extrabold text-tinta-900">{item.nombre}</p>
                  <p className="text-sm text-tinta-500">{formatearPrecio(item.precio_unitario)} c/u</p>
                </div>
                <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.nombre}`}>
                  <button
                    type="button"
                    className={btnCantidad}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    aria-label="Restar uno"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-black text-tinta-900">{item.cantidad}</span>
                  <button
                    type="button"
                    className={btnCantidad}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    aria-label="Sumar uno"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 sm:w-40 sm:flex-col sm:items-end sm:gap-1">
                  <span className="text-lg font-black text-tinta-900">
                    {formatearPrecio(item.precio_unitario * item.cantidad)}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitar(item.producto_id)}
                    className="text-xs font-bold text-rosa-700 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <ResumenCarrito items={items} total={total}>
          <Button size="lg" className="w-full" onClick={() => navigate("/checkout")}>
            Confirmar pedido →
          </Button>
          <Link to="/" className="mt-3 block text-center text-sm font-bold text-tinta-500 hover:text-tinta-800">
            Seguir comprando
          </Link>
        </ResumenCarrito>
      </div>
    </div>
  );
}

export default CarritoPage;
