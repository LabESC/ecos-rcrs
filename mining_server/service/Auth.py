# ! Importando a senha e login salvos para autenticar o usuário do arquivo .env
from service.Credentials import Credentials as credentials
from fastapi import Request


class Auth:
    @staticmethod
    def validate_user(user: str, pwd: str):
        if user == credentials.get_user() and pwd == credentials.get_user_pwd():
            return True
        else:
            return False

    @staticmethod
    def validate_service(request: Request):
        # * Obtendo header
        header = request.headers

        # * Validar se o header existe
        if header is None:
            return None

        # * Validar se o header possui os campos necessários
        if not (header.get("service-login") and header.get("service-pwd")):
            return None

        login = header.get("service-login")
        pwd = header.get("service-pwd")

        if (
            login == credentials.get_service_login()
            and pwd == credentials.get_service_pwd()
        ):
            return True
        else:
            return False
