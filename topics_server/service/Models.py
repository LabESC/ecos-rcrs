import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC

regex_pattern = "[^a-zA-Z0-9 ]"


class Models:
    def __init__(self) -> None:
        # Carregar os dados do CSV
        data = pd.read_csv(
            "../internal_data/DataSetForSCR_Final.csv", encoding="unicode_escape"
        )

        # !! C LIMPEZA PARCIAL
        # Dividir os dados em features (X) e target (y)
        x_c_limp_parc = data["Sentence"].str.lower()
        x_c_limp_parc = x_c_limp_parc.str.replace(regex_pattern, " ")
        y_sem_limp = data["Label"]

        # Vetorização dos dados de texto
        vectorizer_c_limp_parc = TfidfVectorizer()

        x_train_vectorized_c_limp_parc = vectorizer_c_limp_parc.fit_transform(
            x_c_limp_parc
        )

        # Treinamento do modelo
        self.model_c_limp_parc = SVC(kernel="linear")
        self.model_c_limp_parc.fit(x_train_vectorized_c_limp_parc, y_sem_limp)

    def predict(self, sentence: str) -> str:
        # !! C LIMPEZA PARCIAL
        # Limpeza parcial da sentença
        sentence = sentence.lower()
        sentence = sentence.replace(regex_pattern, " ")

        # Vetorização dos dados de texto
        vectorizer_c_limp_parc = TfidfVectorizer()

        x_test_vectorized_c_limp_parc = vectorizer_c_limp_parc.transform([sentence])

        # Predição
        return self.model_c_limp_parc.predict(x_test_vectorized_c_limp_parc)[0]

    def predict(self, sentences_list: list[str]) -> list[str]:
        # !! C LIMPEZA PARCIAL
        # Limpeza parcial das sentenças
        sentences_list = [
            sentence.lower().replace(regex_pattern, " ") for sentence in sentences_list
        ]

        # Vetorização dos dados de texto
        vectorizer_c_limp_parc = TfidfVectorizer()

        x_test_vectorized_c_limp_parc = vectorizer_c_limp_parc.transform(sentences_list)

        # Predição
        return self.model_c_limp_parc.predict(x_test_vectorized_c_limp_parc)
