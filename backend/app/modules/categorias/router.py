from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])

solo_admin = [Depends(require_role(["admin"]))]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


def _http_error(exc: Exception) -> HTTPException:
    if isinstance(exc, CategoriaNoEncontrada):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    if isinstance(exc, NombreDuplicado):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    raise exc


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)):
    """Público: solo las categorías activas."""
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise _http_error(exc)


@router.post(
    "", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin
)
def crear_categoria(data: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise _http_error(exc)


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=solo_admin)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar(categoria_id, data)
    except (CategoriaNoEncontrada, NombreDuplicado) as exc:
        raise _http_error(exc)


@router.delete(
    "/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin
)
def eliminar_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise _http_error(exc)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
