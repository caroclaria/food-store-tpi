from typing import List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[Producto]]:
        """Productos activos filtrados por nombre (sin distinguir mayúsculas),
        categoría y disponibilidad. Devuelve (total, página)."""
        condiciones = [col(Producto.activo).is_(True)]
        if search and search.strip():
            condiciones.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Producto)
            .where(*condiciones)
            .order_by(col(Producto.nombre))
            .offset(skip)
            .limit(limit)
        ).all()
        return int(total), list(items)
