const GitHubRepository = require("../repository/GitHub");
const {
  filtraArrayRequestGit,
  hasNextLinkDict,
  hasNextLinkString,
} = require("./Words");

async function getRepos(repos) {
  // * Instanciando json de issues
  const issues = {};
  const errors = {};

  // * Iniciando repositório de requisições
  const gitHubRepository = new GitHubRepository();

  // * Para cada repositório, buscar issues
  for (let repo of repos) {
    // !! LOG
    console.log(`Buscando issues do repositório ${repo}`);

    // * Iniciando página
    let page = 1;

    // * Iniciando array de issues e erros
    issues[repo] = [];
    errors[repo] = [];

    // * Iniciando variáveis reutilizaveis
    let issuesResponse = null;

    // * Enquanto houver issues, buscar
    while (true) {
      // * Buscando issues
      const response = await gitHubRepository.getRepositoriesIssues(repo, page);

      // * Se ocorrer erro, salve o erro e prossiga pro próximo repositório
      if ("error" in response) {
        errors[repo].push({ page: page, error: response.error });
        break;
      }

      // * Se não houve erro, verificar se há issues
      if (response.data.length == 0) {
        break;
      }

      // * Se houver issues, filtra-las
      issuesResponse = await filtraArrayRequestGit(response.data);

      // * Se após a filtragem, não houver issues, retornar
      if (issuesResponse.length != 0) {
        // * Iterando sobre as issues obtidas
        issues[repo] = issues[repo].concat(issuesResponse);
      } else {
        break;
      }

      // * Verificando se há uma próxima página
      if (!hasNextLinkString(response.links)) break;

      // * Incrementar página
      page++;
    }
  }
  return { issues, errors };
}

module.exports = getRepos;
