# ! Importando bibliotecas para requests
import requests
import json

# ! Importando urls base
from service.Credentials import Credentials as credentials

URLBASE = credentials.get_db_microsservice_base()
SERVICE_LOGIN = credentials.get_user()
SERVICE_PWD = credentials.get_user_pwd()


class DBRequests:
    @staticmethod
    async def update_environment_status(environment_id: str, status: str):
        # * Definindo url
        url = f"{URLBASE}/environment/{environment_id}/status/{status}"

        # * Fazendo requisição
        resposta = requests.put(
            url, headers={"service-login": SERVICE_LOGIN, "service-pwd": SERVICE_PWD}
        )

        # * Verificando se foi bem-sucedido
        if resposta.status_code == 200:
            return True
        else:
            return False

    @staticmethod
    async def update_enviroment_topic_data(
        environment_id: str, topic_data: list[dict], status: str
    ):
        # * Definindo url
        url = f"{URLBASE}/environment/{environment_id}/topicdata"

        print(url)
        # * Fazendo requisição
        try:
            resposta = requests.post(
                url,
                headers={"service-login": SERVICE_LOGIN, "service-pwd": SERVICE_PWD},
                json={"topic_data": topic_data, "status": status},
            )
        except Exception as e:
            print(e)
            print("error sending to bd")
            return False

        # * Verificando se foi bem-sucedido
        if resposta.status_code == 200:
            print("success sending to bd")
            return True
        else:
            print("error sending to bd, but send")
            return False
