# ! Importando a senha e login salvos para autenticar o usuário do arquivo .env
from service.Credentials import Credentials as credentials


class Auth:
    @staticmethod
    def validate_user(user: str, pwd: str):
        if user == credentials.get_user() and pwd == credentials.get_user_pwd():
            return True
        else:
            return False
