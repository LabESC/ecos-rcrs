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
    EnvironmentVotingUsers,
)
from service.Environment import Environment as environmentService
from service.APIRequests import APIRequests
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
    # ! Obtendo login de serviço e validando permissão
    user = authValidator.validate_service(request)

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
        )

    # ! Obtendo todos os ambientes
    environments = await environmentService.get_all()

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
async def get_by_id(id: str, request: Request):
    # ! Obtendo usuário logado e validando permissão
    validate = await authValidator.validate_user(request)

    # ! Validando retorno
    if not validate:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo usuário votante por id
    user = await environmentService.get_by_id(id)

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


@router_environment.get("/user/{user_id}", response_model=list[EnvironmentResponse])
async def get_by_user_id(user_id: str, request: Request):
    # ! Obtendo usuário logado e validando permissão
    validate = await authValidator.validate_user(request)

    # ! Validando retorno
    if not validate:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo usuário por id
    environment = await environmentService.get_by_user_id(user_id)

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
async def create(environment: EnvironmentRequest, request: Request):
    # ! Verificando autenticação
    auth = await authValidator.validate_user(request)
    if not auth:
        return JSONResponse(
            error(
                "auth",
                "Authentication failed!",
            ),
            status_code=401,
        )

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

    # !! Solicitando mineração do ambiente para o Microsserviço de API
    await APIRequests.request_mining(environment.id, environment.repos)

    # ! Retornando usuário
    return environment


@router_environment.put("/{id}/status/{status}")
async def update_status(id: str, status: str, request: Request):
    # . Variável de controle de acesso
    grant_access = False

    # ! Validando credenciais de serviço
    if authValidator.validate_service(request):
        grant_access = True

    # ! Validando credenciais de usuário
    if await authValidator.validate_user(request):
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
    environment = await environmentService.update_status(id, status)

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


@router_environment.post("/{id}/miningdata")
async def update_mining_data(
    id: str, body: EnvironmentUpdateMiningDataRequest, request: Request
):
    # ! Validando credenciais de serviço
    if not authValidator.validate_service(request):
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
    environment = await environmentService.update_mining(
        id, body.mining_data.model_dump(), body.status
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
    if not authValidator.validate_service(request):
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
    environment = await environmentService.update_topics(
        id, body.topic_data.model_dump()
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
    return environment


@router_environment.post("/{id}/prioritydata")
async def update_priority_data(
    id: str, body: EnvironmentUpdatePriorityDataRequest, request: Request
):
    # . Variável de controle de acesso
    grant_access = False

    # ! Validando credenciais de serviço
    if authValidator.validate_service(request):
        grant_access = True

    # ! Validando credenciais de usuário
    if await authValidator.validate_user(request):
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
    environment = await environmentService.update_priority(id, body.priority_data)

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
    if authValidator.validate_service(request):
        grant_access = True

    # ! Validando credenciais de usuário
    if await authValidator.validate_user(request):
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
    environment = await environmentService.update_final_rcr(id, body.final_rcr)

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
    if not await authValidator.validate_user(request):
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
    environment = await environmentService.get_mining_data(id)

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
    if not await authValidator.validate_user(request):
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
    environment = await environmentService.get_topic_data(id)

    # ! Validando retorno
    if not environment:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Environment not found or no Data found!",
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
    if not await authValidator.validate_user(request):
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
    environment = await environmentService.get_priority_data(id)

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
    if not await authValidator.validate_user(request):
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
    environment = await environmentService.get_final_rcr(id)

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


# ! Obtendo usuários votantes de um ambiente
@router_environment.get("/{id}/votingusers")
async def get_voting_users_by_environment_id(id: str, request: Request):
    # ! Validando credenciais de usuário
    if not await authValidator.validate_user(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Obtendo usuários por id do environment
    users = await environmentService.get_voting_users(id)

    # ! Validando retorno
    if not users:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    "user",
                    msg_404,
                )
            ],
            status_code=404,
        )

    if users == -1:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuário
    return users


# ! Verificando se há dados de mineração
@router_environment.get("/{id}/hasminingdata")
async def has_mining_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if not await authValidator.validate_user(request):
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
    has_mining_data = await environmentService.has_mining_data(id)

    if has_mining_data == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando a variável
    return has_mining_data if has_mining_data else False


# ! Verificando se há dados de topicos
@router_environment.get("/{id}/hastopicdata")
async def has_topic_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if not await authValidator.validate_user(request):
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
    has_topic_data = await environmentService.has_topic_data(id)

    if has_topic_data == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando a variável
    return has_topic_data if has_topic_data else False


# ! Verificando se há dados de prioridades
@router_environment.get("/{id}/hasprioritydata")
async def has_priority_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if not await authValidator.validate_user(request):
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
    has_priority_data = await environmentService.has_priority_data(id)

    if has_priority_data == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando a variável
    return has_priority_data if has_priority_data else False


# ! Verificando se há dados de RCR final
@router_environment.get("/{id}/hasfinaldata")
async def has_final_data(id: str, request: Request):
    # ! Validando credenciais de usuário
    if not await authValidator.validate_user(request):
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
    has_final_data = await environmentService.has_final_rcr(id)

    if has_final_data == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando a variável
    return has_final_data if has_final_data else False


# ! Solicitar nova mineração
@router_environment.post("/{id}/requestmining")
async def request_mining(id: str, request: Request):
    # ! Validando credenciais de usuário
    if not await authValidator.validate_user(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Solicitando mineração do ambiente novamente
    await environmentService.request_mining(id)

    # ! Retornando a variável
    return True


# ! Solicitar geração de tópicos
@router_environment.post("/{id}/requesttopics")
async def request_mining(id: str, request: Request):
    # ! Validando credenciais de usuário
    if not await authValidator.validate_user(request):
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Service or user authentication failed!",
                )
            ],
            status_code=401,
        )

    # ! Solicitando geração de topicos do ambiente
    await environmentService.request_topics(id)

    # ! Retornando a variável
    return True
