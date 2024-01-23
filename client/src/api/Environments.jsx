import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;
import getServerError from "./ServerError.jsx";

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
