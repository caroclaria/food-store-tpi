from typing import Callable, Optional

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Unit of Work base.

    Abre la sesión en ``__enter__`` y, en ``__exit__``, hace commit si el bloque
    terminó sin errores o rollback si hubo una excepción; siempre cierra la
    sesión. Cada módulo hereda de esta clase y crea sus repositorios en
    ``_init_repositories`` sobre la misma sesión (una sola transacción).
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self._session_factory = session_factory
        self.session: Optional[Session] = None

    def _init_repositories(self, session: Session) -> None:
        """Los Unit of Work de cada módulo crean aquí sus repositorios."""

    def __enter__(self):
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self.session = None
        # False: la excepción (si la hubo) se propaga al Service y al Router.
        return False
