from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Importando dependencias locais
from schemas.Environment import (
    EnvironmentResponse,
    EnvironmentRequest,
    EnvironmentResponseFiltered,
    EnvironmentUpdateMiningDataRequest,
    EnvironmentUpdateTopicDataRequest,
    EnvironmentUpdatePriorityDataRequest,
    EnvironmentUpdateFinalDataRequest,
)
from service.Environment import Environment as environmentService
from validations.Auth import Auth as authValidator
from utils.Error import error


router_environment = APIRouter(prefix="/api/environment", tags=["Environment"])

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


@router_environment.put("/{id}/status/{status}", response_model=EnvironmentResponse)
async def update_status(id: str, status: str, request: Request):
    # . Variável de controle de acesso
    grant_access = False

    # ! Validando credenciais de serviço
    if authValidator().validate_service(request):
        grant_access = True

    # ! Validando credenciais de usuário
    if authValidator().validate_user(request):
        grant_access = True

    # ! Se não teve acesso por nenhum dos dois, retorne erro
    if not grant_access:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Atualizando status do ambiente
    environment = await environmentService().update_status(id, status)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not updated!",
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

    # ! Retornando ambiente
    return environment


@router_environment.post("/{id}/miningdata")
async def update_mining_data(
    id: str, body: EnvironmentUpdateMiningDataRequest, request: Request
):
    # ! Validando credenciais de serviço
    if not authValidator().validate_service(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Atualizando status do ambiente
    environment = await environmentService().update_mining(
        id, body.mining_data.dict(), body.status
    )

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not updated!",
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

    # ! Retornando ambiente
    return True


@router_environment.post("/{id}/topicdata")
async def update_topic_data(
    id: str, body: EnvironmentUpdateTopicDataRequest, request: Request
):
    # ! Validando credenciais de serviço
    if not authValidator().validate_service(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Atualizando status do ambiente
    environment = await environmentService().update_topics(id, body.topic_data.dict())

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not updated!",
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

    # ! Retornando ambiente
    return environment


@router_environment.post("/{id}/prioritydata")
async def update_priority_data(
    id: str, body: EnvironmentUpdatePriorityDataRequest, request: Request
):
    # . Variável de controle de acesso
    grant_access = False

    # ! Validando credenciais de serviço
    if authValidator().validate_service(request):
        grant_access = True

    # ! Validando credenciais de usuário
    if authValidator().validate_user(request):
        grant_access = True

    # ! Se não teve acesso por nenhum dos dois, retorne erro
    if not grant_access:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Atualizando status do ambiente
    environment = await environmentService().update_priority(id, body.priority_data)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not updated!",
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

    # ! Retornando ambiente
    return environment


@router_environment.post("/{id}/finaldata")
async def update_final_data(
    id: str, body: EnvironmentUpdateFinalDataRequest, request: Request
):
    # . Variável de controle de acesso
    grant_access = False

    # ! Validando credenciais de serviço
    if authValidator().validate_service(request):
        grant_access = True

    # ! Validando credenciais de usuário
    if authValidator().validate_user(request):
        grant_access = True

    # ! Se não teve acesso por nenhum dos dois, retorne erro
    if not grant_access:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Atualizando status do ambiente
    environment = await environmentService().update_final_rcr(id, body.final_rcr)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not updated!",
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

    # ! Retornando ambiente
    return environment


@router_environment.get("/{id}/miningdata")  # , response_model=EnvironmentResponse)
async def get_mining_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if authValidator().validate_user(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo dados de mineração
    environment = await environmentService().get_mining_data(id)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not found!",
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

    # ! Retornando ambiente
    return environment


@router_environment.get("/{id}/topicdata")  # , response_model=EnvironmentResponse)
async def get_topic_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if authValidator().validate_user(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo dados de mineração
    environment = await environmentService().get_topic_data(id)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not found!",
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

    # ! Retornando ambiente
    return environment


@router_environment.get("/{id}/prioritydata")  # , response_model=EnvironmentResponse)
async def get_priority_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if authValidator().validate_user(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo dados de mineração
    environment = await environmentService().get_priority_data(id)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not found!",
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

    # ! Retornando ambiente
    return environment


@router_environment.get("/{id}/finaldata")  # , response_model=EnvironmentResponse)
async def get_final_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if authValidator().validate_user(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo dados de mineração
    environment = await environmentService().get_final_rcr(id)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not found!",
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

    # ! Retornando ambiente
    return environment
