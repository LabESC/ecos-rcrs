from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Importando dependencias locais
from schemas.Environment import (
    EnvironmentResponse,
    EnvironmentRequest,
    EnvironmentResponseFiltered,
)
from service.Environment import Environment as environmentService
from validations.Auth import Auth as authValidator
from utils.Error import error


router_environment = APIRouter(prefix="/environment", tags=["Environment"])

# Variáveis globais
entity_name = "environment"
msg_404 = {
    "en-US": f"{entity_name} not found!",
    "pt-BR": "Ambiente não encontrado!",
}
msg_500 = {"en-US": "Internal server error!", "pt-BR": "Erro interno do servidor!"}
msg_email_not_sent = {"en-US": "E-mail not sent!", "pt-BR": "E-mail não enviado!"}
msg_wrong_mining_type = {
    "en-US": "Invalid entry: if mining_type is organization, the name of the organization needs to be informed!",
    "pt-BR": "Entrada inválida: Se o tipo da mineração é organização, o nome desta deve ser informado!",
}
msg_user_not_found = {
    "en-US": "User not found!",
    "pt-BR": "Usuário não encontrado!",
}
msg_user_not_active = {
    "en-US": "User not active!",
    "pt-BR": "Usuário não está ativo!",
}


# Rotas
@router_environment.get("/", response_model=list[EnvironmentResponse])
async def get_all(request: Request):
    """# ! Obtendo usuário logado e validando permissão
    user = await authValidator().validate(request)

    # ! Validando retorno
    if not user:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )"""

    # ! Obtendo todos os ambientes
    environments = await environmentService().get_all()

    # ! Validando retorno
    if not environments:  # * Se não houver usuários (None)
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environments not found!",
                )
            ],
            status_code=404,
        )

    if environments == -1:  # * Se ocorrer erro na obtenção
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuários
    return environments


@router_environment.get("/{id}", response_model=EnvironmentResponse)
async def get_by_id(id: str):
    """# ! Obtendo usuário logado e validando permissão
    user = await authValidator().validate(request)

    # ! Validando retorno
    if not user:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )"""

    # ! Obtendo usuário votante por id
    user = await environmentService().get_by_id(id)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_404,
                )
            ],
            status_code=404,
        )

    if user == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuário
    return user


@router_environment.get(
    "/user/{user_id}", response_model=list[EnvironmentResponseFiltered]
)
async def get_by_user_id(user_id: str):
    # ! Obtendo usuário por id
    environment = await environmentService().get_by_user_id(user_id)

    # ! Validando retorno
    if not environment:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_404,
                )
            ],
            status_code=404,
        )

    if environment == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuário
    return environment


@router_environment.post("/", response_model=EnvironmentResponse)
async def create(environment: EnvironmentRequest):
    # ! Criando ambiente
    environment = await environmentService().create(environment)

    # ! Validando retorno
    if not environment:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not created!",
                )
            ],
            status_code=404,
        )

    if environment == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )
    if environment == -2:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_user_not_found["en-US"],
                )
            ],
            status_code=422,
        )

    if environment == -3:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_user_not_active["en-US"],
                )
            ],
            status_code=422,
        )
    if environment == -4:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_wrong_mining_type["en-US"],
                )
            ],
            status_code=422,
        )

    # ! Retornando usuário
    return environment
