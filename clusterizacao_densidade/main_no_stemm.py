from base_requisitos.obter_bases import (
    base_promise_exp_sem_stemming,
)

# ! Converte os documentos em representações TF-IDF
from sklearn.feature_extraction.text import TfidfVectorizer

tfidf_vectorizer = TfidfVectorizer()

X = tfidf_vectorizer.fit_transform(base_promise_exp_sem_stemming["RequirementText"])

# ! Aplicando padronização com StandardScaler
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X.toarray())


# ! Crie o modelo DBSCAN
from sklearn.cluster import DBSCAN

dbscan2 = DBSCAN(
    eps=0.5, min_samples=2
)  # Parâmetros eps (distancia entre pontos para definir ) e min_samples podem ser ajustados

# Ajuste o modelo aos dados
dbscan2.fit_predict(X_scaled)
base_promise_exp_sem_stemming["cluster_labels"] = dbscan2.labels_

# Plota os clusters
import matplotlib.pyplot as plt

# Reduz a dimensionalidade usando Truncated SVD
from sklearn.decomposition import TruncatedSVD

svd = TruncatedSVD(n_components=5)
X_reduced = svd.fit_transform(X)

dbscan = DBSCAN(eps=0.25, min_samples=50)
clusters = dbscan.fit_predict(X_reduced)
clusters = dbscan.labels_

# Obtenha a lista de rótulos de cluster
print(clusters)

# Plota os clusters
plt.scatter(X_reduced[:, 0], X_reduced[:, 1], c=clusters)
plt.title("DBSCAN Clustering")
# Exiba o gráfico
plt.show()
