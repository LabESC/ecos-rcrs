# SECO-RCR: A Tool to Manage Requirements Change in Software Ecosystems

## Eduardo Santos, Paulo Malcher, Rodrigo Santos

### Pré-requisitos:

- NodeJS;
- Python (preferencialmente, versão 3.10);
- Banco de dados PostgreSQL;
- Ferramentas de Build do Visual Studio (C++);
- Token para API do GitHub;
- E-mail para envio de notificações.

### Primeira execução:

É necessária a instalação das dependências necessárias para cada módulo da ferramenta.

- Módulos Mineração, Cliente, Servidor:

  - Para cada um destes módulos, acessar a pasta do módulo e executar o comando `npm install`.
  - Exemplo no Módulo Mineração:

    ```
    cd api_services_server-js
    npm install
    ```

- Módulo Tópicos:

  ```
  pip install -r requirements.txt
  ```

### Execução:

Para executar o projeto localmente, é necessário iniciar os 4 módulos em um terminal:

- Módulo Mineração:

```
cd api_services_server-js
npm start
```

- Módulo Tópicos:

```
cd topics_server
python -m uvicorn main:app --reload --port 3002
```

- Módulo Servidor:

```
cd server-js
npm start
```

- Módulo Cliente:

```
cd client
npm start
```

Para conectar os módulos, é necessário indicar as variáveis de ambiente em cada um dos módulos, localmente, a configuração deve ser:

- Módulo Mineração:

```
USER_LOGIN='login de modulos' //(este login deve ser o mesmo definido nos módulos de servidor e tópicos)
USER_PWD='senha do login de modulos' //(senha do login acima)

# GITHUB API
GITHUB_TOKEN="token da API do GitHub"

# EMAIL API
EMAIL_LOGIN="e-mail notificador"
EMAIL_PWD="senha do e-mail notificador"
EMAIL_HOST="host do e-mail notificador"
EMAIL_PORT="porta do e-mail notificador"
EMAIL_SERVICE="serviço do e-mail notificador"

# APP PORT
PORT=3001 (a porta utilizada por este módulo, pode ser trocada)

# MICROSSERVIÇOS (URL BASE)
DB_MICROSERVICE_BASE='url base contendo o /api do módulo Servidor'
TOPIC_MICROSERVICE_BASE='url base contendo o /api do módulo Tópicos'
```

- Módulo Servidor:

```
DB_NAME="nome do banco"
DB_USERNAME="usuario do banco"
DB_PASSWORD="senha do banco"
DB_HOST="url do banco"
DB_DIALECT="postgres"
DB_SCHEMA="schema do banco"
DB_SSL=true (se o banco precisar de autenticação SSL, manter 'true', senão, 'false', sem aspas)
APP_PORT=3000 (a porta utilizada por este módulo, pode ser trocada)

SERVICES_LOGIN='login de modulos'
SERVICES_PWD='senha do login de modulos'

API_MICROSERVICE_BASE='url base contendo o /api do módulo Mineração'
TOPIC_MICROSERVICE_BASE='url base contendo o /api do módulo Tópicos'
CLIENT_URL_BASE='url base contendo o /api do módulo Cliente'
```

- Módulo Tópicos:

```
USER_LOGIN='login de modulos'
USER_PWD='senha do login de modulos'

DB_MICROSERVICE_BASE='url base contendo o /api do módulo Servidor'
API_MICROSERVICE_BASE='url base contendo o /api do módulo Mineração'
```

- Módulo Cliente:

```
VITE_DB_MICROSERVICE_BASE='url base contendo o /api do módulo Servidor'
VITE_API_MICROSERVICE_BASE='url base contendo o /api do módulo Mineração'
```

### Observações:

- A porta utilizada pelo módulo Cliente pode ser alterada por meio do arquivo package.json, na diretiva "scripts" > "start";
- A porta utilizada pelo módulo Tópicos pode ser alterada na sua execução, ao trocar o número após a diretiva "--port ";
