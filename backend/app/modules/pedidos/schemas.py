from typing import Annotated, List, Literal, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.core.tipos import FechaUTC

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
# RN-06: solo pago manual.
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]
Direccion = Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=200)]
Notas = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


# ---------- Entrada ----------


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """Pedido armado desde el carrito. Los productos repetidos los rechaza el
    Service con 400 (ProductoRepetido)."""

    items: List[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: Direccion
    notas: Optional[Notas] = None


class CambioEstado(SQLModel):
    estado: EstadoPedido


# ---------- Salida ----------


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: FechaUTC
    updated_at: FechaUTC
    items: List[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
