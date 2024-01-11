const getRepos = require("./GitHub");
const { updateEnvironmentMiningData } = require("./DBRequests");

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
   * @param {string} pwd Id do ambiente (BD) que solicitou a mineração.
   **/
  async run(repos, environment_id) {
    // * Iniciando serviço
    this.#isRunning = true;
    let result = null;
    try {
      // * Executando requisições
      result = await getRepos(repos);
    } catch (e) {
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
      } catch (e) {}

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

    // * Finalizando serviço
    this.#isRunning = false;

    // !! LOG: Imprimindo que acabou
    console.log("Acabou mineração");

    // * Enviando resultado para o banco de dados
    await updateEnvironmentMiningData(environment_id, result, "mining_done");

    // * Verificando se há requisições na fila
    if (this.#requestsQueue.length != 0) {
      // * Executando requisição da fila
      this.runQueue(); // ! Não aguardo (await), para otimizar
    }
  }

  /**
   * Executa a fila de mineração.
   **/
  async runQueue() {
    // * Enquanto houver requisições na fila, executar
    while (this.#requestsQueue.length != 0) {
      // * Executando requisição
      const nextRequest = this.#requestsQueue.shift();
      this.run(nextRequest.repos, nextRequest.environment_id);
    }
  }

  /**
   * Insere uma nova mineração em fila.
   *
   * @param {Array} repos Array de repositórios (strings).
   * @param {string} pwd Id do ambiente (BD) que solicitou a mineração.
   **/
  async addQueue(repos, environment_id) {
    // * Adicionando requisição na fila
    this.#requestsQueue.push({ repos: repos, environment_id: environment_id });

    console.log("this.#isRunning: ", this.#isRunning);
    // * Se não houver requisições em andamento, executar
    if (!this.#isRunning) await this.runQueue(); // ! Não aguardo (await), pois retorno ao usuário
  }
}

module.exports = GitHubRequest;
