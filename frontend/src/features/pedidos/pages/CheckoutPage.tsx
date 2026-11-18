import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import Card from "@/shared/ui/Card";
import CheckoutForm from "../components/CheckoutForm";
import type { DatosCheckout } from "../components/CheckoutForm";
import ResumenCarrito from "../components/ResumenCarrito";
import { useCrearPedido } from "../hooks/usePedidos";

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const mostrar = useNotificationStore((s) => s.mostrar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-6">
        <EstadoVacio
          icono="🛒"
          titulo="No hay nada para confirmar"
          descripcion="Agregá productos al carrito primero."
          accion={
            <Link to="/" className="rounded-xl bg-rosa-300 px-4 py-2 text-sm font-bold text-tinta-900 hover:bg-rosa-400">
              Ir al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  const confirmar = async (datos: DatosCheckout) => {
    setErrorApi(null);
    try {
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      });
      vaciar();
      mostrar(`¡Pedido #${pedido.id} confirmado!`);
      navigate("/mis-pedidos");
    } catch (error) {
      // El carrito se conserva para que se pueda corregir (por ejemplo, el stock).
      setErrorApi(handleApiError(error));
    }
  };

  return (
    <div>
      <PageHeader titulo="Confirmar pedido" descripcion="Decinos dónde y cómo lo pagás." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 sm:p-8">
          <CheckoutForm onSubmit={confirmar} errorApi={errorApi} />
        </Card>
        <ResumenCarrito items={items} total={total}>
          <Link to="/carrito" className="block text-center text-sm font-bold text-tinta-500 hover:text-tinta-800">
            ← Volver al carrito
          </Link>
        </ResumenCarrito>
      </div>
    </div>
  );
}

export default CheckoutPage;
