import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;
import getServerError from "./ServerError.jsx";

const regexUUID = /^[a-z,0-9,-]{36,36}$/;

export const getEnvironmentIdFromLocalStorage = () => {
  const environmentId = localStorage.getItem("SECO_24_env-id");
  return environmentId;
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

  return environmentId;
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

export const getIssueDataFromLocalStorage = () => {
  let topicData = localStorage.getItem("SECO_24_topic-data");
  let issueData = localStorage.getItem("SECO_24_issue-data");

  if (!topicData || !issueData) {
    return null;
  }

  // . Parseando JSON string para JSON objeto
  topicData = JSON.parse(topicData);
  issueData = JSON.parse(issueData);

  return { issue: issueData, topic: topicData };
};

export const setIssueDataToLocalStorage = (issueData, topicData) => {
  if (!issueData || !topicData) {
    return;
  }

  // . Parseando JSON objeto para JSON string
  localStorage.setItem("SECO_24_topic-data", JSON.stringify(topicData));
  localStorage.setItem("SECO_24_issue-data", JSON.stringify(issueData));
};
