# Importando o token do GitHub do arquivo .env
import os
from dotenv import load_dotenv
from pathlib import Path
import pandas as pd

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)
token = os.getenv("GITHUB_TOKEN")

# Importando biblioteca requests (Fazer requisições http)
import requests

# Importando biblioteca de json
import json

# Importando funções de outros arquivos
from service.words import (
    filtraArrayRequestGit,
    criaDicionarioTags,
    vrfProximo,
    vrfProximoNovo,
    filtraArrayRequestGitSemLimpar,
    criaDicionarioTagsSemLimpar,
)


class GitHub:
    @staticmethod
    # Função que obtem issues de uma organização
    async def obtemOrganizacao(organizacao):
        orgBaseUrl = f"https://api.github.com/orgs/{organizacao}/repos"
        headers = {"Authorization": "token " + token}

        repositorios = requests.get(orgBaseUrl, headers=headers)

        # Criando um dicionário com os nomes dos repositórios
        repositorios = json.loads(repositorios.text)

        # Criando dicionário e array que receberão issues de cada um dos repos da organização
        issuesDict = {}
        for repo in repositorios:
            repoBaseUrl = (
                f"https://api.github.com/repos/{organizacao}/{repo['name']}/issues"
            )
            issues = requests.get(repoBaseUrl, headers=headers)
            issues = filtraArrayRequestGit(json.loads(issues.text), True)

            # print(issues)
            if issues != [] and issues[0] != "":
                for issue in issues:
                    issueSplit = issue.split(" - Issues: ")

                    try:
                        issuesDict[f"{repo['name']} - {issueSplit[0]}"] = issueSplit[1]
                    except Exception:
                        print("Erro ao adicionar a issue")
                        # print(issue)
        return issuesDict

    @staticmethod
    # Função que obtem issues de 2 repositórios
    async def obtem2ReposTag(repo1, repo2):
        repo1BaseUrl = f"https://api.github.com/repos/{repo1}/issues"
        repo2BaseUrl = f"https://api.github.com/repos/{repo2}/issues"

        respostaRepo1 = requests.get(repo1BaseUrl)
        respostaRepo1Obj = criaDicionarioTags(json.loads(respostaRepo1.text))

        respostaRepo2 = requests.get(repo2BaseUrl)
        respostaRepo2Obj = criaDicionarioTags(json.loads(respostaRepo2.text))

        return respostaRepo1Obj, respostaRepo2Obj

    @staticmethod
    # Função que obtem issues de repositórios com tags
    async def obtemReposTag(arrayRepos):
        headers = {"Authorization": "token " + token}

        # Criando um novo dicionario que vai receber as issues de cada repositório em arrayRepos
        issuesDict = {}

        # Enquanto se tenha uma próxima página, busque mais repositórios
        for repo in arrayRepos:
            print(f"Buscando em {repo}")
            # Inicializando a variável de pesquisa na página 1
            pagina = 1
            # Inicializando a variável que receberá todas as issues obtidas do repositório
            respostaRepoObj = []

            while True:
                repoUrl = f"https://api.github.com/repos/{repo}/issues?page={pagina}&state=all"
                respostaRepo = requests.get(repoUrl, headers=headers)

                respostaRepoObj.extend(json.loads(respostaRepo.text))

                # Caso não haja uma próxima página, encerre o loop
                if vrfProximoNovo(respostaRepo.links) == False:
                    break

                # Incremente o número da página buscada e busque-a
                pagina += 1

            respostaRepoObj = criaDicionarioTags(respostaRepoObj)
            issuesDict[f"{repo}"] = respostaRepoObj

        return issuesDict

    @staticmethod
    # Função que obtem issues de 2 repositorios
    async def obtem2Repos(repo1, repo2):
        repo1BaseUrl = f"https://api.github.com/repos/{repo1}/issues"
        repo2BaseUrl = f"https://api.github.com/repos/{repo2}/issues"

        respostaRepo1 = requests.get(repo1BaseUrl)
        respostaAPIRepo1Obj = json.loads(respostaRepo1.text)
        respostaAPIRepo1Obj = filtraArrayRequestGit(respostaAPIRepo1Obj)

        respostaAPIRepo2 = requests.get(repo2BaseUrl)
        respostaAPIRepo2Obj = json.loads(respostaAPIRepo2.text)
        respostaAPIRepo2Obj = filtraArrayRequestGit(respostaAPIRepo2Obj)
        return respostaAPIRepo1Obj, respostaAPIRepo2Obj

    @staticmethod
    async def obtem_repos(arrayRepos: list[str]):
        headers = {"Authorization": "token " + token}

        # Criando um novo dicionario que vai receber as issues de cada repositório em arrayRepos
        issuesDict = {}

        # Enquanto se tenha uma próxima página, busque mais repositórios
        for repo in arrayRepos:
            # Inicializando a variável de pesquisa na página 1
            pagina = 1

            while True:
                repoUrl = f"https://api.github.com/repos/{repo}/issues?page={pagina}&state=all"
                respostaRepo = requests.get(repoUrl, headers=headers)

                respostaRepoObj = json.loads(respostaRepo.text)
                respostaRepoObj = filtraArrayRequestGit(respostaRepoObj)

                if respostaRepoObj != [] and respostaRepoObj[0] != "":
                    for issue in respostaRepoObj:
                        issueSplit = issue.split(" - Issues: ")

                        try:
                            issuesDict[f"{repo} - {issueSplit[0]}"] = issueSplit[1]
                        except Exception:
                            print("Erro ao adicionar a issue")

                    # Caso não haja uma próxima página, encerre o loop
                    if vrfProximoNovo(respostaRepo.links) is False:
                        break

                    # Incremente o número da página buscada e busque-a
                    pagina += 1
                else:
                    break

        return issuesDict

    @staticmethod
    async def obtemReposOrg(organizacao):
        # Definindo a base da url da requisição e o cabeçalho
        orgBaseUrl = f"https://api.github.com/orgs/{organizacao}/repos"
        headers = {"Authorization": "token " + token}

        # Criando um novo array "repos" para armazenar o nome dos repositórios desta organização
        repos = []

        # Inicializando a variável de pesquisa na página 1
        pagina = 1

        # Enquanto se tenha uma próxima página, busque mais repositórios
        while True:
            # Fazendo a requisição
            repositorios = requests.get(orgBaseUrl + f"?page={pagina}", headers=headers)

            # Para cada repositório obtido, insira-o no array de repositórios formatado como "organização/repositorio"
            for repo in json.loads(repositorios.text):
                repos.append(f"{organizacao}/{repo['name']}")

            # Caso não haja um próximo, encerre o loop
            # if(vrfProximo(repositorios.headers['link']) == False):
            if vrfProximoNovo(repositorios.links) == False:
                break

            # Incremente o número da página buscada e busque-a
            pagina += 1

        # Retornando o array ordenado em ordem ascendente
        return sorted(repos, key=str.lower)

    @staticmethod
    async def obtemReposSemLimpeza(arrayRepos):
        headers = {"Authorization": "token " + token}

        # Criando um novo dicionario que vai receber as issues de cada repositório em arrayRepos
        issuesDict = {}

        # Enquanto se tenha uma próxima página, busque mais repositórios
        for repo in arrayRepos:
            # Inicializando a variável de pesquisa na página 1
            pagina = 1

            while True:
                repoUrl = f"https://api.github.com/repos/{repo}/issues?page={pagina}&state=all"
                respostaRepo = requests.get(repoUrl, headers=headers)

                respostaRepoObj = json.loads(respostaRepo.text)
                respostaRepoObj = filtraArrayRequestGitSemLimpar(respostaRepoObj)

                if respostaRepoObj != [] and respostaRepoObj[0] != "":
                    for issue in respostaRepoObj:
                        issueSplit = issue.split(" - Issues: ")

                        try:
                            issuesDict[f"{repo} - {issueSplit[0]}"] = issueSplit[1]
                        except Exception:
                            print("Erro ao adicionar a issue")

                    # Caso não haja uma próxima página, encerre o loop
                    if vrfProximoNovo(respostaRepo.links) == False:
                        break

                    # Incremente o número da página buscada e busque-a
                    pagina += 1
                else:
                    break

        return issuesDict

    @staticmethod
    async def obtemReposTagSemLimpeza(arrayRepos):
        headers = {"Authorization": "token " + token}

        # Criando um novo dicionario que vai receber as issues de cada repositório em arrayRepos
        issuesDict = {}

        # Enquanto se tenha uma próxima página, busque mais repositórios
        for repo in arrayRepos:
            print(f"Buscando em {repo}")
            # Inicializando a variável de pesquisa na página 1
            pagina = 1
            # Inicializando a variável que receberá todas as issues obtidas do repositório
            respostaRepoObj = []

            while True:
                repoUrl = f"https://api.github.com/repos/{repo}/issues?page={pagina}&state=all"
                respostaRepo = requests.get(repoUrl, headers=headers)

                respostaRepoObj.extend(json.loads(respostaRepo.text))

                # Caso não haja uma próxima página, encerre o loop
                if vrfProximoNovo(respostaRepo.links) == False:
                    break

                # Incremente o número da página buscada e busque-a
                pagina += 1

            respostaRepoObj = criaDicionarioTagsSemLimpar(respostaRepoObj)
            issuesDict[f"{repo}"] = respostaRepoObj

        return issuesDict
