from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# ! Importando dependencias locais
from schemas.User import (
    UserResponse,
    UserRequest,
    AuthRequest,
    AuthResponse,
    PasswordRequest,
)
from service.User import User as userService
from validations.Auth import Auth as authValidator
from utils.Error import error


router_user = APIRouter(prefix="/api/user", tags=["User"])

msg_404 = {"en-US": "User not found!", "pt-BR": "Usuário não encontrado!"}
msg_500 = {"en-US": "Internal server error!", "pt-BR": "Erro interno do servidor!"}
msg_exists = {
    "en-US": "User already exists!",
    "pt-BR": "Usuário já existe!",
}


@router_user.get("/", response_model=list[UserResponse])
async def get_all(request: Request):
    # ! Verificando autenticação
    auth = authValidator.validate_service(request)
    if not auth:
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
    users = await userService.get_all()

    # ! Validando retorno
    if not users:  # * Se não houver usuários (None)
        return JSONResponse(
            error(
                "user",
                "Users not found!",
            ),
            status_code=404,
        )

    if users == -1:  # * Se ocorrer erro na obtenção
        return JSONResponse(
            error(
                "user",
                msg_500["en-US"],
            ),
            status_code=500,
        )

    # ! Retornando usuários
    return users


@router_user.get("/{id}", response_model=UserResponse)
async def get_by_id(id: str, request: Request):
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

    # ! Obtendo usuário por id
    user = await userService.get_by_id(id)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            error("user", msg_404["en-US"]),
            status_code=404,
        )

    if user == -1:
        return JSONResponse(
            error(
                "user",
                msg_500["en-US"],
            ),
            status_code=500,
        )

    # ! Retornando usuário
    return user


@router_user.post("/", response_model=UserResponse)
async def create(user: UserRequest):
    # ! Criando usuário
    user = await userService.create(user)

    # ! Validando retorno
    match user:
        case None:  # * Se não houver usuário (None)
            return JSONResponse(
                error(
                    "user",
                    "User not created!",
                ),
                status_code=404,
            )
        case -1:
            return JSONResponse(
                error(
                    "user",
                    msg_500["en-US"],
                ),
                status_code=500,
            )
        case -2:
            return JSONResponse(
                error(
                    "user",
                    "Invalid e-mail!",
                ),
                status_code=422,
            )
        case -3:
            return JSONResponse(
                error(
                    "user",
                    msg_exists["en-US"],
                ),
                status_code=409,
            )

    # ! Retornando usuário
    return user


@router_user.post("/{id}/activate")
async def activate(id: str):
    # ! Ativando usuário
    user = await userService.activate(id)

    # ! Validando retorno
    if user is False:  # * Se não houver usuário (None)
        return JSONResponse(
            error("user", msg_404["en-US"]),
            status_code=404,
        )

    if user is None:
        return JSONResponse(
            error(
                "user",
                "User already active!",
            ),
            status_code=400,
        )

    if user == -1:
        return JSONResponse(
            error(
                "user",
                msg_500["en-US"],
            ),
            status_code=500,
        )


@router_user.post("/login", response_model=AuthResponse)
async def authenticate(user_request_auth: AuthRequest):
    # ! Autenticando usuário
    user_auth = await userService.authenticate(user_request_auth)

    # ! Validando retorno
    if user_auth is None:  # * Se não houver usuário (None)
        return JSONResponse(
            error(
                "password",
                "Wrong password!",
            ),
            status_code=401,
        )

    if user_auth is False:
        return JSONResponse(
            error(
                "user",
                "User not found!",
            ),
            status_code=404,
        )

    if user_auth == -1:
        return JSONResponse(
            error(
                "user",
                msg_500["en-US"],
            ),
            status_code=500,
        )

    # ! Retornando usuário
    return user_auth


@router_user.delete("/{id}")
async def inactivate(id: str, request: Request):
    # ! Verificando autenticação
    auth = await authValidator.validate_user(request)
    if auth is False:
        return JSONResponse(
            error(
                "auth",
                "Authentication failed!",
            ),
            status_code=401,
        )

    # ! Inativando usuário
    user = await userService.inactivate(id)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            error("user", msg_404["en-US"]),
            status_code=404,
        )

    if user == -1:
        return JSONResponse(
            error(
                "user",
                "Internal server error!",
            ),
            status_code=500,
        )


@router_user.put("/{id}", response_model=UserResponse)
async def update(id: str, user: UserRequest, request: Request):
    # ! Verificando autenticação
    auth = await authValidator.validate_user(request)
    if auth is False:
        return JSONResponse(
            error(
                "auth",
                "Authentication failed!",
            ),
            status_code=401,
        )

    # ! Atualizando usuário
    user = await userService.update(user, id)

    # ! Validando retorno
    match user:
        case None:
            return JSONResponse(
                error("user", msg_404["en-US"]),
                status_code=404,
            )

        case -1:
            return JSONResponse(
                error(
                    "user",
                    msg_500["en-US"],
                ),
                status_code=500,
            )

        case -2:
            return JSONResponse(
                error(
                    "user",
                    "Invalid e-mail!",
                ),
                status_code=422,
            )

        case -3:
            return JSONResponse(
                error(
                    "user",
                    msg_exists["en-US"],
                ),
                status_code=409,
            )

    # ! Retornando usuário
    return user


# ! Gerando token ára alterar senha
@router_user.post("/{email}/forgot-password/token")
async def forgot_password(email: str):
    # ! Gerando token
    token = await userService.get_token_for_password(email)

    # ! Validando retorno
    if not token:
        return JSONResponse(
            error(
                "user",
                msg_404["en-US"],
            ),
            status_code=404,
        )

    if token == -1:
        return JSONResponse(
            error(
                "user",
                msg_500["en-US"],
            ),
            status_code=500,
        )


# ! Validando token para alterar senha
@router_user.get("/{email}/validate-password-token/{token}")
async def validate_password_token(email: str, token: str):
    # ! Validando token
    token = await userService.validate_token_by_email(email, token)

    # ! Validando retorno
    match token:
        case False:
            return JSONResponse(
                error(
                    "token",
                    "Token invalid!",
                ),
                status_code=401,
            )

        case -1:
            return JSONResponse(
                error(
                    "user",
                    msg_500["en-US"],
                ),
                status_code=500,
            )


# ! Alterando senha
@router_user.put("/{email}/update-password")
async def update_password(email: str, body: PasswordRequest):
    # ! Alterando senha
    user = await userService.update_password(email, body.password, body.token)

    # ! Validando retorno
    match user:
        case False:
            return JSONResponse(
                error(
                    "token",
                    "Token invalid!",
                ),
                status_code=401,
            )

        case None:
            return JSONResponse(
                error("user", msg_404["en-US"]),
                status_code=404,
            )

        case -1:
            return JSONResponse(
                error(
                    "user",
                    msg_500["en-US"],
                ),
                status_code=500,
            )
