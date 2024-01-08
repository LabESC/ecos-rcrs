from bertopic import BERTopic
import pandas as pd


class BerTopic:
    @staticmethod
    def obtem_topicos(array_repos_issues: list[dict]):
        # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organizacao
        keys = [repo_issue["Repositório"] for repo_issue in array_repos_issues]
        values = [repo_issue["Issues"] for repo_issue in array_repos_issues]

        df = pd.DataFrame({"Repositórios": keys, "Issues": values})
        print(f"Tamanho do conjunto: {df.shape[0]}")

        # Inicializar e ajustar o modelo BERTopic
        try:
            topic_model = BERTopic()
            _, _ = topic_model.fit_transform(df.Issues)
        except ValueError as e:
            # Não foi possível identificar consistência nas issues informadas,
            # portanto, não houve a possibilidade de gerar um modelo de tópicos
            return False

        # Obter tamanhos dos tópicos
        topic_sizes = topic_model.get_topic_sizes()
        print(topic_sizes)

        # Obter palavras-chave dos tópicos
        topic_words = topic_model.get_topics()

        # Iterar sobre os tópicos e obter documentos para cada tópico
        doc_dict = []
        for i, size in enumerate(topic_sizes):
            topic_docs = topic_model.get_docs(topic_num=i, n_docs=size)
            doc_dict.append(
                {
                    f"#{idx}": df.Issues.iloc[doc_id]
                    for idx, doc_id in enumerate(topic_docs)
                }
            )

        return {"comparacoes": doc_dict, "topicos": topic_words}

    @staticmethod
    def obtem_topicos_pd(df: pd.DataFrame):
        # Inicializar e ajustar o modelo BERTopic
        try:
            topic_model = BERTopic()
            _, _ = topic_model.fit_transform(df.Issues)
        except ValueError:
            # Não foi possível identificar consistência nas issues informadas,
            # portanto, não houve a possibilidade de gerar um modelo de tópicos
            return False

        # Obter tamanhos dos tópicos
        topic_sizes = topic_model.get_topic_sizes()
        print(topic_sizes)

        # Obter palavras-chave dos tópicos
        topic_words = topic_model.get_topics()

        # Iterar sobre os tópicos e obter documentos para cada tópico
        doc_dict = []
        for i, size in enumerate(topic_sizes):
            topic_docs = topic_model.get_docs(topic_num=i, n_docs=size)
            doc_dict.append(
                {
                    f"#{idx}": df.Issues.iloc[doc_id]
                    for idx, doc_id in enumerate(topic_docs)
                }
            )

        return {"comparacoes": doc_dict, "topicos": topic_words}
