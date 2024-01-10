from fastapi import Request
from repository.User import User as UserRepository
from utils.Credentials import Credentials as credentials


class Auth:
    # ! Validar se o usuário possui permissão para acessar o recurso
    def validate(self, request: Request):
        # * Obtendo header
        header = request.headers

        # * Validar se o header existe
        if header is None:
            return False

        # * Validar se o header possui os campos necessários
        if not (
            header.get("user-id")
            and header.get("user-token")
            and header.get("user-language")
        ):
            return False

        # * Validar token do usuário existente
        validate_token = UserRepository.validate_token(
            header.get("user-id"), header.get("user-token")
        )

        if not validate_token:
            return False

        return True

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
