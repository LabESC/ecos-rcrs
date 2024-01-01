from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Importando dependencias locais
from service.GitHub import GitHub as githubService
from service.Auth import Auth as authValidator

from schemas.Mining import MiningReposRequest

router_mining = APIRouter(prefix="/mining", tags=["Mining"])

# Variáveis globais
entity_name = "mining"
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
@router_mining.post("/api/buscaRepos")
async def searching_repos_issues(request: MiningReposRequest):
    # * Validando usuário e senha
    if authValidator.validate_user(request.user, request.pwd):
        return JSONResponse(
            {"code": "auth", "message": "Authentication failed!"},
            status_code=401,
        )
    # * Obtendo issues de vários repositórios
    mining_issues = await githubService.obtem_repos(request.repos)

    # ! Enviar dados para o microsserviço do BD (salvar dados) (A IMPLEMENTAR)
    # requests....

    return mining_issues
