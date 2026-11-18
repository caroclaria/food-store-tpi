from sqlmodel import SQLModel

# Los schemas del usuario viven en el módulo usuarios; auth los reutiliza.
from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["MensajeResponse", "UserCreate", "UserPublic"]


class MensajeResponse(SQLModel):
    message: str
