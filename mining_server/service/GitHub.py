# Importando serviço de requisições
from service.Requests import Request as requestsService

# Importando biblioteca de json
import json

# Importando funções de outros arquivos
from service.Words import (
    filtraArrayRequestGit,
    criaDicionarioTags,
    vrfProximo,
    vrfProximoNovo,
    filtraArrayRequestGitSemLimpar,
    criaDicionarioTagsSemLimpar,
)


class GitHub:
    """def __init__(self) -> None:
    issues = {}
    self.__isRunning = False"""

    @staticmethod
    # ! Função que obtém as issues de um repositório
    async def obtem_repos(self, repos: list[str]):
        # * Instanciando dicionário de issues
        issues = {}

        # * Inicializando serviço de requisições
        requests = requestsService()

        # * Itere sobre os repositórios
        for repo in repos:
            print("Obtendo issues do repositório: " + repo)  # . LOG
            # * Criando o repositório no dicionário
            issues[repo] = []

            # * Inicializando a variável de pesquisa na página 1
            pagina = 1

            while True:
                # * Fazendo a requisição
                (
                    resposta_repo_obj,
                    resposta_repo_links,
                ) = await requests.get_repo_issue(repo, pagina)
                resposta_repo_obj = filtraArrayRequestGit(resposta_repo_obj)

                if resposta_repo_obj is not []:  # and resposta_repo_obj[0] != "":
                    # * Itere sobre as issues obtidas
                    for issue in resposta_repo_obj:
                        # * Inserindo cada issue no dicionário do repositório
                        try:
                            issues[repo].append(issue)
                        except Exception:
                            print("Erro ao adicionar a issue")

                    """for key in resposta_repo_obj.keys():
                        try:
                            issues[repo].append(
                                {key: resposta_repo_obj[key].strip()}
                            )"""
                    # . Caso não haja uma próxima página, encerre o loop
                    if vrfProximoNovo(resposta_repo_links) is False:
                        break

                    # . Incremente o número da página buscada e busque-a
                    pagina += 1
                else:
                    break

        return issues
