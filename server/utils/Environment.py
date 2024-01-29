class Environment:
    @staticmethod
    def join_comparisons_and_topics(topic_data, mining_data):
        # . Faca o metodo onde o environment contem uma lista de comparacoes (contendo dicionarios com atributos id,score e numero do topico associado) e uma lista de topicos (contendo dicionarios de chave (numero do topico) e valor (array com palavras do topico)), o metodo abaixo junta as duas listas em uma unica lista de dicionarios, onde cada dicionario contem o atributo topic, contendo uma string que concatenou as palavras do topico, o atributo id contendo o numero do topico, e um atributo issues contendo todas as issues associadas ao topico.
        new_topics = []

        for index, topic in enumerate(topic_data["topics"]):
            new_topics.append(
                {
                    "topic": " ,".join(topic),
                    "issues": [],
                    "id": index,
                    "name": "#" + str(index) + " - " + " ,".join(topic),
                }
            )

        for comparison in topic_data["comparisons"]:
            # . Buscando os dados de comparacao e juntando com os dados de mineracao
            for data in mining_data["issues"]:
                if data["id"] == comparison["id"]:
                    comparison["body"] = data["body"]
                    comparison["repo"] = data["repo"]
                    comparison["issueId"] = data["issueId"]
                    comparison["tags"] = data["tags"]
                    break

            # . Buscando o topico que possui o id igual ao numero do topico associado a comparacao e adicionando a comparacao na lista de issues do topico
            for topic in new_topics:
                if topic["id"] == comparison["topicNum"]:
                    topic["issues"].append(comparison)
        return new_topics

    @staticmethod
    def join_comparisons_and_topics2(topic_data, mining_data):
        # . Faca o metodo onde o environment contem uma lista de comparacoes (contendo dicionarios com atributos id,score e numero do topico associado) e uma lista de topicos (contendo dicionarios de chave (numero do topico) e valor (array com palavras do topico)), o metodo abaixo junta as duas listas em uma unica lista de dicionarios, onde cada dicionario contem o atributo topic, contendo uma string que concatenou as palavras do topico, o atributo id contendo o numero do topico, e um atributo issues contendo todas as issues associadas ao topico.
        new_topics = []

        for index, topic in enumerate(topic_data["topics"]):
            new_topics.append(
                {
                    "topic": " ,".join(topic),
                    "issues": [],
                    "id": index,
                    "name": "#" + str(index) + " - " + " ,".join(topic),
                }
            )

        for comparison in topic_data["comparisons"]:
            # . Buscando os dados de comparacao e juntando com os dados de mineracao
            for data in mining_data["issues"]:
                if data["id"] == comparison["id"]:
                    comparison["body"] = data["body"]
                    comparison["repo"] = data["repo"]
                    comparison["issueId"] = data["issueId"]
                    comparison["tags"] = data["tags"]
                    break

            # . Buscando o topico que possui o id igual ao numero do topico associado a comparacao e adicionando a comparacao na lista de issues do topico
            for topic in new_topics:
                if topic["id"] == comparison["topicNum"]:
                    topic["issues"].append(comparison)
        return new_topics
