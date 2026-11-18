from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import DUMMY_HASH, create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ROL_REGISTRO = "user"


# ---------- Excepciones de dominio ----------


class UsuarioDuplicado(Exception):
    pass


class CredencialesInvalidas(Exception):
    def __init__(self) -> None:
        super().__init__("Usuario o contraseña incorrectos")


class UsuarioDesactivado(Exception):
    def __init__(self) -> None:
        super().__init__(CUENTA_DESACTIVADA)


# ---------- Servicio ----------


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        """Registro público: siempre crea usuarios con rol ``user``."""
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise UsuarioDuplicado(f"El username '{data.username}' ya está registrado")
            if uow.usuarios.get_by_email(data.email) is not None:
                raise UsuarioDuplicado(f"El email '{data.email}' ya está registrado")
            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=data.email,
                    hashed_password=hash_password(data.password),
                    role=ROL_REGISTRO,
                )
            )
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None:
                verify_password(password, DUMMY_HASH)
                raise CredencialesInvalidas()
            if not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise UsuarioDesactivado()
            return create_access_token(usuario.username)
