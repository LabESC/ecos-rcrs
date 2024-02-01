const GitHubRepository = require("../repository/GitHub");
const { formatReposToStringArray, hasNextLinkString } = require("./Words");

async function getOrganizationRepos(organization) {
  // * Instanciando json de issues
  let repos = [];
  const errors = [];

  // * Iniciando repositório de requisições
  const gitHubRepository = new GitHubRepository();

  // * Iniciando página
  let page = 1;

  // * Iniciando variáveis reutilizaveis
  let reposResponse = null;

  // * Enquanto houver issues, buscar
  while (true) {
    // * Buscando issues
    const response = await gitHubRepository.getOrganizationRepos(
      organization,
      page
    );

    // * Se ocorrer erro, salve o erro e prossiga pro próximo repositório
    if ("error" in response) {
      errors.push({ page: page, error: response.error });
      break;
    }

    // * Se não houve erro, verificar se há repositorios
    if (response.data.length === 0) {
      break;
    }

    // * Se houver issues, filtra-las
    reposResponse = formatReposToStringArray(response.data);

    // * Se após a filtragem, não houver repositorios, retornar
    if (reposResponse.length !== 0) {
      // * Iterando sobre os repositorios obtidas
      repos = repos.concat(reposResponse);
    } else {
      break;
    }

    // * Verificando se há uma próxima página
    if (!hasNextLinkString(response.links)) break;

    // * Incrementar página
    page++;
  }
  return { repos: repos, errors };
}

module.exports = getOrganizationRepos;
