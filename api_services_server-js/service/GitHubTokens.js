const GitHubRepository = require("../repository/GitHub");

async function generateAccessTokenForInstallationID(installation_id = null) {
  // * Iniciando repositório de requisições
  const gitHubRepository = new GitHubRepository();

  // * Buscando se existe e retornando a resposta
  const response = await gitHubRepository.generateAccessTokenForInstallationID(
    installation_id
  );
  return response;
}

module.exports = generateAccessTokenForInstallationID;
