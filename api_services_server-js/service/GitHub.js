const { DateTime } = require("luxon"); // * Importando luxon (biblioteca de datas)
const GitHubRepository = require("../repository/GitHub");
const {
  filtraArrayRequestGit,
  hasNextLinkDict,
  hasNextLinkString,
} = require("./Words");

async function getRepos(
  repos,
  installationIds,
  created_at_since,
  created_at_until,
  status
) {
  // * Instanciando datas de string para objeto (erro, verificar...)
  let createdAtSince = null,
    createdAtUntil = null;
  if (created_at_since) createdAtSince = DateTime.fromISO(created_at_since);
  if (created_at_until) createdAtUntil = DateTime.fromISO(created_at_until);

  // * Instanciando json de issues
  const issues = {};
  const errors = {};

  // * Iniciando repositório de requisições
  const gitHubRepository = new GitHubRepository();

  // * Iniciando id de issues (sistema)
  let sysId = 0;

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
    let installationIdAccessToken = null;

    // * Verificando se o owner do repositorio (organização ou usuario) possui installationId, se tiver, gerar
    try {
      const orgOrUser = repo.split("/")[0];
      if (installationIds) {
        // Buscando em installationIds o objeto cujo atributo "github_user" seja igual a orgOrUser
        const installationIdObj = installationIds.find(
          (obj) => obj.github_user === orgOrUser
        );

        if (installationIdObj) {
          // Gerando um access_token para o installationId
          installationIdAccessToken =
            await gitHubRepository.generateAccessTokenForInstallationID(
              installationIdObj.github_installation_id
            );
        }
      }
    } catch (e) {}

    // * Enquanto houver issues, buscar
    while (true) {
      // * Buscando issues
      let response = null;
      try {
        response = await gitHubRepository.getRepositoriesIssues(
          repo,
          page,
          status,
          installationIdAccessToken
        );
      } catch (e) {
        response = { error: "Error obtaining issues" };
      }

      // * Se ocorrer erro, salve o erro e prossiga pro próximo repositório
      if ("error" in response) {
        errors[repo].push({ page: page, error: response.error });
        break;
      }

      // * Se não houve erro, verificar se há issues
      if (response.data.length === 0) {
        break;
      }

      // * Se houver issues, filtra-las
      issuesResponse = await filtraArrayRequestGit(
        response.data,
        sysId,
        createdAtSince,
        createdAtUntil
      );
      sysId = issuesResponse.sysIdUpdated;
      endMining = issuesResponse.endMining;

      // * Se houver issues pós-filtragem, adicione no array de issues para o repositorio indicado
      if (issuesResponse.result.length !== 0) {
        // * Iterando sobre as issues obtidas
        issues[repo] = issues[repo].concat(issuesResponse.result);
      }
      // * Se não houver issues, retornar
      else {
        break;
      }

      // * Se a mineração foi finalizada (data final do periodo excedeu), ir para o proximo repositorio
      if (endMining === true) break;

      // * Verificando se há uma próxima página
      if (!hasNextLinkString(response.links)) break;

      // * Incrementar página
      page++;
    }
  }

  return { issues, errors };
}

module.exports = getRepos;
