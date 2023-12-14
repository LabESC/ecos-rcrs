import uuid
from repository.User import User as userRepository

from database.db import conn
from schemas.User import UserRequest, UserResponse


class User:
    # ! Retorna todos os usuários
    async def get_all(self):
        try:
            db = next(conn())
            usuarios = userRepository().get_all(db)
            return usuarios if usuarios else None
        except Exception as e:
            print(e)
            return -1

    # ! Retorna um usuário pelo e-mail
    async def get_by_id(self, id: str):
        try:
            db = next(conn())
            usuario = userRepository().get_by_id(db, id)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1

    # ! Cria um usuário
    async def create(self, user: UserRequest) -> UserRequest:
        # Gerando uuid como id do user
        user_id = str(uuid.uuid4())

        try:
            db = next(conn())
            usuario = userRepository().create(db, user, user_id)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1
