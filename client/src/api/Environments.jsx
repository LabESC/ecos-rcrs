import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;
const apiUrl = import.meta.env.VITE_API_MICROSERVICE_BASE;
import getServerError from "./ServerError.jsx";

const regexUUID = /^[a-z,0-9,-]{36,36}$/;

export const getEnvironmentIdFromLocalStorage = () => {
  const environmentId = localStorage.getItem("SECO_24_env-id");
  return environmentId;
};

export const setEnvironmentNameToLocalStorage = (environmentName) => {
  localStorage.setItem("SECO_24_env-name", environmentName);
  return;
};

export const getEnvironmentNameFromLocalStorage = () => {
  const environmentName = localStorage.getItem("SECO_24_env-name");
  return environmentName;
};

export const getEnvironmentIdFromUrl = () => {
  // . Obtendo o id do ambiente
  const url = window.location.href;
  const urlSplit = url.split("/");
  const environmentId = urlSplit[urlSplit.length - 1];

  // . Verificando se o id é uuid
  if (!regexUUID.test(environmentId)) {
    return null;
  }

  // . Setando o id do ambiente no localStorage
  localStorage.setItem("SECO_24_env-id", environmentId);

  return environmentId;
};

export const getEnvironmentIdAndIssueIdFromUrl = () => {
  // . Obtendo o id do ambiente
  const url = window.location.href;
  const urlSplit = url.split("/");
  const issueId = urlSplit[urlSplit.length - 1];
  const environmentId = urlSplit[urlSplit.length - 3];

  // . Verificando se os ids são uuid
  if (!regexUUID.test(environmentId)) {
    return null;
  }

  return { environmentId, issueId };
};

export const getMyEnvironments = async (userId, userToken) => {
  console.log(" userId, userToken", userId, userToken);
  const result = await Axios.get(`${baseUrl}/environment/user/${userId}`, {
    headers: { "user-id": userId, "user-token": userToken },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const getEnvironmentById = async (id) => {
  const result = await Axios.get(`${baseUrl}/environment/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const createEnvironment = async (
  userId,
  userToken,
  name,
  details,
  repos,
  miningType,
  organizationName
) => {
  const result = await Axios.post(
    `${baseUrl}/environment`,
    {
      user_id: userId,
      name: name,
      details: details,
      repos: repos,
      mining_type: miningType,
      organization_name: organizationName,
      mining_data: null,
      topic_data: null,
      priority_data: null,
      final_rcr: null,
    },
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const getTopicData = async (userId, userToken, environmentId) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/topicdata`,
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const setIssueDataToLocalStorage = (issueData, topicData) => {
  if (!issueData || !topicData) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_topic-data", JSON.stringify(topicData));
  localStorage.setItem("SECO_24_issue-data", JSON.stringify(issueData));
};

export const setTopicDataToLocalStorage = (topicData) => {
  if (!topicData) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_topic-data", JSON.stringify(topicData));
};

export const getTopicDataFromLocalStorage = () => {
  let topicData = localStorage.getItem("SECO_24_topic-data");

  if (!topicData) {
    return null;
  }

  // . Parseando JSON string para JSON objeto
  topicData = JSON.parse(topicData);

  return topicData;
};

export const getIssueDataFromLocalStorage = (issueId, environmentId) => {
  const environmentLocalStorage = localStorage.getItem("SECO_24_env-id");

  if (environmentLocalStorage !== environmentId) {
    return null;
  }

  let topicData = localStorage.getItem("SECO_24_topic-data");
  if (!topicData) {
    return null;
  }

  topicData = JSON.parse(topicData);

  const issueData = topicData.issues.find(
    (issue) => issue.id === parseInt(issueId)
  );

  if (!issueData) {
    return null;
  }

  // . Obtendo dados do topico (id, name)
  const topic = {
    id: topicData.id,
    name: topicData.name,
  };

  // . Obtendo os dados das issues em relatedTo no topico e atualizando as no relatedTo da Issue
  const relatedToIssues = issueData.relatedTo.map((relatedToIssue) => {
    const issue = topicData.issues.find(
      (issue) => issue.id === relatedToIssue.id
    );
    // . Remover o atributo relatedTo
    try {
      delete issue.relatedTo;
    } catch (e) {
      console.log("Erro ao remover o atributo relatedTo da issue", e);
    }
    return { ...issue, relatedToScore: relatedToIssue.score.toFixed(5) };
  });

  // . Trocando atributo relatedToIssues da issue para a quantidade e removendo-o
  try {
    delete issueData.relatedTo;
  } catch (e) {
    console.log("Erro ao remover o atributo relatedTo da issue", e);
  }

  return { issueData, relatedToIssues, topic };
};

export const requestMiningData = async (userId, userToken, environmentId) => {
  const result = await Axios.post(
    `${apiUrl}/request/mining`,
    { environment_id: environmentId },
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const requestTopicData = async (userId, userToken, environmentId) => {
  const result = await Axios.post(
    `${apiUrl}/request/topics`,
    { environment_id: environmentId },
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const registerRCR = async (userId, userToken, environmentId, rcr) => {
  console.log("userId, userToken", userId, userToken);
  const result = await Axios.post(
    `${baseUrl}/environment/${environmentId}/prioritydata`,
    { priority_data: rcr },
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const getPriorityRCRsByEnvironmentIdAndIssueId = async (
  userId,
  userToken,
  environmentId,
  issueId
) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/prioritydata/${issueId}`,
    {
      headers: { "user-id": userId, "user-token": userToken },
    }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const getPriorityRCRs = async (userId, userToken, environmentId) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/prioritydata`,
    {
      headers: { "user-id": userId, "user-token": userToken },
    }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};
