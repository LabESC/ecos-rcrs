# * Importando serviço do GitHub
from service.GitHub import GitHub as GitHubService
from service.DBRequests import DBRequests

import asyncio


class GitHubRequests:
    def __init__(self) -> None:
        self.__requestsQueue = []
        self.__isRunning = False

    async def run(self, repos: list[str], environment_id: str):
        # * Instanciando serviço do GitHub (requisições)
        try:
            self.__isRunning = True
            result = await GitHubService.obtem_repos(repos)
            self.__isRunning = False
        except Exception as e:
            result = {"error": str(e)}
            self.__isRunning = False

        # ! Verificando se houve erro, se sim, envie-o ao microsserviço de BD com status de erro de mineração
        if "error" in result:
            # * Enviando erro ao microsserviço de BD
            await DBRequests.update_enviroment_mining_data(
                environment_id, result, "mining_error"
            )
            return

        # ! Se não houve erro, envia os dados ao microsserviço de BD
        await DBRequests.update_enviroment_mining_data(
            environment_id, result, "mining_done"
        )

        # * Verifique se há alguma requisição a ser rodada
        if len(self.__requestsQueue) > 0:
            # * Se houver, rode-a
            asyncio.create_task(self.run_queue())

    async def run_queue(self):
        # * Obtendo proxima requisição na fila
        proxima_requisicao = self.__requestsQueue[0]
        self.__requestsQueue.pop(0)

        # * Rodando requisição
        await self.run(
            proxima_requisicao["repos"], proxima_requisicao["environment_id"]
        )

    async def is_running(self):
        return self.__isRunning

    async def add_to_queue(self, repos: list[str], environment_id: str):
        # * Adicionando requisição na fila
        self.__requestsQueue.append({"repos": repos, "environment_id": environment_id})

        if self.__isRunning is False:
            await self.run_queue()
