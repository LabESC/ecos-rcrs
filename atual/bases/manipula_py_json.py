import pandas as pd
import json

# Carregando o arquivo JSON
with open(r"E:\UNIRIO\IC\ecos-2024\atual\bases\python_repos.json", 'r') as json_file:
    data = json.load(json_file)

# Criando listas para os atributos
repos = []
html_urls = []
ids = []
titles = []
labels = []
states = []
bodies = []

# Iterando sobre os dados e preenchendo as listas
for repo, issues in data['issues'].items():
    for issue in issues:
        body = issue.get('body')
        if body is not None and body != "":  # Verificando se 'body' não é nulo
            repos.append(repo)
            html_urls.append(issue.get('html_url'))
            ids.append(issue.get('id'))
            titles.append(issue.get('title'))
            labels.append(','.join([label.get('name') for label in issue.get('labels', [])]))  # Obtendo apenas os nomes das labels
            states.append(issue.get('state'))
            bodies.append(issue.get('body').lower()) # Convertendo o texto da issue para lowercase (caixa baixa)

# Criando o DataFrame
data_dict = {
    'Repository': repos,
    'html_url': html_urls,
    'id': ids,
    'title': titles,
    'labels': labels,
    'state': states,
    'Issues': bodies
}

df = pd.DataFrame(data_dict)

# Exibindo o DataFrame
print(df)

# Convertendo o DataFrame para JSON e salvando em um arquivo
with open(r"E:\UNIRIO\IC\ecos-2024\atual\bases\dataframe_python.json", 'w', encoding='utf-8') as file:
    df.to_json(file, force_ascii=False)