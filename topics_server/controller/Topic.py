from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Importando dependencias locais
from service.GitHub import GitHub as githubService

from schemas.Mining import MiningReposRequest

"""from schemas.Environment import (
    EnvironmentResponse,
    EnvironmentRequest,
    EnvironmentResponseFiltered,
)
from validations.Auth import Auth as authValidator
from utils.Error import error"""


router_mining = APIRouter(prefix="/environment", tags=["Environment"])

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
async def buscando_issues_Repos(repos: MiningReposRequest):
    # Obtendo issues de vários repositórios
    array_repos_issues = await obtemRepos(repos)

    # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
    modelagem_topicos = await obtem_topicos(array_repos_issues)

    if modelagem_topicos is False:
        return {"erro": "Não há issues suficientes para gerar o modelo"}

    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


@router_mining.post("/api/buscaRepos/bert")
async def buscando_issues_Repos_Bertopic(repos: MiningReposRequest):
    # Obtendo issues de vários repositórios
    """repos = await request.json()
    repos = repos["repos"]"""
    array_repos_issues = await obtemRepos(repos)

    # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
    modelagem_topicos = await obtem_topicos_bertopic(array_repos_issues)

    if modelagem_topicos is False:
        return {"erro": "Não há issues suficientes para gerar o modelo"}

    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


@router_mining.patch("/api/geraTopicos/bert")
@router_mining.get("/api/buscaAndroid/t2v")
async def busca_android_top2vec():
    # Obtendo issues de vários repositórios
    df = android_base()

    modelagem_topicos = await obtem_topicos_pd(df)
    if modelagem_topicos is False:
        return JSONResponse(
            content={"erro": "Não há issues suficientes para gerar o modelo"},
            status_code=400,
        )

    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


@router_mining.get("/api/buscaPython/t2v")
async def busca_python_top2vec():
    # Obtendo issues de vários repositórios
    df = python_base()

    modelagem_topicos = await obtem_topicos_pd(df)
    if modelagem_topicos is False:
        return JSONResponse(
            content={"erro": "Não há issues suficientes para gerar o modelo"},
            status_code=400,
        )

    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }
