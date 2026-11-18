from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def list_by_usuario(
        self,
        usuario_id: Optional[int],
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[Pedido]]:
        """Pedidos de un usuario (o de todos si usuario_id es None), del más
        reciente al más antiguo. Devuelve (total, página)."""
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Pedido)
            .where(*condiciones)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return int(total), list(items)

    def count_by_estado(self) -> Dict[str, int]:
        statement = select(Pedido.estado, func.count(col(Pedido.id))).group_by(Pedido.estado)
        return {estado: int(cantidad) for estado, cantidad in self.session.exec(statement).all()}

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count(col(Pedido.id))).where(col(Pedido.created_at) >= desde)
        return int(self.session.exec(statement).one())

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(statement).one())
