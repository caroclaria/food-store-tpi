"""Dependencias de sesión y rol reutilizadas por los routers."""

from typing import Callable, Optional, Sequence

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie
from sqlmodel import Session

from app.core.config import COOKIE_NAME
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

# Lee la cookie HttpOnly. En /docs aparece como esquema de seguridad: al
# ejecutar POST /auth/token desde Swagger el navegador guarda la cookie y la
# envía en las siguientes peticiones.
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def _no_autenticado(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def get_current_user(
    token: Optional[str] = Depends(cookie_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    """401 si falta la cookie o si el token es inválido o venció."""
    if not token:
        raise _no_autenticado("No autenticado")
    username = decode_access_token(token)
    if username is None:
        raise _no_autenticado("Sesión inválida o vencida")
    usuario = UsuarioRepository(session).get_by_username(username)
    if usuario is None:
        raise _no_autenticado("Sesión inválida o vencida")
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """400 si la cuenta está desactivada."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: Sequence[str]) -> Callable[..., Usuario]:
    """403 si el rol del usuario no está entre los permitidos."""
    permitidos = set(roles)

    def checker(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return checker
