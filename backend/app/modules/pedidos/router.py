from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

require_admin = require_role(["admin"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


# Excepciones de dominio que traduce este router.
ERRORES_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


def _http_error(exc: Exception) -> HTTPException:
    """404 inexistente, 403 ajeno y 400 para las reglas de negocio
    (StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida...)."""
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        codigo = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, PedidoAjeno):
        codigo = status.HTTP_403_FORBIDDEN
    else:
        codigo = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=codigo, detail=str(exc))


def _es_admin(usuario: Usuario) -> bool:
    return usuario.role == "admin"


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    """RN-01: crea el pedido desde el carrito. El usuario sale de la sesión."""
    assert usuario.id is not None
    try:
        return service.crear(data, usuario.id)
    except ERRORES_DOMINIO as exc:
        raise _http_error(exc)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedido] = None,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    """Los propios (user) o todos (admin)."""
    assert usuario.id is not None
    return service.listar(usuario.id, _es_admin(usuario), estado, skip, limit)


# Se declara antes de /{pedido_id} para que "resumen" no se tome como id.
@router.get("/resumen", response_model=ResumenPedidos, dependencies=[Depends(require_admin)])
def resumen_pedidos(service: PedidoService = Depends(get_pedido_service)):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    assert usuario.id is not None
    try:
        return service.obtener(pedido_id, usuario.id, _es_admin(usuario))
    except (PedidoNoEncontrado, PedidoAjeno) as exc:
        raise _http_error(exc)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=[Depends(require_admin)])
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
):
    """RN-02 / RN-03: avanza o cancela según la máquina de estados."""
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ERRORES_DOMINIO as exc:
        raise _http_error(exc)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    """RN-03 / RN-04: el dueño cancela su pedido en PENDIENTE y se restituye el stock."""
    assert usuario.id is not None
    try:
        return service.cancelar(pedido_id, usuario.id)
    except ERRORES_DOMINIO as exc:
        raise _http_error(exc)
