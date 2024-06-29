const {
  USER_LOGIN,
  USER_PWD,
  DB_MICROSERVICE_BASE,
} = require("../Credentials");

const axios = require("axios");

async function updateEnvironmentStatus(environmentId, status) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}/status/${status}`;

  // * Fazendo requisição
  try {
    await axios.put(url, null, {
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

async function updateEnvironmentMiningData(environmentId, miningData, status) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}/miningdata`;

  // * Fazendo requisição
  try {
    const req = await axios.post(
      url,
      {
        mining_data: miningData,
        status: status,
      },
      {
        headers: {
          "service-login": USER_LOGIN,
          "service-pwd": USER_PWD,
        },
      }
    );
    console.log(req.status);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function getEnvironmentMiningData(environmentId, userId, userToken) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}/miningdata`;

  // * Fazendo requisição
  try {
    const req = await axios.get(url, {
      headers: {
        "user-id": userId,
        "user-token": userToken,
      },
    });
    return req.data;
  } catch (e) {
    return null;
  }
}

async function getEnvironmentRepos(environmentId, userId, userToken) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}`;

  // * Fazendo requisição
  try {
    const req = await axios.get(url, {
      headers: {
        "user-id": userId,
        "user-token": userToken,
      },
    });
    return req.data;
  } catch (e) {
    console.log(e.response.data);
    return null;
  }
}

async function updateGitHubInstallationByGitHubUser(
  githubUser,
  installationId
) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/user/github/installation`;

  // * Fazendo requisição
  try {
    const req = await axios.post(
      url,
      {
        github_user: githubUser,
        installation_id: installationId,
      },
      {
        headers: {
          "service-login": USER_LOGIN,
          "service-pwd": USER_PWD,
        },
      }
    );
    return true;
  } catch (e) {
    console.log(e.response.data);
    return false;
  }
}

async function cleanGitHubInstallationByGitHubUser(githubUser) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/user/github/installation/${githubUser}`;

  // * Fazendo requisição
  try {
    await axios.delete(url, {
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
module.exports = {
  updateEnvironmentStatus,
  updateEnvironmentMiningData,
  getEnvironmentMiningData,
  getEnvironmentRepos,
  updateGitHubInstallationByGitHubUser,
  cleanGitHubInstallationByGitHubUser,
};
