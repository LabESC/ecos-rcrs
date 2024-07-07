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
  githubUserOrOrganization,
  installationId
) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/user/github/installation`;

  // * Fazendo requisição
  try {
    await axios.post(
      url,
      {
        github_user: githubUser,
        github_user_or_organization: githubUserOrOrganization,
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

async function cleanGitHubInstallationByGitHubUser(
  githubUserOrOrganization,
  installationId
) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/user/github/installation`;

  // * Fazendo requisição
  try {
    await axios.delete(url, {
      headers: {
        "service-login": USER_LOGIN,
        "service-pwd": USER_PWD,
      },
      data: {
        github_user_or_organization: githubUserOrOrganization,
        installation_id: installationId,
      },
    });
    return true;
  } catch (e) {
    try {
      console.log(e.response.data ? e.response.data : e);
    } catch (e) {}

    return false;
  }
}

async function getInstallationIdByUserIdAndGitHubUserOrOrganization(
  userId,
  githubUserOrOrganization
) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/user/${userId}/github/${githubUserOrOrganization}`;

  // * Fazendo requisição
  try {
    const req = await axios.get(url, {
      headers: {
        "service-login": USER_LOGIN,
        "service-pwd": USER_PWD,
      },
    });

    if (req.data !== null) return req.data.github_installation_id;

    return req.data;
  } catch (e) {
    console.log(e.response.data);
    return null;
  }
}

async function getInstallationsIdByUserId(userId) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/user/${userId}/github/installations`;

  // * Fazendo requisição
  try {
    const req = await axios.get(url, {
      headers: {
        "service-login": USER_LOGIN,
        "service-pwd": USER_PWD,
      },
    });

    return req.data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  updateEnvironmentStatus,
  updateEnvironmentMiningData,
  getEnvironmentMiningData,
  getEnvironmentRepos,
  updateGitHubInstallationByGitHubUser,
  cleanGitHubInstallationByGitHubUser,
  getInstallationIdByUserIdAndGitHubUserOrOrganization,
  getInstallationsIdByUserId,
};
