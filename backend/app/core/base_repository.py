from typing import Generic, List, Optional, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Acceso a datos genérico sobre una sesión abierta.

    Solo hace flush(): nunca llama a commit(). Confirmar o revertir la
    transacción es responsabilidad del Unit of Work. Sin reglas de negocio.
    """

    model: Type[T]

    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        statement = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def add(self, obj: T) -> T:
        """INSERT o UPDATE. flush() deja disponible el id autoincremental."""
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()
