// * Importando as bibliotecas
const { Router } = require("express");
const router = Router();

const axios = require("axios");

// * Importando módulos
const validation = require("../validations/Requests");

// * Importando classe DBRequests
const {
  getEnvironmentMiningData,
  getEnvironmentRepos,
  updateEnvironmentStatus,
} = require("../service/DBRequests");

const {
  TOPIC_MICROSERVICE_BASE,
  USER_LOGIN,
  USER_PWD,
} = require("../Credentials");

// ! Rota de solicitação de tópicos
router.post("/api/request/topics", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { body, headers } = req;

  // * Validando variáveis
  const valid = await validation(headers, body);

  // !! VALIDAR TAMBEM O SERVICO

  // * Se for inválido, retorne erro
  if (!valid) {
    return res.status(400).json({ error: "Invalid request." });
  }

  // * Obtendo environment_id
  const { environment_id } = body;

  // * Obtendo dados de mineração
  const miningData = await getEnvironmentMiningData(
    environment_id,
    headers["user-id"],
    headers["user-token"]
  );

  // * Solicitando geracao de topicos
  if (!miningData) {
    return res.status(400).json({ error: "Invalid request." });
  }

  // * Atualizando status de mineração no BD
  await updateEnvironmentStatus(environment_id, "making_topics");

  res.status(200).json({ message: "Topics generation request sent." });

  const url = `${TOPIC_MICROSERVICE_BASE}/topic/t2v`;
  return axios
    .post(
      url,
      {
        environment_id: environment_id,
        issues: miningData.issues,
      },
      {
        headers: {
          "user-id": headers["user-id"],
          "user-token": headers["user-token"],
        },
      }
    )
    .catch(async (err) => {
      await updateEnvironmentStatus(environment_id, "topics_error");
    });
});

// ! Rota de solicitação de mineração
router.post("/api/request/mining", async (req, res) => {
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

  // * Obtendo environment_id
  const { environment_id } = body;

  // * Obtendo dados de mineração
  const environmentData = await getEnvironmentRepos(
    environment_id,
    headers["user-id"],
    headers["user-token"]
  );

  // * Se não existir, retorne erro
  if (!environmentData) {
    return res.status(400).json({ error: "Invalid request." });
  }

  // * Atualizando status de mineração no BD
  await updateEnvironmentStatus(environment_id, "mining");

  // * Solicitando a rota de mineração github
  const baseURL = `${req.protocol}://${req.get("host")}/api`;

  res.status(200).json({ message: "Mining request sent." });
  return axios.post(
    `${baseURL}/github/mining/repos`,
    {
      environment_id: environment_id,
      repos: environmentData.repos,
      filter_type: environmentData.filter_type,
      user_id: environmentData.user_id,
      keywords: environmentData.keywords,
    },
    {
      headers: {
        "service-login": USER_LOGIN,
        "service-pwd": USER_PWD,
      },
    }
  );
});

module.exports = router;
