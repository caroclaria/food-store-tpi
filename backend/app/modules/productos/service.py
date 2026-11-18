from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada, obtener_activa
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

__all__ = ["CategoriaNoEncontrada", "ProductoNoEncontrado", "ProductoService"]


# ---------- Excepciones de dominio ----------


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        self.producto_id = producto_id
        super().__init__(f"Producto {producto_id} no encontrado")


def _obtener_activo(repo: ProductoRepository, producto_id: int) -> Producto:
    """Un producto dado de baja se trata como inexistente."""
    producto = repo.get_by_id(producto_id)
    if producto is None or not producto.activo:
        raise ProductoNoEncontrado(producto_id)
    return producto


# ---------- Servicio ----------


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(_obtener_activo(uow.productos, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            obtener_activa(uow.categorias, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = _obtener_activo(uow.productos, producto_id)
            cambios = data.model_dump(exclude_unset=True)
            # Los campos obligatorios no aceptan null en una actualización parcial.
            for campo in ("nombre", "precio_base", "stock", "disponible", "categoria_id"):
                if campo in cambios and cambios[campo] is None:
                    cambios.pop(campo)
            if "categoria_id" in cambios:
                obtener_activa(uow.categorias, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = _obtener_activo(uow.productos, producto_id)
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: los pedidos conservan la copia del nombre y del precio."""
        with self.uow as uow:
            producto = _obtener_activo(uow.productos, producto_id)
            producto.activo = False
            uow.productos.add(producto)
