# ! Importando a senha e login salvos para autenticar o usuário do arquivo .env
import asyncio
from service.Credentials import Credentials as credentials

# import requests
import httpx
import json


class Request:
    def __init__(self) -> None:
        self.__headers = {"Authorization": "token " + credentials.get_github_token()}
        self.request_headers = None
        self.request_text = None
        self.request_links = None
        self.requests = httpx.AsyncClient()

    async def check_expired_limit(self, status_code: int, headers: dict):
        # * Verificando se há tempo de espera no "x-ratelimit-reset"
        # * Validando se a requisição foi obtida ou não...
        if status_code != 200:
            # * Se nao foi obtida, verifique se o erro foi por limite de requisições
            if status_code == 403 or status_code == 429:
                resposta_headers = headers

                # * Se foi o limite primário, aguardar e refazer requisição
                if "x-ratelimit-remaining" in resposta_headers:
                    # * Aguardando os segundos de "x-ratelimit-reset"
                    await asyncio.sleep(int(resposta_headers["x-ratelimit-reset"]))
                    return 1
                if "retry-after" in resposta_headers:
                    # * Verificando se há tempo de espera no "x-ratelimit-reset"
                    if "x-ratelimit-reset" in resposta_headers:
                        # * Aguardando o tempo de espera, se existir
                        await asyncio.sleep(int(resposta_headers["x-ratelimit-reset"]))
                        return 2
                    else:
                        # * Aguardando 1 hora (limite para a proxima requisição)
                        await asyncio.sleep(3600)
                        return 3

        # * Se foi por limite de requisições, retorne o erro
        return 0

    async def get_repo_issue(self, repo: str, page: int):
        # * Definindo url
        repo_url = f"https://api.github.com/repos/{repo}/issues?page={page}&per_page=100?&state=all"

        # * Fazendo requisição
        resposta_repo = await self.requests.get(repo_url, headers=self.__headers)

        # * Verificando se o limite de requisições foi excedido
        while (
            await self.check_expired_limit(
                resposta_repo.status_code, resposta_repo.headers
            )
            != 0
        ):
            # * Refazendo requisição
            resposta_repo = await self.requests.get(repo_url, headers=self.__headers)

        # * Salvando dados da requisição
        self.request_headers = resposta_repo.headers if resposta_repo.headers else None
        self.request_text = resposta_repo.text if resposta_repo.text else None
        self.request_links = resposta_repo.links if resposta_repo.links else None

        # * Retornando dados da requisição como json (dict) + dados de header para validar se há mais páginas + status de requisições da api
        return json.loads(resposta_repo.text), self.request_links
