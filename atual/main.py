# Removendo mensagens de warning do Numba.jit (nopython):
import warnings

warnings.filterwarnings("ignore", message=".*The 'nopython' keyword.*")

# Importando as bibliotecas

# Importando a FastAPI (abertura do server)
from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from starlette.staticfiles import StaticFiles

# Importando funções/variáveis dos arquivos
from atual.components.github import (
    obtem2ReposTag,
    obtem2Repos,
    obtemOrganizacao,
    obtemRepos,
    obtemReposOrg,
    obtemReposSemLimpeza,
    obtemReposTag,
    obtemReposTagSemLimpeza,
)
from atual.components.top2vec import obtem_topicos, obtem_topicos_pd
from atual.components.bertopic import obtem_topicos as obtem_topicos_bertopic
from atual.components.base_issues import android_base, python_base

app = FastAPI()

# Importando CORS
from fastapi.middleware.cors import CORSMiddleware


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
# Incluindo front no back (para deploy)
class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except HTTPException as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise ex


# OBS: Quando troca de home pra /, dá erro nos endpoints
app.mount("/home", SPAStaticFiles(directory="./client/dist", html=True), name="dist")
"""


# Endpoints
@app.post("/api/buscaRepos")
async def buscando_issues_Repos(request: Request):
    # Obtendo issues de vários repositórios
    repos = await request.json()
    repos = repos["repos"]
    array_repos_issues = await obtemRepos(repos)

    # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
    modelagem_topicos = await obtem_topicos(array_repos_issues)

    if modelagem_topicos is False:
        return {"erro": "Não há issues suficientes para gerar o modelo"}

    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


@app.post("/api/buscaRepos")
async def buscando_issues_Repos(request: Request):
    # Obtendo issues de vários repositórios
    repos = await request.json()
    repos = repos["repos"]
    array_repos_issues = await obtemRepos(repos)

    # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
    modelagem_topicos = await obtem_topicos(array_repos_issues)

    if modelagem_topicos is False:
        return {"erro": "Não há issues suficientes para gerar o modelo"}

    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


@app.post("/api/buscaRepos/bert")
async def buscando_issues_Repos_Bertopic(request: Request):
    # Obtendo issues de vários repositórios
    repos = await request.json()
    repos = repos["repos"]
    array_repos_issues = await obtemRepos(repos)

    # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
    modelagem_topicos = await obtem_topicos_bertopic(array_repos_issues)

    if modelagem_topicos is False:
        return {"erro": "Não há issues suficientes para gerar o modelo"}

    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


@app.get("/api/buscaAndroid/t2v")
async def busca_android_top2vec():
    # Obtendo issues de vários repositórios
    df = android_base()

    modelagem_topicos = await obtem_topicos_pd(df)
    if modelagem_topicos is False:
        return JSONResponse(
            content={"erro": "Não há issues suficientes para gerar o modelo"},
            status_code=400,
        )

    return {"comparacoes": modelagem_topicos["comparacoes"], "topicos": modelagem_topicos["topicos"]}


@app.get("/api/buscaPython/t2v")
async def busca_python_top2vec():
    # Obtendo issues de vários repositórios
    df = python_base()

    modelagem_topicos = await obtem_topicos_pd(df)
    if modelagem_topicos is False:
        return JSONResponse(
            content={"erro": "Não há issues suficientes para gerar o modelo"},
            status_code=400,
        )

    return {"comparacoes": modelagem_topicos["comparacoes"], "topicos": modelagem_topicos["topicos"]}
