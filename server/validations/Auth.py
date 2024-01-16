from fastapi import Request
from service.User import User as UserService
from utils.Credentials import Credentials as credentials


class Auth:
    @staticmethod
    # ! Validar se o usuário possui permissão para acessar o recurso
    async def validate_user(request: Request):
        # * Obtendo header
        header = request.headers

        # * Validar se o header existe
        if header is None:
            return False

        # * Validar se o header possui os campos necessários
        if not (
            header.get("user-id")
            and header.get("user-token")
            # and header.get("user-language")
        ):
            return False

        # * Validar token do usuário existente
        validate_token = await UserService.validate_token(
            header.get("user-id"), header.get("user-token")
        )

        return validate_token

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
