# Importando serviço de requisições
from service.Requests import Requests as requestsService

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
    def __init__(self) -> None:
        self.__issues = {}

    # ! Função que obtém as issues de um repositório
    async def obtem_repos(self, repos: list[str]):
        # * Inicializando serviço de requisições
        requests = requestsService()

        # * Itere sobre os repositórios
        for repo in repos:
            # * Inicializando a variável de pesquisa na página 1
            pagina = 1

            while True:
                resposta_repo_obj, resposta_repo_links = requests.get_repo_issue(
                    repo, pagina
                )
                resposta_repo_obj = filtraArrayRequestGit(resposta_repo_obj)

                if resposta_repo_obj != [] and resposta_repo_obj[0] != "":
                    for issue in resposta_repo_obj:
                        issue_split = issue.split(" - Issues: ")

                        try:
                            self.__issues[f"{repo} - {issue_split[0]}"] = issue_split[1]
                        except Exception:
                            print("Erro ao adicionar a issue")

                    # Caso não haja uma próxima página, encerre o loop
                    if vrfProximoNovo(resposta_repo_links) is False:
                        break

                    # Incremente o número da página buscada e busque-a
                    pagina += 1
                else:
                    break

        return self.__issues
