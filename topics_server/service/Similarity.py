"""
import faiss


# Função que retorna o index a partir da sessão inicializada do TensorFlow
def cria_index(message_embeddings):
    try:
        # Cria um índice FAISS do tipo IndexFlatL2, que é um índice simples que armazena os embeddings em uma matriz e calcula a distância Euclidiana entre eles.
        index = faiss.IndexFlatL2(message_embeddings.shape[1])

        # Adiciona os embeddings da mensagem ao índice.
        index.add(message_embeddings)
        return index
    except TypeError as typeE:
        print(typeE)
        return None
    except Exception:
        print("Erro ao receber o message_embeddings do TensorFlow.")
        return None

"""

from sklearn.metrics.pairwise import cosine_similarity


# . Funcao que calcula a similaridade cosena entre dois embeddings
def calcula_similaridade(embedding1, embedding2):
    # . Calcula a similaridade entre dois embeddings
    return cosine_similarity(embedding1, embedding2)


# . Funcao que a partir de um dicionario contendo os topicos gerados,
# . faz a busca por similaridade entre cada uma das issues de cada topico
# . e retorna o dicionario alterado contendo os resultados
def gera_similares_de_topicos(topics):
    # . Para cada topico
    for topic in topics:
        print("similaridades topico " + str(topic["id"]))
        # . Para cada issue do topico
        for issue in topic["issues"]:
            # . Para cada issue2 do topico
            for issue2 in topic["issues"]:
                # . Se a issue nao for a mesma
                if issue["id"] != issue2["id"]:
                    # . Calcula a similaridade entre as duas issues\
                    similaridade = calcula_similaridade(
                        issue["embedding"], issue2["embedding"]
                    )
                    if similaridade > 0.6:
                        # . Adiciona a issue2 no array de similares da issue
                        issue["relatedTo"].append(
                            {
                                "id": issue2["id"],
                                "similarity": similaridade,
                            }
                        )

    # . Removendo os embeddings das issues
    for topic in topics:
        for issue in topic["issues"]:
            del issue["embedding"]

    return topics
