from top2vec import Top2Vec
import pandas as pd

# from service.Embeddings import gera_embedding


class Top2VecImpl:
    @staticmethod
    async def obtem_topicos(array_repos_issues: list[dict]):
        # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
        keys = array_repos_issues.keys()
        values = array_repos_issues.values()

        df = pd.DataFrame(keys, columns=["Repositórios"])
        df["Issues"] = values
        print(f"Tamanho do conjunto: {df.shape[0]}")

        try:
            model = Top2Vec(values, embedding_model="doc2vec")
        except Exception:
            # Não foi possivel identificar consistencia no ecos informado, por consequência, não houve a possibilidade de gerar um modelo de tópicos para o ecos
            return False

        topic_sizes, _topic_nums = model.get_topic_sizes()
        print(topic_sizes)

        topic_words, _word_scores, _topic_nums = model.get_topics()

        # iterando sobre os topicos e obtendo 50 documentos para cada
        i = 0
        doc_dict = []
        while i < len(topic_sizes):
            documents, document_scores, document_ids = model.search_documents_by_topic(
                topic_num=i, num_docs=topic_sizes[i]
            )

            doc_dict.append(
                {
                    f"#{doc_id} - Score: {score}": doc
                    for doc, score, doc_id in zip(
                        documents, document_scores, document_ids
                    )
                }
            )

            i += 1

        return {"comparacoes": doc_dict, "topicos": topic_words.tolist()}

    @staticmethod
    async def obtem_topicos_pd(df: pd.DataFrame):
        if df is None:
            raise Exception("DataFrame is null")

        # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
        values = df["Issues"].values
        try:
            model = Top2Vec(values, embedding_model="doc2vec")
        except Exception as e:
            print(e)
            # Não foi possivel identificar consistencia no ecos informado, por consequência, não houve a possibilidade de gerar um modelo de tópicos para o ecos
            return False

        topic_sizes, _topic_nums = model.get_topic_sizes()
        print(topic_sizes)

        topic_words, _word_scores, _topic_nums = model.get_topics()

        # iterando sobre os topicos e obtendo os documentos para cada
        i = 0
        doc_dict = []
        while i < len(topic_sizes):
            documents, document_scores, document_ids = model.search_documents_by_topic(
                topic_num=i, num_docs=topic_sizes[i]
            )

            doc_dict.append(
                {
                    f"#{doc_id} - Score: {score}": doc
                    for doc, score, doc_id in zip(
                        documents, document_scores, document_ids
                    )
                }
            )

            i += 1

        return {"comparisons": doc_dict, "topics": topic_words.tolist()}

    @staticmethod
    async def obtem_topicos_pd_retorna_pd(df: pd.DataFrame):
        # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
        values = df["Issues"].values
        try:
            model = Top2Vec(values, embedding_model="doc2vec")
        except Exception as e:
            # Não foi possivel identificar consistencia no ecos informado, por consequência, não houve a possibilidade de gerar um modelo de tópicos para o ecos
            try:
                return {"error": str(e)}
            except Exception:
                return {"error": "It was not possible to generate the topics"}

        topic_sizes, _topic_nums = model.get_topic_sizes()
        print(topic_sizes)

        topic_words, _word_scores, topic_nums = model.get_topics()

        # iterando sobre os topicos e obtendo os documentos para cada
        i = 0
        df_topics = pd.DataFrame(
            data={topic_nums, topic_words}, columns=["num_topic", "words"]
        )
        df_issues = pd.DataFrame(columns=["repository", "issue", "score", "num_topic"])
        while i < len(topic_sizes):
            documents, document_scores, document_ids = model.search_documents_by_topic(
                topic_num=i, num_docs=topic_sizes[i]
            )

            for doc, score, doc_id in zip(documents, document_scores, document_ids):
                df_issues.append(
                    {
                        "repository": df["Repositórios"][doc_id],
                        "issue": doc,
                        "score": score,
                        "num_topic": i,
                    }
                )

            i += 1

        return {"comparisons": df_issues, "topics": df_topics}

    @staticmethod
    async def create_df_by_json_issues(json_issues: list[dict]):
        df = pd.DataFrame(json_issues)
        return df

    @staticmethod
    async def obtem_topicos_pd_body(df: pd.DataFrame):
        if df is None:
            raise Exception("DataFrame is null")

        # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
        values = df["body"].values
        try:
            model = Top2Vec(values, embedding_model="doc2vec")
        except Exception as e:
            print(e)
            # Não foi possivel identificar consistencia no ecos informado, por consequência, não houve a possibilidade de gerar um modelo de tópicos para o ecos
            return False

        topic_sizes, _topic_nums = model.get_topic_sizes()
        print(topic_sizes)

        topic_words, _word_scores, _topic_nums = model.get_topics()

        # iterando sobre os topicos e obtendo os documentos para cada
        i = 0
        doc_dict = []
        for i, size in enumerate(topic_sizes):
            documents, document_scores, document_ids = model.search_documents_by_topic(
                topic_num=i, num_docs=size
            )

            doc_dict.extend(
                {"id": int(doc_id), "score": float(score), "topicNum": int(i)}
                for _, score, doc_id in zip(documents, document_scores, document_ids)
            )

        return {"comparisons": doc_dict, "topics": topic_words.tolist()}

    @staticmethod
    async def obtem_topicos_pd_body_com_formatacao(df: pd.DataFrame):
        if df is None:
            raise Exception("DataFrame is null")

        # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
        values = df["body"].values
        try:
            model = Top2Vec(values, embedding_model="doc2vec")
        except Exception as e:
            print(e)
            # Não foi possivel identificar consistencia no ecos informado, por consequência, não houve a possibilidade de gerar um modelo de tópicos para o ecos
            raise Exception("It was not possible to generate the topics")

        topic_sizes, _topic_nums = model.get_topic_sizes()
        print(topic_sizes)

        topic_words, word_scores, _topic_nums = model.get_topics()

        # iterando sobre os topicos e obtendo os documentos para cada
        i = 0
        doc_dict = []
        for i, size in enumerate(topic_sizes):
            # . Criando o dict do topico no array
            doc_dict.append(
                {
                    "id": str(i),
                    "words": [],
                    "name": "#" + str(i) + " - " + ", ".join(topic_words[i]),
                    "issues": [],
                }
            )

            # . Adicionando as palavras e score no topico
            for word, score in zip(topic_words[i], word_scores[i]):
                doc_dict[i]["words"].append({"word": word, "score": float(score)})

            # . Buscando os documentos associados a esse topico
            documents, document_scores, document_ids = model.search_documents_by_topic(
                topic_num=i, num_docs=size
            )

            # . Adicionando cada documento no array de issues do topico
            doc_dict[i]["issues"].extend(
                {
                    "id": int(doc_id),
                    "score": float(score),
                    "topicNum": int(i),
                    "body": doc,
                    "repo": df["repo"][doc_id],
                    "issueId": int(df["issueId"][doc_id]),
                    "tags": df["tags"][doc_id],
                    # "embedding": gera_embedding(doc),
                    "relatedTo": [],
                }
                for doc, score, doc_id in zip(documents, document_scores, document_ids)
            )

        return {"comparisons": doc_dict}
