# ! Importando a senha e login salvos para autenticar o usuário do arquivo .env
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

    async def get_repo_issue(self, repo: str, page: int):
        # * Definindo url
        repo_url = f"https://api.github.com/repos/{repo}/issues?page={page}&state=all"

        # * Fazendo requisição
        resposta_repo = await self.requests.get(repo_url, headers=self.__headers)

        # * Salvando dados da requisição
        self.request_headers = resposta_repo.headers if resposta_repo.headers else None
        self.request_text = resposta_repo.text if resposta_repo.text else None
        self.request_links = resposta_repo.links if resposta_repo.links else None

        # * Retornando dados da requisição como json (dict) + dados de header para validar se há mais páginas + status de requisições da api
        return json.loads(resposta_repo.text), self.request_links
