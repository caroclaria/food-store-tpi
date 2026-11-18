"""Configuración de la aplicación leída del archivo .env con pydantic-settings."""

from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

API_PREFIX = "/api/v1"
COOKIE_NAME = "access_token"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # Origen del frontend permitido en CORS (se aceptan varios separados por coma).
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    # true solo en producción con HTTPS.
    COOKIE_SECURE: bool = False
    SQL_ECHO: bool = False

    @property
    def frontend_origins(self) -> List[str]:
        return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]


settings = Settings()  # type: ignore[call-arg]
