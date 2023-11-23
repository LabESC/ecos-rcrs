# Identificação de Requisitos em ECOS

## Eduardo Santos, Paulo Malcher, Rodrigo Santos

### Pré-requisitos:

- Python;
- Ferramentas de Build do Visual Studio (C++);

### O projeto:

Identificação de requisitos em ecossistemas de software.

### Metodologias/Algoritmos:

- **AI/Machine Learning/Algoritmos:**
  - scikit-learn;
  - gensim;
  - nltk;
  - top2vec;
- **APIS:**
  - requests;
  - fastAPI;
  - uvicorn;
- **Dados:**
  - pandas;
- **Outras:**
  - os;
  - dotenv;
  - json;
  - re;

### Execução:

Para executar o projeto, em um terminal, acesse a pasta "atual" e execute o código:

```
python -m uvicorn atual.main:app --reload
```

### Observações:

Toda vez que for feito o build do cliente (front):

- Remover o link do back dos endpoints (localhost/127.0.0.1)
- Alterar o arquivo index.html, removendo a "/" antes de "atual" nas importações deste.
