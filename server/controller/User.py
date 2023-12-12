from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Importando dependencias locais
from schemas.User import UserResponse
from service.User import User as userService
from validations.Auth import Auth as authValidator
from utils.Error import error


router_user = APIRouter(prefix="/user", tags=["User"])

msg_404 = {"en-US": "User not found!", "pt-BR": "Usuário não encontrado!"}


@router_user.get("/", response_model=list[UserResponse])
async def get_all(request: Request):
    # ! Verificando autenticação
    auth = authValidator().validate(request)
    if auth is False:
        return JSONResponse(
            [
                error(
                    "auth",
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo todos os usuários
    users = await userService().get_all()

    # ! Validando retorno
    if not users:  # * Se não houver usuários (None)
        return JSONResponse(
            [
                error(
                    "user",
                    "Users not found!",
                )
            ],
            status_code=404,
        )

    if users == -1:  # * Se ocorrer erro na obtenção
        return JSONResponse(
            [
                error(
                    "user",
                    "Internal server error!",
                )
            ],
            status_code=500,
        )

    # ! Retornando usuários
    return users
