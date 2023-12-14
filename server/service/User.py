import uuid
import bcrypt
from repository.User import User as UserRepository

from database.db import conn
from schemas.User import UserRequest, UserResponse, AuthRequest, AuthResponse


class User:
    # ! Retorna todos os usuários
    async def get_all(self):
        try:
            db = next(conn())
            usuarios = UserRepository.get_all(db)
            return usuarios if usuarios else None
        except Exception as e:
            print(e)
            return -1

    # ! Retorna um usuário pelo e-mail
    async def get_by_id(self, id: str):
        try:
            db = next(conn())
            usuario = UserRepository.get_by_id(db, id)
            return usuario
        except Exception as e:
            print(e)
            return -1

    # ! Cria um usuário
    async def create(self, user: UserRequest) -> UserRequest:
        # * Gerando uuid como id do user e hasheando a senha
        user_id = str(uuid.uuid4())
        password_hash = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

        try:
            db = next(conn())
            usuario = UserRepository.create(db, user, user_id, password_hash)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1

    # ! Autentica um usuário
    async def authenticate(self, user_auth_request: AuthRequest) -> AuthResponse:
        try:
            db = next(conn())
            user_auth_request = UserRepository.authenticate(
                db, user_auth_request.email, user_auth_request.password
            )
            return (
                AuthResponse(id=user_auth_request.id, token=user_auth_request.token)
                if user_auth_request
                else user_auth_request
            )
        except Exception as e:
            print(e)
            return -1

    async def inactivate(self, id: str):
        try:
            db = next(conn())
            usuario = UserRepository.inactivate(db, id)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1

    async def activate(self, id: str):
        try:
            db = next(conn())
            usuario = UserRepository.activate(db, id)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1
