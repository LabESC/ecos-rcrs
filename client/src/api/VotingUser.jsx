import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;
import getServerError from "./ServerError.jsx";

export const createVotingUser = async (email) => {
  const result = await Axios.post(`${baseUrl}/votinguser/${email}`)
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

export const generateAccessCode = async (email) => {
  const result = await Axios.post(
    `${baseUrl}/votinguser/${email}/generateAccessCode`
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

export const validateAccessCode = async (email, token) => {
  const result = await Axios.get(
    `${baseUrl}/votinguser/${email}/validateAccessCode/${token}`
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

export const registerDefinitionVotes = async (
  votingUserId,
  environmentId,
  votes,
  accessCode
) => {
  const result = await Axios.post(
    `${baseUrl}/votinguser/${votingUserId}/votedefinition/${environmentId}`,
    { votes, accessCode }
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

export const registerPriorityVotes = async (
  votingUserId,
  environmentId,
  votes,
  accessCode
) => {
  const result = await Axios.post(
    `${baseUrl}/votinguser/${votingUserId}/votepriority/${environmentId}`,
    { votes, accessCode }
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

export const registerAllVotes = async (
  votingUserId,
  environmentId,
  definition_vote,
  priority_vote,
  accessCode
) => {
  const result = await Axios.post(
    `${baseUrl}/votinguser/${votingUserId}/vote/${environmentId}`,
    { definition_vote, priority_vote, accessCode }
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

export const setDefinitionVoteToLocalStorage = (definitionVote) => {
  localStorage.setItem(
    "SECO_24_voting-definition",
    JSON.stringify(definitionVote)
  );
  return;
};

export const getDefinitionVoteFromLocalStorage = () => {
  const definition = localStorage.getItem("SECO_24_voting-definition");

  if (!definition) {
    return null;
  }
  return JSON.parse(definition);
};
