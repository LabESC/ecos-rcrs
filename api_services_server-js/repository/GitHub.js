const { GITHUB_TOKEN } = require("../Credentials");
const axios = require("axios");

class GitHub {
  #request_headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`, //`token ${GITHUB_TOKEN}`
  };

  constructor() {
    this.requests = axios.create({
      baseURL: "https://api.github.com",
    });
    this.status = { success: 200, expired: [403, 429] };
  }

  // ! Função para verificar se o limite de requisições foi excedido
  async checkExpiredLimit(statusCode, headers) {
    // * Se não houve erro na requisição, retorne.
    if (this.status.success === parseInt(statusCode)) return 0;

    // * Se houve erro na requisição, verifique se o limite de requisições foi excedido.
    if (this.status.expired.includes(parseInt(statusCode))) {
      // * Se foi o limite primário, aguardar e refazer requisição
      if ("x-ratelimit-remaining" in headers) {
        // * Obtendo e aguardando os segundos de "x-ratelimit-reset"
        const resetTimeMs = parseInt(headers["x-ratelimit-reset"]) * 60;
        await new Promise((resolve) => {
          setTimeout(resolve, resetTimeMs);
        });
        return 1;
      }
      // * Se foi o limite secundário, aguardar e refazer requisição
      if ("retry-after" in headers) {
        // * Verificando se há tempo de espera no "x-ratelimit-reset"
        if ("x-ratelimit-reset" in headers) {
          const resetTimeMs = parseInt(headers["x-ratelimit-reset"]) * 60;
          await new Promise((resolve) => {
            setTimeout(resolve, resetTimeMs);
          });
          return 2;
        }
        // * Se não tiver, aguarde 1h para refazer a requisição
        else {
          await new Promise((resolve) => {
            setTimeout(resolve, 216000);
          });
          return 3;
        }
      }
    } else {
      return 4;
    }
  }

  // ! Função para buscar issues de um repositório
  async getRepositoriesIssues(repo, page) {
    // * Fazendo requisição
    let response = await this.requests.get(
      `repos/${repo}/issues?page=${page}&per_page=100`,
      // ! - PRODUÇÃO: `repos/${repo}/issues?page=${page}&per_page=100?&state=all`,
      {
        headers: this.#request_headers,
      }
    );

    // * Verificando se o limite de requisições foi excedido
    let checkExpiredLimit = await this.checkExpiredLimit(
      response.status,
      response.headers
    );

    // * Se retornar algum outro código, retorne erro
    if (checkExpiredLimit === 4) {
      return {
        error:
          "message" in response.data ? response.data.message : response.data,
      };
    }

    // * Enquanto ele não for refeito, aguarde, refaça e valide novamente
    while (checkExpiredLimit != 0) {
      response = await this.requests.get(
        `repos/${repo}/issues?page=${page}&per_page=100?&state=all`,
        {
          headers: this.#request_headers,
        }
      );

      checkExpiredLimit = await this.checkExpiredLimit(
        response.status,
        response.headers
      );

      // * Se retornar algum outro código, retorne erro
      if (checkExpiredLimit === 4) {
        return {
          error:
            "message" in response.data ? response.data.message : response.data,
        };
      }
    }

    // * Retornando dados
    return {
      data: response.data,
      links: response.headers.link,
    };
  }

  // ! Função para buscar repositorios de uma organização
  async getOrganizationRepos(organization, page) {
    // * Fazendo requisição
    let response = null;
    try {
      response = await this.requests.get(
        `orgs/${organization}/repos?page=${page}&per_page=100`,
        {
          headers: this.#request_headers,
        }
      );
    } catch (e) {
      if (e.response.status === 404)
        return { error: "Organization not found." };
      else return { error: "It was not possible" };
    }

    // * Verificando se o limite de requisições foi excedido
    let checkExpiredLimit = await this.checkExpiredLimit(
      response.status,
      response.headers
    );

    // * Se retornar algum outro código, retorne erro
    if (checkExpiredLimit === 4) {
      return {
        error:
          "message" in response.data ? response.data.message : response.data,
      };
    }

    // * Enquanto ele não for refeito, aguarde, refaça e valide novamente
    while (checkExpiredLimit != 0) {
      response = await this.requests.get(
        `orgs/${organization}/repos?page=${page}&per_page=100`,
        {
          headers: this.#request_headers,
        }
      );

      checkExpiredLimit = await this.checkExpiredLimit(
        response.status,
        response.headers
      );

      // * Se retornar algum outro código, retorne erro
      if (checkExpiredLimit === 4) {
        return {
          error:
            "message" in response.data ? response.data.message : response.data,
        };
      }
    }

    // * Retornando dados
    return {
      data: response.data,
      links: response.headers.link,
    };
  }

  // ! Função para buscar repositório
  async getRepo(repo) {
    // * Fazendo requisição
    let response = null;
    try {
      response = await this.requests.get(`repos/${repo}`, {
        headers: this.#request_headers,
      });
    } catch (e) {
      if (e.response.status === 404) return false;
      else return { error: "It was not possible" };
    }

    return response.status === 200;
  }
}

module.exports = GitHub;
