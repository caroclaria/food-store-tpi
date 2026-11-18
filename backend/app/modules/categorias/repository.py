from typing import List, Optional

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca también entre las dadas de baja: la baja no libera el nombre."""
        statement = select(Categoria).where(
            func.lower(Categoria.nombre) == nombre.strip().lower()
        )
        return self.session.exec(statement).first()

    def list_activas(self) -> List[Categoria]:
        statement = (
            select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        )
        return list(self.session.exec(statement).all())
