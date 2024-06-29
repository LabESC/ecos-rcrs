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
  const { repos, environment_id, filter_type, keywords } = body;

  // * Adicionando requisição na fila
  await gitHubRequest.addQueue(repos, environment_id, filter_type, keywords);

  return res.status(200).json({ message: "Mining request received." });
});

// ! Rota de obtencao de repositorios a partir de uma organizacao
router.get("/api/github/organization/:org/repos", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { params } = req;

  // * Obtendo organização
  let org = null;
  try {
    org = params.org;
  } catch (e) {
    return res.status(400).json({ error: "Invalid organization." });
  }

  // * Obtendo repositórios da organização
  const repos = await gitHubRequest.searchOrganizationRepos(org);

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
  const { params } = req;

  // * Obtendo repositório
  let organization = null;
  let repo = null;
  try {
    organization = params.organization;
    repo = params.repo;
  } catch (e) {
    return res.status(400).json({ error: "Invalid repository." });
  }

  // * Verificando se o repositório existe
  const exists = await gitHubRequest.doesRepoExist(organization + "/" + repo);

  // * Se ocorrer um erro não identificado, retorne erro
  try {
    if (exists.error) {
      return res.status(400).json(exists.error);
    }
  } catch (e) {}

  // * Se for falso, retorne erro
  if (!exists) {
    return res.status(200).json(false);
  }

  return res.status(200).json(true);
});

// ! Rota de autenticacao do GitHub
router.post("/api/github/user/auth", (req, res) => {
  // . Obtendo o token JWT
  const token = require("./service/Octikit");

  if (req.body.github_user) {
    /*
    axios({
      method: "get",
      url: `https://api.github.com/users/${req.body.github_user}/installation`,
      //url: `https://api.github.com/user/repos?per_page=100`,
      // Set the content type header, so that we get the response in JSON
      headers: {
        accept: "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then(async (response) => {
        console.log(response.data);
        res.json(response.data);
      })
      .catch(async (error) => {
        if (error.response.status !== 404) {
          res
            .status(500)
            .json(
              "An error occurred while trying to get the installation. Please try again later."
            );
        }
      });*/

    res.redirect(
      `https://github.com/apps/seco-rcr/installations/select_target`
      //`https://github.com/login/oauth/authorize?client_id=${clientID}`
    );
  }

  res.status(422).json("The github_user was not provided.");
});

// ! Rota do Webhook GitHub App
router.post("/api/github/installation/webhook", async (req, res) => {
  const body = req.body;
  if (body.action === "created") {
    // . Obtendo o installation id e o login do usuario
    const { id: installationId } = body.installation;
    const { login: githubUser } = body.installation.account;

    // . Enviar a requisicao para o BD para salvar o ID de instalacao
    DBRequests.updateGitHubInstallationByGitHubUser(githubUser, installationId);
  } else if (body.action === "deleted") {
    // . Obtendo o login do usuario
    const { login: githubUser } = body.installation.account;

    // . Enviar a requisicao para o BD para remover o ID de instalacao
    DBRequests.cleanGitHubInstallationByGitHubUser(githubUser);
  }

  console.log(req.body);
  res.status(200).json({ message: "Success" });
});

module.exports = router;
