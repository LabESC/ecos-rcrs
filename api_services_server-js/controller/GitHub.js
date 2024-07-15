// * Importando as bibliotecas
const { Router } = require("express");
const router = Router();

// * Importando módulos
const validation = require("../validations/Mining");
const { validate_service_user } = require("../service/Auth");

// * Importando classe DBRequests
const DBRequests = require("../service/DBRequests");

// * Importando classe GitHubRequests
const GitHubRequest = require("../service/GitHubRequest");
// * Instanciando classe
const gitHubRequest = new GitHubRequest();

// ! Rota de solicitação de mineração
router.post("/api/github/mining/repos", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { body, headers } = req;

  // * Validando variáveis
  const valid = await validation(headers, body);

  // * Se for inválido, retorne erro
  if (!valid) {
    return res.status(400).json({ error: "Invalid request." });
  }

  // * Se for válido, autentique o usuário de serviço
  if (
    !validate_service_user(headers["service-login"], headers["service-pwd"])
  ) {
    return res.status(401).json({ error: "Invalid service credentials." });
  }

  // * Obtendo repos e environment_id
  const {
    environment_id,
    filter_type,
    keywords,
    user_id,
    rcr_keywords,
    mining_filter_date_since,
    mining_filter_date_until,
    mining_issues_status,
  } = body;
  let repos = body.repos;

  // * Se não houver repositórios, retorne erro
  if (repos.length === 0) {
    return res.status(400).json({ error: "Invalid repositories." });
  }

  // . Ordenando repositorios
  repos = repos.sort();

  // * Se o userId for recebido, obter os installation id para o usuario gerar o access token
  // . Obtendo installation id para o usuario/organizacao para o usuario no BD
  let installationIds = null;
  if (user_id) {
    installationIds = await DBRequests.getInstallationsIdByUserId(user_id);
  }

  // * Adicionando requisição na fila
  await gitHubRequest.addQueue(
    repos,
    environment_id,
    filter_type,
    keywords,
    installationIds,
    rcr_keywords,
    mining_filter_date_since,
    mining_filter_date_until,
    mining_issues_status
  );

  return res.status(200).json({ message: "Mining request received." });
});

// ! Rota de obtencao de repositorios a partir de uma organizacao
router.get("/api/github/organization/:org/repos", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { params, headers } = req;

  // * Obtendo organização
  let organization = null;
  try {
    organization = params.org;
  } catch (e) {
    return res.status(400).json({ error: "Invalid organization." });
  }

  // * Se o userId for recebido, obter os installation id para o usuario gerar o access token
  // . Obtendo installation id para o usuario/organizacao para o usuario no BD
  let installationId = null;
  if (headers["ecos-user-id"]) {
    installationId =
      await DBRequests.getInstallationIdByUserIdAndGitHubUserOrOrganization(
        headers["ecos-user-id"],
        organization
      );
  }

  // * Gerando access token para o installationId, se este for obtido
  let accessToken = null;
  if (installationId) {
    accessToken = await gitHubRequest.generateAccessTokenForInstallationID(
      installationId
    );
  }

  // * Obtendo repositórios da organização
  const repos = await gitHubRequest.searchOrganizationRepos(
    organization,
    accessToken
  );

  // * Se não houver repositórios, retorne erro
  if (repos === null) {
    return res.status(400).json({ error: "Invalid organization." });
  }

  // * Se a pesquisa de repositórios for feita, retorne-os
  if (repos.errors.length > 0) {
    console.log(repos.errors[0].error);
    if (repos.errors[0].error === "Organization not found.") {
      return res.status(200).json(false);
    }
    return res.status(400).json(repos.errors[0].error);
  }

  return res.status(200).json(repos.repos);
});

// ! Rota de verificar se um repositório existe
router.get("/api/github/repo/:organization/:repo/exists", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { params, headers } = req;

  // * Obtendo repositório
  let organization = null;
  let repo = null;
  try {
    organization = params.organization;
    repo = params.repo;
  } catch (e) {
    return res.status(400).json({ error: "Invalid repository." });
  }

  // * Se o userId for recebido, obter os installation id para o usuario gerar o access token
  // . Obtendo installation id para o usuario/organizacao para o usuario no BD
  let installationId = null;
  if (headers["ecos-user-id"]) {
    installationId =
      await DBRequests.getInstallationIdByUserIdAndGitHubUserOrOrganization(
        headers["ecos-user-id"],
        organization
      );
  }

  // * Gerando access token para o installationId, se este for obtido
  let accessToken = null;
  if (installationId) {
    accessToken = await gitHubRequest.generateAccessTokenForInstallationID(
      installationId
    );
  }

  // * Verificando se o repositório existe
  const exists = await gitHubRequest.doesRepoExist(
    organization + "/" + repo,
    accessToken
  );

  // * Se ocorrer um erro não identificado, retorne erro
  try {
    if (exists.error) {
      return res.status(400).json(exists.error);
    }
  } catch (e) {}

  // * Senão, retorne se o repositório existe
  return res.status(200).json(exists);
});

// ! Rota do Webhook GitHub App
router.post("/api/github/installation/webhook", async (req, res) => {
  const body = req.body;

  if (body.action === "created") {
    // . Obtendo o installation id e o login do usuario/organizacao e o aprovador
    const { id: installationId } = body.installation;
    const { login: githubUserOrOrganization } = body.installation.account;
    const { login: githubUser } = body.sender;

    // . Enviar a requisicao para o BD para salvar o ID de instalacao
    await DBRequests.updateGitHubInstallationByGitHubUser(
      githubUser,
      githubUserOrOrganization,
      installationId
    );
  } else if (body.action === "deleted") {
    // . Obtendo o installation Id e o login do usuario/organizacao
    const { id: installationId } = body.installation;
    const { login: githubUserOrOrganization } = body.installation.account;

    // . Enviar a requisicao para o BD para remover o ID de instalacao
    await DBRequests.cleanGitHubInstallationByGitHubUser(
      githubUserOrOrganization,
      installationId.toString()
    );
  }

  res.status(200).json({ message: "Success" });
});

module.exports = router;
