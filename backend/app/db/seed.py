"""Carga inicial idempotente: se puede ejecutar varias veces sin duplicar datos.

Uso, desde la carpeta backend/ con el entorno virtual activo:

    python -m app.db.seed

Crea:
- el usuario admin (admin / Admin1234!, rol admin);
- un cliente de prueba (cliente / Cliente1234!, rol user);
- 4 categorías y 12 productos con stock.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    # (username, full_name, email, password, role)
    ("admin", "Administrador Food Store", "admin@foodstore.com", "Admin1234!", "admin"),
    ("cliente", "Cliente de Prueba", "cliente@foodstore.com", "Cliente1234!", "user"),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra con masa de fermentación lenta"),
    ("Hamburguesas", "Hamburguesas caseras con pan de papa"),
    ("Bebidas", "Gaseosas, aguas y limonadas"),
    ("Postres", "Dulces caseros para cerrar la comida"),
]


def _img(photo_id: str) -> str:
    return f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=600&q=70"


# (nombre, descripción, precio, stock, categoría, imagen)
PRODUCTOS = [
    ("Pizza Muzzarella", "Salsa de tomate, muzzarella y orégano", 9500, 20, "Pizzas",
     _img("photo-1513104890138-7c749659a591")),
    ("Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 10800, 15, "Pizzas",
     _img("photo-1565299624946-b28f40a0ae38")),
    ("Pizza Fugazzeta", "Rellena de muzzarella con cebolla", 11200, 10, "Pizzas", None),
    ("Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8200, 25, "Hamburguesas",
     _img("photo-1568901346375-23c9450c58cd")),
    ("Hamburguesa Bacon Doble", "Doble carne, panceta y cheddar", 11500, 12, "Hamburguesas",
     _img("photo-1550547660-d9450f859349")),
    ("Hamburguesa Veggie", "Medallón de lentejas, rúcula y tomate", 8900, 8, "Hamburguesas", None),
    ("Gaseosa 1.5L", "Línea cola, lima-limón o naranja", 2800, 40, "Bebidas", None),
    ("Agua mineral 500ml", "Con o sin gas", 1200, 50, "Bebidas", None),
    ("Limonada con menta", "Jarra de 1L, natural", 3900, 18, "Bebidas", None),
    ("Flan casero", "Con dulce de leche y crema", 3500, 14, "Postres", None),
    ("Brownie tibio", "Con una bocha de helado de crema", 4200, 10, "Postres",
     _img("photo-1606313564200-e75d5e30476c")),
    ("Cheesecake de frutos rojos", "Porción individual", 4800, 6, "Postres", None),
]


def _seed_usuarios(session: Session) -> None:
    for username, full_name, email, password, role in USUARIOS:
        existe = session.exec(select(Usuario).where(Usuario.username == username)).first()
        if existe is None:
            session.add(
                Usuario(
                    username=username,
                    full_name=full_name,
                    email=email,
                    hashed_password=hash_password(password),
                    role=role,
                )
            )
            print(f"  + usuario {username} ({role})")


def _seed_catalogo(session: Session) -> None:
    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
            print(f"  + categoría {nombre}")
        categorias[nombre] = categoria

    for nombre, descripcion, precio, stock, categoria_nombre, imagen in PRODUCTOS:
        existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
        if existe is None:
            categoria_id = categorias[categoria_nombre].id
            assert categoria_id is not None
            session.add(
                Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                    imagen_url=imagen,
                    categoria_id=categoria_id,
                )
            )
            print(f"  + producto {nombre}")


def run() -> None:
    create_all_tables()
    with session_factory() as session:
        _seed_usuarios(session)
        _seed_catalogo(session)
        session.commit()
    print("Seed completo.")


if __name__ == "__main__":
    run()
