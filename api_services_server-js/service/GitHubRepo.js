const GitHubRepository = require("../repository/GitHub");

async function doesRepoExist(repo) {
  // * Iniciando repositório de requisições
  const gitHubRepository = new GitHubRepository();

  // * Buscando se existe e retornando a resposta
  const response = await gitHubRepository.getRepo(repo);
  return response;
}

module.exports = doesRepoExist;
