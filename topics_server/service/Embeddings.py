import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-mpnet-base-v2")


def gera_embedding(issue: str):
    return model.encode(issue)
