from typing import Annotated

from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import SQLModel

from app.core.tipos import FechaUTC

UsernameStr = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$"),
]
FullNameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
# bcrypt usa como máximo 72 bytes.
PasswordStr = Annotated[str, StringConstraints(min_length=8, max_length=72)]


class UserCreate(SQLModel):
    """Cuerpo de POST /auth/register."""

    username: UsernameStr
    full_name: FullNameStr
    email: EmailStr
    password: PasswordStr

    @field_validator("email")
    @classmethod
    def email_en_minusculas(cls, value: str) -> str:
        return value.strip().lower()


class UserPublic(SQLModel):
    """Datos públicos del usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: FechaUTC
