from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json

from service.Auth import Auth as authValidator
from service.Models import Models
from schemas.Model import SVMTfidfRequest

router_topic = APIRouter(prefix="/api/model", tags=["Model"])
models = Models()

# Variáveis globais
entity_name = "model"
msg_404 = {
    "en-US": f"{entity_name} not found!",
    "pt-BR": "Modelo não encontrado!",
}
msg_500 = {"en-US": "Internal server error!", "pt-BR": "Erro interno do servidor!"}
msg_email_not_sent = {"en-US": "E-mail not sent!", "pt-BR": "E-mail não enviado!"}
msg_user_not_found = {
    "en-US": "User not found!",
    "pt-BR": "Usuário não encontrado!",
}
msg_user_not_active = {
    "en-US": "User not active!",
    "pt-BR": "Usuário não está ativo!",
}


@router_topic.post("/svm-tfidf/filter-scrs")
async def filtra_scrs_by_svm_com_tfidf(body: SVMTfidfRequest, request: Request):
    # * Validando usuário e senha
    if authValidator.validate_user(request) is False:
        return JSONResponse(
            {"code": "auth", "message": "Authentication failed!"},
            status_code=401,
        )

    # * Obtendo os dados do request
    sentences_id = [issue["id"] for issue in body.issues]
    sentences_list = [issue["body"] for issue in body.issues]

    # * Predição
    predictions = models.predict(sentences_list)

    # * Filtrando os SCR's
    scr_filtered = [
        {"id": sentences_id[i], "body": sentences_list[i]}
        for i in range(len(sentences_list))
        if predictions[i] == "SCR"
    ]

    return scr_filtered
