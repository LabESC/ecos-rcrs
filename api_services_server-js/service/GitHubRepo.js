const GitHubRepository = require("../repository/GitHub");

async function doesRepoExist(repo, accessToken = null) {
  // * Iniciando repositório de requisições
  const gitHubRepository = new GitHubRepository();

  // * Buscando se existe e retornando a resposta
  const response = await gitHubRepository.getRepo(repo, accessToken);
  return response;
}

module.exports = doesRepoExist;
