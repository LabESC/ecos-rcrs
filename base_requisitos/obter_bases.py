# !
# ! Bibliotecas para preparação de dados
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer

nltk.download("punkt")
nltk.download("stopwords")


# *. Função para processamento de texto sem stemming
def preprocess_text(text):
    # . Tokenizando texto
    words = word_tokenize(text)

    # . Removendo pontuação e convertendo texto para caixa baixa (lowercase)
    words = [word.lower() for word in words if word.isalpha()]

    # . Remove stopwords
    stop_words = set(stopwords.words("english"))
    words = [word for word in words if word not in stop_words]

    # . Juntando as palavras novamente numa string
    return " ".join(words)


# *. Função para processamento de texto com stemming
def preprocess_text_with_stemming(text):
    # . Tokenizando texto
    words = word_tokenize(text)

    # . Removendo pontuação e convertendo texto para caixa baixa (lowercase)
    words = [word.lower() for word in words if word.isalpha()]

    # . Remove stopwords
    stop_words = set(stopwords.words("english"))
    words = [word for word in words if word not in stop_words]

    # . Stemming (opcional e pode ser trocado)
    stemmer = PorterStemmer()
    words = [stemmer.stem(word) for word in words]

    # . Juntando as palavras novamente numa string
    return " ".join(words)


# * Função que retorna a base promise_exp sem aplicação de stemmings
def base_promise_exp_sem_stemming():
    # . Importando base
    df = pd.read_csv(
        r"E:\UNIRIO\IC\ecos-2024\base_requisitos\PROMISE_EXP\PROMISE_exp.csv"
    )

    # . Renomeando colunas e removendo coluna de id do Projeto
    df.rename(columns={"RequirementText": "text", "_class_": "req_type"}, inplace=True)
    df.drop(columns=["ProjectID"], inplace=True)

    # . Normalizando subtipos de requisitos não funcionais por NF
    df["req_type"] = df["req_type"].replace(
        ["A", "L", "LF", "MN", "O", "PE", "SC", "SE", "US", "FT", "PO"],
        ["NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF"],
    )

    # . Aplicando o pré-processamento de texto para cada texto da base
    df["text"] = df["text"].apply(preprocess_text)

    return df  # . Retornando a base


# * Função que retorna a base promise_exp com aplicação de stemmings
def base_promise_exp_com_stemming():
    # . Importando base
    df = pd.read_csv(
        r"E:\UNIRIO\IC\ecos-2024\base_requisitos\PROMISE_EXP\PROMISE_exp.csv"
    )

    # . Renomeando colunas e removendo coluna de id do Projeto
    df.rename(columns={"RequirementText": "text", "_class_": "req_type"}, inplace=True)
    df.drop(columns=["ProjectID"], inplace=True)

    # . Normalizando subtipos de requisitos não funcionais por NF
    df["req_type"] = df["req_type"].replace(
        ["A", "L", "LF", "MN", "O", "PE", "SC", "SE", "US", "FT", "PO"],
        ["NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF"],
    )

    # . Aplicando o pré-processamento de texto para cada texto da base
    df["text"] = df["text"].apply(preprocess_text_with_stemming)

    return df  # . Retornando a base


# * Função que retorna a base promise_exp
def base_promise_exp():
    # . Importando base
    df = pd.read_csv(
        r"E:\UNIRIO\IC\ecos-2024\base_requisitos\PROMISE_EXP\PROMISE_exp.csv"
    )

    # . Renomeando colunas e removendo coluna de id do Projeto
    df.rename(columns={"RequirementText": "text", "_class_": "req_type"}, inplace=True)
    df.drop(columns=["ProjectID"], inplace=True)

    # . Normalizando subtipos de requisitos não funcionais por NF
    df["req_type"] = df["req_type"].replace(
        ["A", "L", "LF", "MN", "O", "PE", "SC", "SE", "US", "FT", "PO"],
        ["NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF", "NF"],
    )

    return df
