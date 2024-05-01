const {
  USER_LOGIN,
  USER_PWD,
  TOPIC_MICROSERVICE_BASE,
} = require("../Credentials");

const axios = require("axios");

async function getSCRFilter(environmentId, issues) {
  // * Definindo url
  const url = `${TOPIC_MICROSERVICE_BASE}/model/svm-tfidf/filter-scrs`;

  // * Fazendo requisição
  try {
    const req = await axios.post(
      url,
      { issues: issues, environment_id: environmentId },
      {
        headers: {
          "service-login": USER_LOGIN,
          "service-pwd": USER_PWD,
        },
      }
    );
    return req.data;
  } catch (e) {
    return false;
  }
}

module.exports = {
  getSCRFilter,
};
