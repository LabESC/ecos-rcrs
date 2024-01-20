import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;

export const getMyEnvironments = async (userId) => {
  await Axios.get(`${baseUrl}/environment/user/${userId}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      return { error: err.response.data, status: err.response.status };
    });
};

export const getEnvironmentById = async (id) => {
  await Axios.get(`${baseUrl}/environment/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      return { error: err.response.data, status: err.response.status };
    });
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
  await Axios.post(
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
      console.log(err);

      return { error: err.response.data, status: err.response.status };
    });
};
