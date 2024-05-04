import Axios from "axios";
const baseUrl = import.meta.env.VITE_API_MICROSERVICE_BASE;
const regexGithubRepository = /^([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)$/;
import getServerError from "./ServerError.jsx";

export const getOrganizationRepos = async (organization) => {
  if (!organization) {
    return {
      error: {
        code: "Organization",
        message: "Missing organization",
      },
      status: 400,
    };
  }

  const result = await Axios.get(
    `${baseUrl}/github/organization/${organization}/repos`
  )
    .then((res) => {
      return res.data;
    })
    .catch(async (err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const doesRepoExist = async (repository) => {
  if (!repository) {
    return {
      error: {
        code: "Repository",
        message: "Missing repository",
      },
      status: 400,
    };
  }

  if (!regexGithubRepository.test(repository)) {
    return {
      error: {
        code: "Repository",
        message: "Invalid repository",
      },
      status: 400,
    };
  }
  console.log(`${baseUrl}/github/repo/${repository}/exists`);
  const result = await Axios.get(`${baseUrl}/github/repo/${repository}/exists`)
    .then((res) => {
      return res.data;
    })
    .catch(async (err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};

export const getRCRKeywords = async () => {
  const result = await Axios.get(`${baseUrl}/keywords`)
    .then((res) => {
      return res.data.keywords;
    })
    .catch(async (err) => {
      try {
        return { error: err.response.data, status: err.response.status };
      } catch (e) {
        return getServerError();
      }
    });

  return result;
};
