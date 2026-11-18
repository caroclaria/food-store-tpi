from typing import List

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# ---------- Excepciones de dominio (el router las traduce a HTTP) ----------


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int):
        super().__init__(f"Usuario {usuario_id} no encontrado")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("No podés desactivar tu propia cuenta")


# ---------- Servicio ----------


class UsuarioService:
    """Gestión de usuarios por el admin. Activar y desactivar son idempotentes."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> List[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_todos()]

    def _set_disabled(self, usuario_id: int, disabled: bool, actor_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(usuario_id)
            if disabled and usuario_id == actor_id:
                raise AutoDesactivacion()
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def activar(self, usuario_id: int, actor_id: int) -> UserPublic:
        return self._set_disabled(usuario_id, False, actor_id)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        return self._set_disabled(usuario_id, True, actor_id)
