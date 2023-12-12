from repository.User import User as userRepository

from database.db import conn


class User:
    # Retorna todos os totens
    async def get_all(self):
        try:
            db = next(conn())
            usuarios = userRepository().get_all(db)
            return usuarios if usuarios else None
        except Exception as e:
            print(e)
            return -1
