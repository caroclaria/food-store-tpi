# Food Store · Trabajo Práctico Integrador (Programación 4)

Aplicación web para un negocio de comidas: los clientes recorren el catálogo, arman un carrito y
confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Repositorio:**  `https://github.com/caroclaria/food-store-tpi`
- **Video de demostración:**  `https://youtu.be/KkgJ7LfpwpU`

| Carpeta | Contenido |
|---|---|
| [`backend/`](backend/) | API REST con FastAPI + SQLModel, arquitectura en capas con Unit of Work, JWT en cookie HttpOnly. |
| [`frontend/`](frontend/) | React + TypeScript + Vite + Tailwind CSS, TanStack Query/Form/Table, Zustand, Axios. |

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14) |
| PostgreSQL | 15 o superior (para desarrollo se acepta SQLite, ver más abajo) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## 1. Backend

Desde la carpeta `backend/`:

```bash
# 1. Entorno virtual
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux / macOS:
source .venv/bin/activate

# 2. Dependencias (versiones fijadas)
pip install -r requirements.txt

# 3. Variables de entorno
cp .env.example .env        # en Windows (cmd): copy .env.example .env
```

Crear la base de datos vacía en PostgreSQL (las tablas las crea la aplicación):

```sql
CREATE DATABASE foodstore_db;
```

y ajustar `DATABASE_URL` en `.env` con tu usuario y contraseña. Para probar sin PostgreSQL,
reemplazarla por `DATABASE_URL=sqlite:///./foodstore.db`.

```bash
# 4. Datos iniciales (idempotente: se puede ejecutar varias veces)
python -m app.db.seed

# 5. Servidor
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs y http://localhost:8000/redoc

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

## 2. Frontend

Desde la carpeta `frontend/`, con el backend corriendo:

```bash
cp .env.example .env        # en Windows (cmd): copy .env.example .env
pnpm install
pnpm build                  # verifica los tipos y compila
pnpm dev
```

Abrir http://localhost:5173.

### Variables de entorno del frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> Usar `localhost` (no `127.0.0.1`) tanto en `VITE_API_URL` como al abrir el frontend: si los
> hosts no coinciden, el navegador no envía la cookie de sesión.

## Usuarios del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user |

El seed también carga 4 categorías y 12 productos con stock. Desde `/register` se pueden crear
más clientes.

## Funcionalidades

**Cliente:** catálogo paginado en el servidor con búsqueda, filtro por categoría, skeleton y
estado vacío; carrito persistido en el navegador; checkout con dirección, forma de pago
(efectivo o transferencia) y notas; «Mis pedidos» con detalle y cancelación en `PENDIENTE`.

**Administrador:** resumen con indicadores; ABM de categorías y productos (incluido stock y
disponibilidad); gestión de pedidos según la máquina de estados; activación y desactivación de
usuarios.

**Reglas de negocio:** el pedido se crea en una sola transacción (si un ítem falla no se guarda
nada ni se descuenta stock); los precios y nombres se copian en cada línea y no cambian después;
cancelar un pedido restituye el stock en la misma transacción; transiciones
`PENDIENTE → EN_PREPARACION → ENTREGADO` y cancelación desde los estados no terminales.

## Arquitectura

**Backend** (`backend/app/`): `core/` (configuración, base de datos, seguridad, dependencias de
sesión y rol, `UnitOfWork` y `BaseRepository[T]`) y un paquete por dominio en `modules/`
(`auth`, `usuarios`, `categorias`, `productos`, `pedidos`) con la cadena
Router → Service → Unit of Work → Repository → Model. Los Services abren
`with self.uow as uow:` y el commit o rollback ocurre en `__exit__` del Unit of Work.

**Frontend** (`frontend/src/`): `features/` por dominio (pages, components, hooks, api, types),
`shared/` (Axios con `withCredentials` e interceptor de 401, TanStack Query, UI base, layout),
`store/` (`authStore` y `cartStore` con Zustand + `persist`) y `routes/` (`AppRouter` y
`ProtectedRoute` por rol). La sesión viaja en la cookie HttpOnly `access_token`: el frontend
nunca lee ni guarda el token.
