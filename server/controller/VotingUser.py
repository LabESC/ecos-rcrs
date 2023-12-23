from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Importando dependencias locais
from schemas.User import UserResponse, UserRequest, AuthRequest, AuthResponse
from schemas.VotingUser import VotingUserRequest, VotingUserResponse
from service.VotingUser import VotingUser as votingUserService
from validations.Auth import Auth as authValidator
from utils.Error import error


router_voting_user = APIRouter(prefix="/votinguser", tags=["VotingUser"])

# Variáveis globais
entity_name = "votinguser"
msg_404 = {
    "en-US": "Voting user not found!",
    "pt-BR": "Usuário votante não encontrado!",
}
msg_500 = {"en-US": "Internal server error!", "pt-BR": "Erro interno do servidor!"}
msg_email_not_sent = {"en-US": "E-mail not sent!", "pt-BR": "E-mail não enviado!"}


# Rotas
@router_voting_user.get("/{id}", response_model=VotingUserResponse)
async def get_by_id(id: str):
    # ! Obtendo usuário votante por id
    user = await votingUserService().get_by_email(id)

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


@router_voting_user.get(
    "/environment/{environment_id}",  # response_model=VotingUserResponse
)
async def get_by_environment_id(environment_id: str):
    # ! Obtendo usuário por id
    user = await votingUserService().get_by_environment_id(environment_id)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    "user",
                    msg_404,
                )
            ],
            status_code=404,
        )

    if user == -1:
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
    return user


@router_voting_user.post("/", response_model=VotingUserResponse)
async def create(user: VotingUserRequest):
    # ! Criando usuário
    user = await votingUserService().create(user)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Voting user not created!",
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
    if user == -2:
        return JSONResponse(
            [
                error(
                    entity_name,
                    "Invalid e-mail!",
                )
            ],
            status_code=422,
        )

    # ! Retornando usuário
    return user


@router_voting_user.post("/{email}/generateAccessCode")
async def generate_access_code(email: str):
    # ! Criando usuário
    access_code = await votingUserService().generate_access_code(email)

    # ! Validando retorno
    if not access_code:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_404,
                )
            ],
            status_code=404,
        )

    if access_code == -1:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_500["en-US"],
                )
            ],
            status_code=500,
        )

    if access_code == -2:
        return JSONResponse(
            [
                error(
                    "access_code",
                    msg_email_not_sent["en-US"],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuário
    return access_code


@router_voting_user.get("/{email}/validateAccessCode/{access_code}")
async def validate_access_code(email: str, access_code: str):
    # ! Criando usuário
    validation = await votingUserService().validate_access_code(email, access_code)

    # ! Validando retorno
    if validation is None:
        return JSONResponse(
            [
                error(
                    entity_name,
                    msg_404,
                )
            ],
            status_code=404,
        )

    if validation is False:
        return JSONResponse(
            [
                error(
                    "access_code",
                    "Invalid access code!",
                )
            ],
            status_code=422,
        )

    if validation == -1:
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
    return validation
