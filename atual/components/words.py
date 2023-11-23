# Importando biblioteca de regex
import re

# Importando biblioteca gensim
import gensim

# Importando biblioteca BeatifulSoup (que removerá os elementos HTML do texto das issues)
from bs4 import BeautifulSoup as bs

# Importando biblioteca para remover os warnings do BeatifulSoup
import warnings
from bs4 import MarkupResemblesLocatorWarning, XMLParsedAsHTMLWarning

warnings.filterwarnings("ignore", category=MarkupResemblesLocatorWarning, module="bs4")
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning, module="bs4")

# Importando bibliotecas de dados (pandas)
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
from nltk.corpus import stopwords

nltk.download("stopwords")

# Palavras que poluem o texto (para remoção nos textos)
wordsToRemove = ["\n", "\r", "\r\n", "\r\n\r\n", "[x]", "[X]", "[ ]"]


# Funçoes para limpeza de textos
def filtraArrayRequestGit(array: list[dict], nomeRepo=" ", idIssue=False):
    """Retorna um array somente com o body das issues

    Args:
        array (list[dict]): Um array de objetos do tipo issue (vindo do GitHub)

    Returns:
        _type_: Um array com o body das issues
    """
    arrayIssues = []
    for issue in array:
        if issue.get("body") != None:
            issueObtida = issue.get("body")
            idIssue = issue.get("id")

            # Para cada palavra no array de palavras a remover, remova-a da string
            for word in wordsToRemove:
                issueObtida = issueObtida.replace(word, " ")

            # Remover as tags html da string - SÓ REMOVIA A TAG, MANTINHA O TEXTO DENTRO DELA
            # issueObtida = re.sub(re.compile("<.*?>"), "", issueObtida)

            # Instanciando a biblioteca BeatifulSoup na issue obtida
            issueObtida = bs(issueObtida, "html.parser")

            # Removendo as tags HTML do texto e seus conteúdos
            for tagHTML in issueObtida.find_all():
                tagHTML.extract()

            # Retornando issueObtida a uma string para continuar outras remoções
            issueObtida = issueObtida.get_text()

            # Remover os links na string
            issueObtida = re.sub("http://\S+|https://\S+", " ", issueObtida)

            # Entendendo que textos que estão entre ``` são códigos, remova-os
            issueObtida = re.sub("```.*?```", " ", issueObtida)

            # Remover os espaços demasiados numa string
            issueObtida = re.sub(" +", " ", issueObtida)

            # arrayIssues.append(f"Repo: {nomeRepo} - Issues: {issueObtida}" if nomeRepo != " " and len(issueObtida) > 0 else issueObtida)
            # arrayIssues.append(
            # f"{idIssue} - Issues: {issueObtida}"
            # if idIssue != False and len(issueObtida) > 0
            # else issueObtida
            # )
            if idIssue != False and len(issueObtida) > 0:
                arrayIssues.append(f"{idIssue} - Issues: {issueObtida}")

    return arrayIssues


# Função para criar um dicionário com chave igual as tags e valor igual ao body das issues
def criaDicionarioTags(array: list[dict]):
    """Cria um dicionário com chave igual as tags e valor igual ao body das issues

    Args:
        array (list[str]): Um array com o body das issues

    Returns:
        _type_: Um dicionário com chave igual as tags e valor igual ao body das issues
    """
    dicionario = {}
    for issue in array:
        if len(issue.get("labels")) == 0:
            keyDict = "Uncategorized"
        else:
            keyDict = f'{issue.get("labels")[0].get("name")}'

        # Check if the key exists in the dictionary
        if keyDict not in dicionario:
            dicionario[keyDict] = []

        if issue.get("body") != None:
            issueObtida = issue.get("title")
            issueObtida = issueObtida + " " + issue.get("body")

            # Para cada palavra no array de palavras a remover, remova-a da string
            for word in wordsToRemove:
                issueObtida = issueObtida.replace(word, " ")

            # Remover as tags html da string
            issueObtida = re.sub(re.compile("<.*?>"), "", issueObtida)

            # Remover os links na string
            issueObtida = re.sub("http://\S+|https://\S+", " ", issueObtida)

            # Remover os espaços demasiados numa string
            issueObtida = re.sub(" +", " ", issueObtida)

            # Entendendo que textos que estão entre ``` são códigos, remova-os
            issueObtida = re.sub("```.*?```", " ", issueObtida)

            dicionario[keyDict].append(issueObtida)

    return dicionario


def leDocumento(dict, tokens_only=False):
    # Trainando as respostas para o modelo doc2vec
    for k, v in dict.items():
        tokens = gensim.utils.simple_preprocess(v[0])
        if tokens_only:
            yield tokens
        else:
            yield gensim.models.doc2vec.TaggedDocument(tokens, [k])


def filtraArrayRequestGitCTit(array: list[dict]):
    """Retorna um array com o titulo concatenado ao body das issues contidas no array

    Args:
        array (list[dict]): Um array de objetos do tipo issue (vindo do GitHub)

    Returns:
        _type_: Um array com o título e body das issues concatenados
    """
    arrayIssues = []

    for issue in array:
        if issue.get("body") != None:
            issueObtida = issue.get("title")
            issueObtida = issueObtida + " " + issue.get("body")

            # Para cada palavra no array de palavras a remover, remova-a da string
            for word in wordsToRemove:
                issueObtida = issueObtida.replace(word, " ")

            # Remover os links na string
            issueObtida = re.sub("http://\S+|https://\S+", " ", issueObtida)

            # Remover os espaços demasiados numa string
            issueObtida = re.sub(" +", " ", issueObtida)

            # Entendendo que textos que estão entre ``` são códigos, remova-os
            issueObtida = re.sub("```.*?```", " ", issueObtida)

            arrayIssues.append(issueObtida)

    return arrayIssues


def limpaRespostaGit(issue: list[dict]):
    """Pensando em uma função map, pra cada objeto (issue) de um array de objetos, retornar o body.

    Args:
        issue (list[dict]): Um array de objetos do tipo issue (vindo do GitHub)

    Returns:
        string: O body da issue limpo
    """
    issueObtida = issue.get("body")

    # Para cada palavra no array de palavras a remover, remova-a da string
    for word in wordsToRemove:
        issueObtida = issueObtida.replace(word, " ")

    # Remover os links na string
    issueObtida = re.sub("http://\S+|https://\S+", " ", issueObtida)

    # Remover os espaços demasiados numa string
    issueObtida = re.sub(" +", " ", issueObtida)

    # Entendendo que textos que estão entre ``` são códigos, remova-os
    issueObtida = re.sub("```.*?```", " ", issueObtida)

    return issueObtida


def geraTfIdf(responseAPI: list[str], filtrar: bool = False):
    """Gera o tf-idf para cada issue da resposta da API

    Args:
        responseAPI (list[str]): Um array com as issues.\n
        filtrar (bool, optional): Se True, filtra o tf-idf para exibir apenas entre 25% e 75%. Defaults to False.

    Returns:
        _type_: Um dicionário com o tf-idf de cada issue
    """
    issuesRepo = {f"Issue n°{i + 1}": responseAPI[i] for i in range(len(responseAPI))}
    # Gerando o tf-idf para cada resposta da API
    # tfidf = TfidfVectorizer()
    # tfidf.fit(responseAPI)

    # Iterando sobre o dicionário de issues e gerando o tf-idf para cada uma
    tfIdfDict = {}
    for i in range(len(issuesRepo)):
        tfIdfVectorizer = TfidfVectorizer(
            use_idf=True, stop_words=stopwords.words("english").extend(wordsToRemove)
        )
        tfIdf = tfIdfVectorizer.fit_transform([issuesRepo[f"Issue n°{i+1}"]])
        df = pd.DataFrame(
            tfIdf[0].T.todense(),
            index=tfIdfVectorizer.get_feature_names_out(),
            columns=["TF-IDF"],
        )
        df = df.sort_values("TF-IDF", ascending=False)

        # filtrando o df para que só apareçam os valores entre o 1° e o 3° quartil
        if filtrar:
            q1 = df.quantile(0.25)[0]
            q3 = df.quantile(0.75)[0]
            df = df[(df["TF-IDF"] >= q1) & (df["TF-IDF"] <= q3)]

        tfIdfDict[f"Issue n°{i+1}"] = df

    return tfIdfDict


# Função que retorna um array key-value a partir de uma string divisível em , e ;
def vrfProximo(link: str):
    links = link.split(",")
    for l in links:
        obj = l.split(";")
        if obj[1].split("=")[1] == '"next"':
            return True

    return False


# Função que retorna um array key-value a partir de uma string divisível em , e ;
def vrfProximoNovo(link: dict):
    if "next" in link:
        return True
    else:
        return False


def criaDicionarioTagsSemLimpar(array: list[dict]):
    """Cria um dicionário com chave igual as tags e valor igual ao body das issues

    Args:
        array (list[str]): Um array com o body das issues

    Returns:
        _type_: Um dicionário com chave igual as tags e valor igual ao body das issues
    """
    dicionario = {}
    for issue in array:
        if len(issue.get("labels")) == 0:
            keyDict = "Uncategorized"
        else:
            keyDict = f'{issue.get("labels")[0].get("name")}'

        # Check if the key exists in the dictionary
        if keyDict not in dicionario:
            dicionario[keyDict] = []

        if issue.get("body") != None:
            issueObtida = issue.get("title")
            issueObtida = issueObtida + " " + issue.get("body")

            dicionario[keyDict].append(issueObtida)

    return dicionario


def filtraArrayRequestGitSemLimpar(array: list[dict], nomeRepo=" ", idIssue=False):
    """Retorna um array somente com o body das issues

    Args:
        array (list[dict]): Um array de objetos do tipo issue (vindo do GitHub)

    Returns:
        _type_: Um array com o body das issues
    """
    arrayIssues = []
    for issue in array:
        if issue.get("body") != None:
            issueObtida = issue.get("body")
            idIssue = issue.get("id")

            if idIssue != False and len(issueObtida) > 0:
                arrayIssues.append(f"{idIssue} - Issues: {issueObtida}")

    return arrayIssues
