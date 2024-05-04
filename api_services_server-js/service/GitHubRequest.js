const getRepos = require("./GitHub");
const getOrganizationRepositories = require("./GitHubOrg");
const doesRepoExist = require("./GitHubRepo");
const { updateEnvironmentMiningData } = require("./DBRequests");
const { formatIssuesToArray } = require("./Words");
const { getSCRFilter } = require("./ModelRequests");
const { allWords: keywordsArr } = require("../utils/Keywords");

class GitHubRequest {
  #requestsQueue;
  #isRunning;

  constructor() {
    this.#requestsQueue = [];
    this.#isRunning = false;
  }

  /**
   * Minera os repositórios, e envia o resultado para o banco de dados.
   *
   * @param {Array} repos Array de repositórios (strings).
   * @param {string} environment_id O id do ambiente (BD) que solicitou a mineração.
   **/
  async run(repos, environment_id, filter_type, keywords) {
    // * Iniciando serviço
    this.#isRunning = true;
    let result = null;
    try {
      // * Executando requisições
      result = await getRepos(repos);

      // * Filtrando issues por SCR (Microsservico de topicos - não implementado ainda)
      /*const issuesForSCRRequest = result.issues.map((issue) => {
        return { id: issue.id, body: issue.body };
      });

      const scrFilter = await getSCRFilter(environment_id, issuesForSCRRequest);

      if (scrFilter) {
        // Obtendo o conjunto de ids de cada issue do scrFilter
        const scrFilterIds = scrFilter.issues.map((issue) => issue.id);
        // Filtrando as issues do resultado original que estão no scrFilter
        result.issues = result.issues.filter((issue) =>
          scrFilterIds.includes(issue.id)
        );
      }
      */
      // * Finalizando serviço
      this.#isRunning = false;

      // !! LOG: Imprimindo que acabou
      console.log("Acabou mineração");
    } catch (e) {
      console.log(e);
      // * Finalizando serviço
      this.#isRunning = false;

      // * Tente converter o erro para string via toString() -> objetos
      try {
        await updateEnvironmentMiningData(
          environment_id,
          { error: e.toString() },
          "mining_error"
        );
        return;
      } catch (e) {
        console.log(e);
      }

      // * Tente converter o erro para string via stringify() -> objetos JSON
      try {
        await updateEnvironmentMiningData(
          environment_id,
          { error: e.stringify() },
          "mining_error"
        );
        return;
      } catch (e) {}

      // * Se não conseguir, retorne erro generico
      await updateEnvironmentMiningData(
        environment_id,
        { error: "Mining error, review info and try again." },
        "mining_error"
      );
      return;
    }

    // . Formatando resultado
    try {
      const newIssuesResult = formatIssuesToArray(result.issues);
      result.issues = newIssuesResult;
    } catch (e) {
      // * Se não conseguir, retorne erro generico
      await updateEnvironmentMiningData(
        environment_id,
        {
          error:
            "Error formatting result, it may be caused by a bad mining, try again.",
        },
        "mining_error"
      );
      return;
    }

    // . Registrando qtd de issues obtidas
    result.issuesObtainedLength = result.issues.length;

    // * Filtrando issues por condição de filtro
    if (filter_type === "none") {
      console.log("No filter applied."); // !! LOG
    }
    if (filter_type === "keywords") {
      console.log("Keyword filter applied."); // !! LOG
      if (!keywords) keywords = [];
      const allKeywords = [...new Set([...keywordsArr, ...keywords])];

      let newResultsIssueArr = [];
      for (const issue of result.issues) {
        const issueTags = issue.tags ? issue.tags.split(",") : [];
        const issueWords = issue.body.toLowerCase().split(" ");

        // * Verificando se as tags da issue possuem alguma palavra-chave
        const foundTags = issueTags.some((tag) => allKeywords.includes(tag));

        if (foundTags) {
          newResultsIssueArr.push(issue);
          continue;
        }

        // * Verificando se o corpo da issue possui alguma palavra-chave
        const found = issueWords.some((word) => allKeywords.includes(word));

        if (found) {
          newResultsIssueArr.push(issue);
        }
      }
      result.issuesFilteredLength = newResultsIssueArr.length;
      result.issues = newResultsIssueArr;
      newResultsIssueArr = null; // Limpando memória
    }

    // * Enviando resultado para o banco de dados
    const sendToDB = await updateEnvironmentMiningData(
      environment_id,
      result,
      "mining_done"
    );
    if (sendToDB) console.log("Mineração enviada");

    // * Verificando se há requisições na fila
    if (this.#requestsQueue.length !== 0) {
      // * Executando requisição da fila
      this.runQueue(); // ! Não aguardo (await), para otimizar
    }
  }

  /**
   * Executa a fila de mineração.
   **/
  async runQueue() {
    // * Enquanto houver requisições na fila, executar
    while (this.#requestsQueue.length !== 0) {
      // * Executando requisição
      const nextRequest = this.#requestsQueue.shift();
      this.run(
        nextRequest.repos,
        nextRequest.environment_id,
        nextRequest.filter_type,
        nextRequest.keywords
      );
    }
  }

  /**
   * Insere uma nova mineração em fila.
   *
   * @param {Array} repos Array de repositórios (strings).
   * @param {string} environment_id Id do ambiente (BD) que solicitou a mineração.
   * @param {string} filter_type Tipo de filtro a ser aplicado.
   **/
  async addQueue(repos, environment_id, filter_type, keywords) {
    // * Adicionando requisição na fila
    this.#requestsQueue.push({
      repos: repos,
      environment_id: environment_id,
      filter_type: filter_type,
      keywords: keywords,
    });

    console.log("this.#isRunning: ", this.#isRunning);
    // * Se não houver requisições em andamento, executar
    if (!this.#isRunning) await this.runQueue(); // ! Não aguardo (await), pois retorno ao usuário
  }

  /**
   * Busca repositorios de uma organizacao.
   * @param {string} organization - O nome da organização.
   * @return {object} Retorna um objeto com os repositorios da organização.
   **/
  async searchOrganizationRepos(organization) {
    const result = await getOrganizationRepositories(organization);

    return result;
  }

  /**
   * Busca se um repositorio existe.
   * @param {Array} repo - Array com 2 elementos: organização e repositório.
   * @return {boolean} Retorna true se o repositório for encontrado e false se não.
   **/
  async doesRepoExist(repo) {
    // * Buscando se existe e retornando
    const response = await doesRepoExist(repo);

    return response;
  }
}

module.exports = GitHubRequest;
