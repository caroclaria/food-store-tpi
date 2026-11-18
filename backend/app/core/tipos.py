"""Tipos reutilizados por los schemas de salida."""

from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator


def _asegurar_utc(valor: datetime) -> datetime:
    # SQLite devuelve las fechas sin zona horaria: se interpretan como UTC para
    # que el frontend las convierta bien a la hora local.
    return valor.replace(tzinfo=timezone.utc) if valor.tzinfo is None else valor


FechaUTC = Annotated[datetime, AfterValidator(_asegurar_utc)]
