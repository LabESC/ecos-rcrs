from fastapi import Request


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

        # !! Validar token do usuário existente - IMPLEMENTAR

        return True
