from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])

solo_admin = [Depends(require_role(["admin"]))]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


def _not_found(exc: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Busca en el nombre, sin distinguir mayúsculas"),
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
    service: ProductoService = Depends(get_producto_service),
):
    """Público: solo productos activos, paginado."""
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc)


@router.post(
    "", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin
)
def crear_producto(data: ProductoCreate, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as exc:
        raise _not_found(exc)


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise _not_found(exc)


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin)
def eliminar_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
