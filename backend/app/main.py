from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import API_PREFIX, settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="TPI Programación 4: catálogo, carrito y pedidos con JWT en cookie HttpOnly.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: con allow_credentials=True los orígenes deben ser
# explícitos (no se puede usar "*").
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(router, prefix=API_PREFIX)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "docs": "/docs", "redoc": "/redoc"}
