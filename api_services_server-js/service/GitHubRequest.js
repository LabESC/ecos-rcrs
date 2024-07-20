const getRepos = require("./GitHub");
const getOrganizationRepositories = require("./GitHubOrg");
const doesRepoExist = require("./GitHubRepo");
const generateAccessTokenForInstallationID = require("./GitHubTokens");
const { updateEnvironmentMiningData } = require("./DBRequests");
const { formatIssuesToArray } = require("./Words");
const { getSCRFilter } = require("./ModelRequests");
const { allWordsWithLemma } = require("../utils/Keywords");
const { lemmatize } = require("../utils/Lemma");

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
  async run(
    repos,
    environment_id,
    filter_type,
    keywords,
    installationIds,
    rcr_keywords,
    created_at_since_filter,
    created_at_until_filter,
    status
  ) {
    // * Iniciando serviço
    this.#isRunning = true;
    let result = null;
    try {
      // * Executando requisições
      result = await getRepos(
        repos,
        installationIds,
        created_at_since_filter,
        created_at_until_filter,
        status
      );

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
      // . Lemmatizando palavras chaves do contexto do ambiente
      if (!keywords) keywords = [];
      keywords = keywords.map((word) => lemmatize(word));

      // . Lemmatizando palavras chaves do contexto do change requests
      if (!rcr_keywords) rcr_keywords = [];
      rcr_keywords = rcr_keywords.map((word) => lemmatize(word));

      // . Unindo palavras-chave do contexto do ambiente com as palavras-chave lemmatizadas do sistema
      let allKeywords = [...new Set([...rcr_keywords, ...keywords])];

      let newResultsIssueArr = [];
      for (const issue of result.issues) {
        // . Obtendo e lemmatizando os labels da issue...
        let issueLabels = issue.tags ? issue.tags.split(",") : [];
        issueLabels = issueLabels.map((label) => lemmatize(label));

        // . Obtendo e lemmatizando os textos da issue...
        let issueWords = issue.body.toLowerCase().split(" ");
        issueWords = issueWords.map((word) => lemmatize(word));

        // * Verificando se as tags da issue possuem alguma palavra-chave
        const foundTags = issueLabels.some((label) =>
          allKeywords.includes(label)
        );

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

    // * Atualizando id de cada issue contida no result.issues
    result.issues = result.issues.map((issue, index) => {
      issue.id = index;
      return issue;
    });

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
        nextRequest.keywords,
        nextRequest.installationIds,
        nextRequest.rcr_keywords,
        nextRequest.created_at_since_filter,
        nextRequest.created_at_until_filter,
        nextRequest.status
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
  async addQueue(
    repos,
    environment_id,
    filter_type,
    keywords,
    installationIds,
    rcr_keywords,
    created_at_since_filter,
    created_at_until_filter,
    status
  ) {
    // * Adicionando requisição na fila
    this.#requestsQueue.push({
      repos: repos,
      environment_id: environment_id,
      filter_type: filter_type,
      keywords: keywords,
      installationIds: installationIds,
      rcr_keywords: rcr_keywords,
      created_at_since_filter: created_at_since_filter,
      created_at_until_filter: created_at_until_filter,
      status: status,
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
  async searchOrganizationRepos(organization, accessToken = null) {
    const result = await getOrganizationRepositories(organization, accessToken);

    return result;
  }

  /**
   * Busca se um repositorio existe.
   * @param {Array} repo - Array com 2 elementos: organização e repositório.
   * @return {boolean} Retorna true se o repositório for encontrado e false se não.
   **/
  async doesRepoExist(repo, accessToken = null) {
    // * Buscando se existe e retornando
    const response = await doesRepoExist(repo, accessToken);

    return response;
  }

  async generateAccessTokenForInstallationID(installation_id) {
    // * Buscando se existe e retornando
    const response = await generateAccessTokenForInstallationID(
      installation_id
    );

    return response;
  }
}

module.exports = GitHubRequest;
