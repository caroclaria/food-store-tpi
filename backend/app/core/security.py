"""Hash de contraseñas con bcrypt y emisión / validación del JWT."""

from datetime import timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.database import utcnow

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(password, hashed_password)
    except ValueError:
        return False


# Se verifica contra este hash cuando el usuario no existe, para que el tiempo
# de respuesta no revele qué usernames están registrados.
DUMMY_HASH = hash_password("dummy-password-tiempo-constante")


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    """JWT firmado con el username en el claim ``sub``."""
    minutos = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    ahora = utcnow()
    payload = {"sub": subject, "iat": ahora, "exp": ahora + timedelta(minutes=minutos)}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """Devuelve el username del token, o None si la firma es inválida o venció."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None
