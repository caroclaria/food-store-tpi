import EstadoError from "@/shared/components/EstadoError";
import PageHeader from "@/shared/components/PageHeader";
import { Skeleton } from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/format";
import ResumenCard from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

function AdminResumenPage() {
  const resumen = useResumenPedidos();

  return (
    <div>
      <PageHeader
        titulo="Resumen del negocio"
        descripcion="Indicadores de los pedidos."
        acciones={
          <Button variant="secundario" size="sm" onClick={() => void resumen.refetch()} cargando={resumen.isFetching}>
            Actualizar
          </Button>
        }
      />

      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError mensaje={resumen.error.message} onRetry={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard
            titulo="Ingresos entregados"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            icono="💰"
            color="menta"
            detalle="Suma de los pedidos entregados"
          />
          <ResumenCard titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} icono="📅" color="cielo" />
          <ResumenCard titulo="Pendientes" valor={String(resumen.data.pendientes)} icono="⏳" color="limon" detalle="Esperan ser preparados" />
          <ResumenCard titulo="En preparación" valor={String(resumen.data.en_preparacion)} icono="👩‍🍳" color="durazno" />
          <ResumenCard titulo="Entregados" valor={String(resumen.data.entregados)} icono="✅" color="lavanda" />
          <ResumenCard titulo="Cancelados" valor={String(resumen.data.cancelados)} icono="✖️" color="rosa" />
        </div>
      )}
    </div>
  );
}

export default AdminResumenPage;
