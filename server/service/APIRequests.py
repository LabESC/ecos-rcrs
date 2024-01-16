# ! Importando bibliotecas para requests
import requests

# ! Importando urls base
from utils.Credentials import Credentials as credentials

URLBASE = credentials.get_api_microsservice_base()
SERVICE_LOGIN = credentials.get_service_login()
SERVICE_PWD = credentials.get_service_pwd()


class APIRequests:
    @staticmethod
    async def send_email(to: str, subject: str, text: str):
        # * Definindo url
        url = f"{URLBASE}/email/send"

        # * Fazendo requisição
        resposta = requests.post(
            url,
            json={"to": to, "subject": subject, "text": text},
            headers={"service-login": SERVICE_LOGIN, "service-pwd": SERVICE_PWD},
        )

        # * Verificando se foi bem-sucedido
        if resposta.status_code == 200:
            return True
        else:
            return False

    @staticmethod
    async def request_mining(environment_id: str, repos: list[str]):
        # * Definindo url
        url = f"{URLBASE}/github/mining/repos"
        print(url)
        # * Fazendo requisição
        resposta = requests.post(
            url,
            json={"environment_id": environment_id, "repos": repos},
            headers={"service-login": SERVICE_LOGIN, "service-pwd": SERVICE_PWD},
        )

        # * Verificando se foi bem-sucedido
        if resposta.status_code == 200:
            return True
        else:
            return False
