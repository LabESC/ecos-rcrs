from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json

# Importando dependencias locais
from service.Top2Vec import Top2VecImpl
from service.Databases import Database
from service.Auth import Auth as authValidator

from schemas.Topic import TopicReposRequest

"""from schemas.Environment import (
    EnvironmentResponse,
    EnvironmentRequest,
    EnvironmentResponseFiltered,
)
from validations.Auth import Auth as authValidator
from utils.Error import error"""


router_topic = APIRouter(prefix="/topic", tags=["Topic"])

# Variáveis globais
entity_name = "topic"
msg_404 = {
    "en-US": f"{entity_name} not found!",
    "pt-BR": "Topico não encontrado!",
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


# @router_topic.patch("/geraTopicos/bert")
@router_topic.get("/android/t2v")
async def busca_android_top2vec():
    # Obtendo issues de vários repositórios
    df = Database.get_android()
    print(df.head())
    modelagem_topicos = await Top2VecImpl.obtem_topicos_pd(df)
    if modelagem_topicos is False:
        return JSONResponse(
            content={"erro": "Não há issues suficientes para gerar o modelo"},
            status_code=400,
        )

    # !! TESTE - Salvando JSON para visualizar
    with open("./internal_data/modelagem_topicos_t2v.json", "w") as outfile:
        json.dump(modelagem_topicos, outfile)

    # ! Inserir o resultado no BD
    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


@router_topic.post("/repos/t2v")
async def busca_repos_top2vec(request: TopicReposRequest):
    # * Validando usuário e senha
    if authValidator.validate_user(request.user, request.password) is False:
        return JSONResponse(
            {"code": "auth", "message": "Authentication failed!"},
            status_code=401,
        )

    # * Modelando issues recebidas
    modelagem_topicos = await Top2VecImpl.obtem_topicos_pd(request.issues)
    if modelagem_topicos is False:
        return JSONResponse(
            content={
                "code": "modelling",
                "message": "Não há issues suficientes para gerar o modelo",
            },
            status_code=400,
        )

    # !! Inserir o resultado no BD - Pendente

    # ! Retornando resultado
    return {
        "comparacoes": modelagem_topicos["comparacoes"],
        "topicos": modelagem_topicos["topicos"],
    }


"""
@router_topic.get("/buscaPython/t2v")
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
"""
