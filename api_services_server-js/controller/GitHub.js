// * Importando as bibliotecas
const { Router } = require("express");
const router = Router();

// * Importando módulos
const validation = require("../validations/Mining");
const { validate_service_user } = require("../service/Auth");

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

module.exports = router;
