from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json

# Importando dependencias locais
from service.Top2Vec import Top2VecImpl
from service.Auth import Auth as authValidator
from service.DBRequests import DBRequests
from schemas.Topic import TopicReposRequest
from service.Similarity2 import generate_topics_similarity

router_topic = APIRouter(prefix="/api/topic", tags=["Topic"])

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
@router_topic.post("/t2v")
async def busca_repos_top2vec(body: TopicReposRequest, request: Request):
    # * Validando usuário e senha
    if authValidator.validate_user(request) is False:
        return JSONResponse(
            {"code": "auth", "message": "Authentication failed!"},
            status_code=401,
        )

    # * Formatando o json para dataframe
    df = await Top2VecImpl.create_df_by_json_issues(body.issues)

    # * Modelando issues recebidas
    try:
        topic_generation = await Top2VecImpl.obtem_topicos_pd_body_com_formatacao(df)
    except Exception as e:
        try:
            topic_generation = {"error": str(e)}
        except Exception:
            topic_generation = {
                "error": "An error occurred while generating topics, "
                + "please try again or with another instance!"
            }

    # . Se ocorrer erro, enviar o erro pro BD
    if "error" in topic_generation:
        print("sending error")
        await DBRequests.update_enviroment_topic_data(
            body.environment_id,
            topic_generation,
            "topics_error",
        )
        return

    # !! Senão, obter a similaridade das issues em um topico
    print("gerando topicos")
    topic_generation = generate_topics_similarity(topic_generation["comparisons"])
    print("sending result")

    # !! . Senão, inserir o resultado no BD
    await DBRequests.update_enviroment_topic_data(
        body.environment_id,
        topic_generation,  # topic_generation["comparisons"],
        "topics_done",
    )
