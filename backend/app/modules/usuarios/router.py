from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])

require_admin = require_role(["admin"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=List[UserPublic], dependencies=[Depends(require_admin)])
def listar_usuarios(service: UsuarioService = Depends(get_usuario_service)):
    """Todos los usuarios, incluidos los desactivados."""
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_admin),
    service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.activar(usuario_id, actor_id=admin.id or 0)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_admin),
    service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.desactivar(usuario_id, actor_id=admin.id or 0)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except AutoDesactivacion as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
