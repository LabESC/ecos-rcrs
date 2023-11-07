from base_requisitos.obter_bases import (
    base_promise_exp,
)

from bertopic import BERTopic

topic_model = BERTopic()
topics, probs = topic_model.fit_transform(base_promise_exp)


# Obtendo informações dos tópicos
topic_model.get_topic_info()
