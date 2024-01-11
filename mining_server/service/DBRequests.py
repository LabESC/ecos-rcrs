# ! Importando bibliotecas para requests
import httpx
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
        resposta = httpx.put(
            url, headers={"service-login": SERVICE_LOGIN, "service-pwd": SERVICE_PWD}
        )

        # * Verificando se foi bem-sucedido
        if resposta.status_code == 200:
            return True
        else:
            return False

    @staticmethod
    async def update_enviroment_mining_data(
        environment_id: str, mining_data: dict, status: str
    ):
        # * Definindo url
        url = f"{URLBASE}/environment/{environment_id}/mining_data"

        # * Fazendo requisição
        resposta = httpx.post(
            url,
            headers={"service-login": SERVICE_LOGIN, "service-pwd": SERVICE_PWD},
            json={"mining_data": mining_data, "status": status},
        )

        # * Verificando se foi bem-sucedido
        if resposta.status_code == 200:
            return True
        else:
            return False
