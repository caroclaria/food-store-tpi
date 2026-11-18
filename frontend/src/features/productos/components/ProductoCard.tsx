import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import Badge from "@/shared/ui/Badge";
import Button from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/format";
import type { ProductoRead } from "../types/producto.types";
import ProductoImagen from "./ProductoImagen";

function ProductoCard({ producto }: { producto: ProductoRead }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0
  );
  const mostrar = useNotificationStore((s) => s.mostrar);

  const sinStock = producto.stock === 0;
  const vendible = producto.disponible && !sinStock;
  const llegoAlMaximo = enCarrito >= producto.stock;

  const handleAgregar = () => {
    const ok = agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });
    if (ok) mostrar(`${producto.nombre} agregado al carrito`);
    else mostrar(`No hay más stock de ${producto.nombre}`, "error");
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-crema-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 overflow-hidden">
        <ProductoImagen
          url={producto.imagen_url}
          nombre={producto.nombre}
          categoria={producto.categoria.nombre}
          className="h-full w-full transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge color="crema">{producto.categoria.nombre}</Badge>
        </div>
        {!vendible && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <Badge color="rosa">{sinStock ? "Sin stock" : "No disponible"}</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-extrabold leading-tight text-tinta-900">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-tinta-500">{producto.descripcion}</p>
        )}
        <p className="mt-2 text-xs font-semibold text-tinta-400">
          {vendible ? `${producto.stock} disponibles` : "Volvé pronto"}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-xl font-black text-tinta-900">{formatearPrecio(producto.precio_base)}</span>
          <Button
            size="sm"
            variant={enCarrito > 0 ? "menta" : "primario"}
            onClick={handleAgregar}
            disabled={!vendible || llegoAlMaximo}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            {enCarrito > 0 ? `En carrito (${enCarrito}) +` : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ProductoCard;
