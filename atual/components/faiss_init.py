import faiss


# Função que retorna o index a partir da sessão inicializada do TensorFlow
def criaIndex(message_embeddings):
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
