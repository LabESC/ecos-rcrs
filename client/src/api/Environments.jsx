import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;
const apiUrl = import.meta.env.VITE_API_MICROSERVICE_BASE;
import getServerError from "./ServerError.jsx";

const regexUUID = /^[a-z,0-9,-]{36,36}$/;

// * LOCAL STORAGE
export const setEnvironmentStatusToLocalStorage = (status) => {
  localStorage.setItem("SECO_24_env-status", status);
  return;
};

export const getEnvironmentStatusFromLocalStorage = () => {
  const status = localStorage.getItem("SECO_24_env-status");
  return status;
};

export const getEnvironmentIdFromLocalStorage = () => {
  const environmentId = localStorage.getItem("SECO_24_env-id");
  return environmentId;
};

export const setEnvironmentDetailsToLocalStorage = (environment) => {
  if (!environment) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_env-details", JSON.stringify(environment));
};

export const getEnvironmentDetailsFromLocalStorage = () => {
  const environment = localStorage.getItem("SECO_24_env-details");

  if (!environment) {
    return null;
  }

  return JSON.parse(environment);
};

export const setEnvironmentNameToLocalStorage = (environmentName) => {
  localStorage.setItem("SECO_24_env-name", environmentName);
  return;
};

export const getEnvironmentNameFromLocalStorage = () => {
  const environmentName = localStorage.getItem("SECO_24_env-name");
  return environmentName;
};

export const getIssueDetailsWithRelatedScoreFromTopicDataLocalStorage = (
  issueId,
  mainIssueId,
  topicNum
) => {
  // Implementar a função que retorna os detalhes da issue com o score relacionado a mainIssue a partir dos dados do topico
  let topicData = localStorage.getItem("SECO_24_all-topic-data");

  if (!topicData) {
    return null;
  }

  // . Parseando JSON string para JSON objeto
  topicData = JSON.parse(topicData);

  // . Buscando o topico pelo numero
  const topic = topicData.find((topic) => parseInt(topic.id) === topicNum);

  // . Buscando a mainIssue no atributo "issues" do topico
  const mainIssue = topic.issues.find(
    (issue) => parseInt(issue.id) === mainIssueId
  );

  // . Buscando a issue relacionada no atributo "relatedTo" da mainIssue para obter o score relacionado a issue mãe
  const relatedIssueRelation = mainIssue.relatedTo.find(
    (relatedToIssue) => parseInt(relatedToIssue.id) === issueId
  );

  // . Buscando a issue relacionada no atributo "issues" do topico
  const relatedIssue = topic.issues.find(
    (issue) => parseInt(issue.id) === issueId
  );

  // . Relacionando o score da issue relacionada a mainIssue
  relatedIssue.relatedToScore = relatedIssueRelation.score;

  // . Removendo o atributo relatedTo
  try {
    delete relatedIssue.relatedTo;
  } catch (e) {
    console.log("Erro ao remover o atributo relatedTo da issue");
  }

  return relatedIssue;
};

export const getTopicSelectedFromLocalStorage = () => {
  const topicSelected = localStorage.getItem("SECO_24_topic-selected");
  return topicSelected;
};

export const setTopicSelectedToLocalStorage = (topicSelected) => {
  localStorage.setItem("SECO_24_topic-selected", topicSelected);
  return;
};

export const getIssueFromLocalStorage = () => {
  const issue = localStorage.getItem("SECO_24_issue-data");

  if (!issue) {
    return null;
  }

  // . Parseando JSON string para JSON objeto
  return JSON.parse(issue);
};

export const setIssueToLocalStorage = (issueData) => {
  if (!issueData) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_issue-data", JSON.stringify(issueData));
};

export const cleanIssueFromLocalStorage = () => {
  localStorage.removeItem("SECO_24_issue-data");
};

export const getEnvironmentIdFromUrlVoting = () => {
  // . Obtendo o id do ambiente
  const url = window.location.href;
  const urlSplit = url.split("/");
  const environmentId = urlSplit[urlSplit.length - 2];

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

  // . Verificando se o environmentId é uuid
  if (!regexUUID.test(environmentId)) {
    return null;
  }

  return { environmentId, issueId };
};

export const setIssueDataToLocalStorage = (issueData, topicData) => {
  if (!issueData || !topicData) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_topic-data", JSON.stringify(topicData));
  localStorage.setItem("SECO_24_issue-data", JSON.stringify(issueData));
};

export const setAllTopicsDataToLocalStorage = (topicsData) => {
  if (!topicsData) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_all-topic-data", JSON.stringify(topicsData));
};

export const getAllTopicsDataFromLocalStorage = () => {
  let topicsData = localStorage.getItem("SECO_24_all-topic-data");

  if (!topicsData) {
    return null;
  }

  // . Parseando JSON string para JSON objeto
  return JSON.parse(topicsData);
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
  let relatedToIssues = issueData.relatedTo.map((relatedToIssue) => {
    const issue = topicData.issues.find(
      (issue) => issue.id === relatedToIssue.id
    );
    // . Remover o atributo relatedTo
    try {
      delete issue.relatedTo;
    } catch (e) {
      console.log("Erro ao remover o atributo relatedTo da issue", e);
    }
    return {
      ...issue,
      relatedToScore: parseFloat(relatedToIssue.score.toFixed(5)),
    };
  });

  // . Trocando atributo relatedToIssues da issue para a quantidade e removendo-o
  try {
    delete issueData.relatedTo;
  } catch (e) {
    console.log("Erro ao remover o atributo relatedTo da issue", e);
  }

  // . Ordenando relatedToIssues por score
  relatedToIssues = relatedToIssues.sort(
    (a, b) => b.relatedToScore - a.relatedToScore
  );

  console.log("relatedToIssues", relatedToIssues);
  return { issueData, relatedToIssues, topic };
};

export const getIssueDetailsFromTopicDataLocalStorage = (issueId) => {
  let topicData = getTopicDataFromLocalStorage();
  if (!topicData) {
    return null;
  }

  let issueData = topicData.issues.find(
    (issue) => issue.id === parseInt(issueId)
  );
  if (!issueData) {
    return null;
  }

  delete issueData.relatedTo;
  return issueData;
};

export const getIssueDetailsFromTopicByTopicNumDataLocalStorage = async (
  issueId,
  topicNum
) => {
  let topicData = getAllTopicsDataFromLocalStorage();
  if (!topicData) {
    return null;
  }

  let issueData = null;
  for (const topic of topicData) {
    console.log("topicData", typeof topicNum, typeof topic.id);
    if (parseInt(topic.id) === topicNum) {
      issueData = topic.issues.find((issue) => issue.id === parseInt(issueId));
    }
  }

  if (!issueData) {
    return null;
  }

  delete issueData.relatedTo;
  return issueData;
};

export const setPriorityRCRLToLocalStorage = (priorityRCRs) => {
  if (!priorityRCRs) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_priority-rcr", JSON.stringify(priorityRCRs));
};

// * API
export const getEnvironmentIdFromUrl = () => {
  // . Obtendo o id do ambiente
  const url = window.location.href;
  const urlSplit = url.split("/");
  const environmentId = urlSplit[urlSplit.length - 2];
  console.log("environmentId", environmentId);
  // . Verificando se o id é uuid
  if (!regexUUID.test(environmentId)) {
    return null;
  }

  // . Setando o id do ambiente no localStorage
  localStorage.setItem("SECO_24_env-id", environmentId);

  return environmentId;
};

export const getEnvironmentIdFromUrl2 = () => {
  // . Obtendo o id do ambiente
  const url = window.location.href;
  const urlSplit = url.split("/");
  const environmentId = urlSplit[urlSplit.length - 1];
  console.log("environmentId", environmentId);
  // . Verificando se o id é uuid
  if (!regexUUID.test(environmentId)) {
    return null;
  }

  // . Setando o id do ambiente no localStorage
  localStorage.setItem("SECO_24_env-id", environmentId);

  return environmentId;
};

export const getMyEnvironments = async (userId, userToken) => {
  console.log(" userId, userToken", userId, userToken);
  const result = await Axios.get(`${baseUrl}/environment/user/${userId}`, {
    headers: { "user-id": userId, "user-token": userToken },
  })
    .then((res) => {
      console.log("res.data", res.data);
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
  filterType,
  organizationName,
  keywords,
  rcrKeywords,
  userFeedbackChannels,
  createdAtSince,
  createdAtUntil,
  status
) => {
  const result = await Axios.post(
    `${baseUrl}/environment`,
    {
      environment: {
        user_id: userId,
        name: name,
        details: details,
        repos: repos,
        mining_type: miningType,
        filter_type: filterType,
        organization_name: organizationName,
        mining_data: null,
        topic_data: null,
        definition_data: null,
        priority_data: null,
        final_rcr: null,
        keywords: keywords,
        rcr_keywords: rcrKeywords,
        mining_filter_date_since: createdAtSince,
        mining_filter_date_until: createdAtUntil,
        mining_issues_status: status,
      },
      userFeedbackChannels: userFeedbackChannels,
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

export const getTopicInfo = async (userId, userToken, environmentId) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/topicinfo`,
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      console.log("res.data", res.data);
      return res.data;
    })
    .catch((err) => {
      console.log("err", err);
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

export const getTopicDataByTopicNumAndPage = async (
  userId,
  userToken,
  environmentId,
  topicNum,
  page
) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/topicdata/${topicNum}/${page}`,
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
    `${baseUrl}/environment/${environmentId}/definitiondata`,
    rcr,
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

export const getDefinitionRCRsByEnvironmentIdAndIssueId = async (
  userId,
  userToken,
  environmentId,
  issueId
) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/definitiondata/${issueId}`,
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

export const getDefinitionRCRs = async (userId, userToken, environmentId) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/definitiondata`,
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

export const setPriorityData = async (
  userId,
  userToken,
  environmentId,
  priorityData
) => {
  const result = await Axios.post(
    `${baseUrl}/environment/${environmentId}/prioritydata`,
    { priority_data: priorityData },
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

export const updatePriorityRCRWithStatus = async (
  userId,
  userToken,
  environmentId,
  closingDate,
  rcrs
) => {
  const result = await Axios.patch(
    `${baseUrl}/environment/${environmentId}/prioritydata`,
    { closing_date: closingDate, priority_data_rcrs: rcrs },
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

export const updateStatus = async (
  userId,
  userToken,
  environmentId,
  status
) => {
  const result = await Axios.put(
    `${baseUrl}/environment/${environmentId}/status/${status}`,
    {},
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

export const updateDefinitionRCRWithStatus = async (
  userId,
  userToken,
  environmentId,
  closingDate,
  rcrsSelected
) => {
  const result = await Axios.patch(
    `${baseUrl}/environment/${environmentId}/definitiondata`,
    { closing_date: closingDate, rcrs_selected: rcrsSelected },
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

export const getDefinitionDataForVoting = async (environmentId) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/votingdefinitiondata`
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

export const getPriorityDataForVoting = async (environmentId) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/votingprioritydata`
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

export const getIssueDataFromTopicDataAtLocalStorage = (topicNum, issueId) => {
  const topicData = getAllTopicsDataFromLocalStorage();
  if (!topicData) {
    return null;
  }

  const topic = topicData.find((topic) => parseInt(topic.id) === topicNum);
  if (!topic) {
    return null;
  }

  const issue = topic.issues.find((issue) => parseInt(issue.id) === issueId);

  if (!issue) {
    return null;
  }

  // . Removendo o score para o topico da issue
  delete issue.score;

  return issue;
};

export const getIssueDataWithRelatedScoreFromTopicDataAtLocalStorage = (
  topicNum,
  issueId,
  mainIssueId
) => {
  console.log("topicNum, issueId, mainIssueId", topicNum, issueId, mainIssueId);
  const topicData = getAllTopicsDataFromLocalStorage();
  if (!topicData) {
    return null;
  }

  const topic = topicData.find((topic) => parseInt(topic.id) === topicNum);
  if (!topic) {
    return null;
  }

  const mainIssue = topic.issues.find(
    (issue) => parseInt(issue.id) === mainIssueId
  );

  if (!mainIssue) {
    return null;
  }

  const relatedIssueRelation = mainIssue.relatedTo.find(
    (relatedToIssue) => parseInt(relatedToIssue.id) === issueId
  );

  const relatedIssue = topic.issues.find(
    (issue) => parseInt(issue.id) === issueId
  );

  relatedIssue.relatedToScore = relatedIssueRelation.score;

  // . Removendo o score para o topico da issue
  delete relatedIssue.score;

  return relatedIssue;
};

export const forceEndVote = async (
  userId,
  userToken,
  environmentId,
  actualState
) => {
  let newVotingStatus = null;
  if (actualState === "waiting_rcr_voting") {
    newVotingStatus = "definition";
  }
  if (actualState === "waiting_rcr_priority") {
    newVotingStatus = "priority";
  }

  if (newVotingStatus === null) {
    return {
      error: {
        code: "STATUS",
        message: "Actual state invalid!",
      },
      status: 422,
    };
  }

  const result = await Axios.put(
    `${baseUrl}/environment/${environmentId}/endvoting/${newVotingStatus}`,
    {},
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

export const getFinalRCR = async (userId, userToken, environmentId) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/finaldata`,
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

export const setFinalRCR = async (
  userId,
  userToken,
  environmentId,
  finalRCR
) => {
  const result = await Axios.post(
    `${baseUrl}/environment/${environmentId}/finaldata`,
    { final_rcr: finalRCR },
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

export const setFinalRCRAndEndEnvironment = async (
  userId,
  userToken,
  environmentId,
  finalRCR
) => {
  const result = await Axios.post(
    `${baseUrl}/environment/${environmentId}/end`,
    { final_rcr: finalRCR },
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      try {
        return {
          error: err.response.data.message["en-US"],
          status: err.response.status,
        };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

export const setFinalRCRForReport = async (
  userId,
  userToken,
  environmentId
) => {
  const result = await Axios.put(
    `${baseUrl}/environment/${environmentId}/finaldata/report`,
    {},
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log("err", err);
      try {
        return {
          error: err.response.data.message["en-US"],
          status: err.response.status,
        };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

export const getFinalRCRForReport = async (
  userId,
  userToken,
  environmentId
) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/finaldata/report`,
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

export const setFinalRCRLToLocalStorage = (finalRCRs) => {
  if (!finalRCRs) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_final-rcr", JSON.stringify(finalRCRs));
};

export const cloneEnvironment = async (
  userId,
  userToken,
  environmentId,
  newName
) => {
  const result = await Axios.post(
    `${baseUrl}/environment/${environmentId}/clone`,
    { name: newName },
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log("err", err);
      try {
        return {
          error: err.response.data.message["en-US"],
          status: err.response.status,
        };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

// RCRs na definição
export const updateRCRAtDefinitionData = async (
  userId,
  userToken,
  environmentId,
  rcr
) => {
  const rcrCopy = { ...rcr };
  // . Filtrando os ids dos issues relacionados e da main issue
  rcrCopy.mainIssue = rcrCopy.mainIssue.id;
  rcrCopy.relatedToIssues = rcrCopy.relatedToIssues.map((issue) => {
    return issue.id;
  });

  const result = await Axios.put(
    `${baseUrl}/environment/${environmentId}/definitiondata/rcr`,
    rcrCopy,
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log("err", err);
      try {
        return {
          error: err.response.data.message["en-US"],
          status: err.response.status,
        };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

export const deleteRCRAtDefinitionData = async (
  userId,
  userToken,
  environmentId,
  rcr
) => {
  const result = await Axios.delete(
    `${baseUrl}/environment/${environmentId}/definitiondata/rcr`,
    { data: rcr, headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log("err", err);
      try {
        return {
          error: err.response.data.message["en-US"],
          status: err.response.status,
        };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

export const updateRCRPrioritiesAtDefinitionData = async (
  userId,
  userToken,
  environmentId,
  rcrsReprioritized
) => {
  console.log(rcrsReprioritized);
  if (rcrsReprioritized.length === 0)
    return { error: "No RCRs to update", status: 422 };

  const result = await Axios.put(
    `${baseUrl}/environment/${environmentId}/definitiondata/rcr/priorities`,
    rcrsReprioritized,
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log("err", err);
      try {
        return {
          error: err.response.data.message["en-US"],
          status: err.response.status,
        };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

export const hasRCRInDefinitionData = async (
  userId,
  userToken,
  environmentId
) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/hasrcrdefinitiondata`,
    { headers: { "user-id": userId, "user-token": userToken } }
  )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log("err", err);
      try {
        return {
          error: err.response.data.message["en-US"],
          status: err.response.status,
        };
      } catch (e) {
        return getServerError();
      }
    });
  return result;
};

export const getDefinitionRCRsNew = async (
  userId,
  userToken,
  environmentId
) => {
  const result = await Axios.get(
    `${baseUrl}/environment/${environmentId}/definitiondatanew`,
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

export const endDefinitionRCRAndGoToPriorityRCR = async (
  userId,
  userToken,
  environmentId,
  priorityData
) => {
  const result = await Axios.post(
    `${baseUrl}/environment/${environmentId}/endrcr/definition`,
    { priority_data: priorityData },
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
