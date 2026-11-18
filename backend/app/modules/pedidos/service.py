from datetime import datetime, time, timezone
from typing import Dict, Optional, Set

from app.core.database import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

__all__ = [
    "PedidoAjeno",
    "PedidoNoCancelable",
    "PedidoNoEncontrado",
    "PedidoService",
    "ProductoNoDisponible",
    "ProductoNoEncontrado",
    "ProductoRepetido",
    "ReglaDeNegocio",
    "StockInsuficiente",
    "TransicionInvalida",
]

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

# RN-02: máquina de estados. Los estados terminales no admiten transiciones.
TRANSICIONES: Dict[str, Set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


# ---------- Excepciones de dominio (el router las traduce a HTTP) ----------


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio que responden 400."""


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int):
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, disponible: int, pedido: int):
        super().__init__(
            f"Stock insuficiente para '{nombre}': hay {disponible} y se pidieron {pedido}"
        )


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str):
        super().__init__(f"Transición inválida: de {actual} a {nuevo}")


class PedidoNoCancelable(ReglaDeNegocio):
    def __init__(self, estado: str):
        super().__init__(f"Solo se pueden cancelar pedidos PENDIENTE (estado actual: {estado})")


# ---------- Servicio ----------


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    # ---- RN-01: crear pedido ----

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        """Todo ocurre en una sola transacción: si una validación falla, el
        Unit of Work hace rollback y no se persiste nada (tampoco el stock)."""
        with self.uow as uow:
            vistos: Set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas or None,
                    total=0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        # Copia: el pedido no cambia si después cambia el producto (RN-05).
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---- Lecturas (RN-04) ----

    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        estado: Optional[str],
        skip: int,
        limit: int,
    ) -> PedidosPaginados:
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                None if es_admin else usuario_id, estado, skip, limit
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # ---- RN-02 / RN-03: cambios de estado ----

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """admin: avanza o cancela desde cualquier estado no terminal."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            self._transicionar(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """Dueño: cancela su propio pedido solo desde PENDIENTE (RN-04)."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise PedidoNoCancelable(pedido.estado)
            self._transicionar(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ---- Resumen del panel ----

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            # Inicio del día de hoy en la hora local del servidor, expresado en UTC.
            inicio_local = datetime.combine(datetime.now().date(), time.min).astimezone()
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_local.astimezone(timezone.utc)),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado(ENTREGADO), 2),
            )

    # ---- Helpers ----

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        """Valida la transición antes de modificar el pedido. Al cancelar
        restituye el stock de cada línea en la misma transacción (RN-03)."""
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(pedido.estado, nuevo_estado)
        if nuevo_estado == CANCELADO:
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto is not None:
                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo_estado
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)
