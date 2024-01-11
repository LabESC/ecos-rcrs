from fastapi import APIRouter
from fastapi.responses import JSONResponse
import asyncio

# Importando dependencias locais
from service.Auth import Auth as authValidator
from service.GitHubRequests import GitHubRequests
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
githubRequests = GitHubRequests()


# Rotas
@router_mining.post("/api/minerepos")
async def searching_repos_issues(request: MiningReposRequest):
    # * Validando usuário e senha
    if authValidator.validate_user(request.user, request.password) is False:
        return JSONResponse(
            {"code": "auth", "message": "Authentication failed!"},
            status_code=401,
        )

    # * Verificando se há uma mineração em andamento
    if await githubRequests.is_running():
        # * Se tiver, adicione a requisição na fila
        asyncio.create_task(
            githubRequests.add_to_queue(request.repos, request.environment_id)
        )
        return JSONResponse(
            {"code": "another_mining_in_progress", "message": "Mining added to queue!"},
            status_code=201,
        )

    # * Se não tiver, execute a mineração
    await githubRequests.run(request.repos, request.environment_id)

    return {"code": "mining_in_progress", "message": "Mining in progress!"}
