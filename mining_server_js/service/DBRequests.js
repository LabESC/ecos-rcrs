const {
  USER_LOGIN,
  USER_PWD,
  DB_MICROSERVICE_BASE,
} = require("../Credentials");

const axios = require("axios");

async function updateEnvironmentStatus(environment_id, status) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environment_id}/status/${status}`;

  // * Fazendo requisição
  try {
    await axios.put(url, {
      headers: {
        "service-login": USER_LOGIN,
        "service-pwd": USER_PWD,
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function updateEnvironmentMiningData(
  environment_id,
  mining_data,
  status
) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environment_id}/mining_data`;

  // * Fazendo requisição
  try {
    await axios.post(url, {
      headers: {
        "service-login": USER_LOGIN,
        "service-pwd": USER_PWD,
      },
      data: {
        mining_data: mining_data,
        status: status,
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  updateEnvironmentStatus,
  updateEnvironmentMiningData,
};
