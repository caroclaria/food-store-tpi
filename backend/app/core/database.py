"""Motor de base de datos, creación de tablas y fábrica de sesiones."""

from datetime import datetime, timezone
from typing import Iterator

from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_es_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.SQL_ECHO,
    connect_args={"check_same_thread": False} if _es_sqlite else {},
)

if _es_sqlite:
    # SQLite no valida las claves foráneas salvo que se active en cada conexión.
    @event.listens_for(engine, "connect")
    def _activar_fk(dbapi_connection, _record) -> None:  # pragma: no cover
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def import_models() -> None:
    """Importa todos los modelos para registrar sus tablas y relaciones."""
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401


def create_all_tables() -> None:
    import_models()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Iterator[Session]:
    """Sesión de solo lectura para las dependencias de autenticación."""
    with session_factory() as session:
        yield session
