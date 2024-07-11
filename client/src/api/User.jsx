import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;
import getServerError from "./ServerError.jsx";

export const loginUser = async (email, password) => {
  if (!email || !password) {
    return {
      error: {
        code: "Email or password",
        message: "Missing email or password",
      },
      status: 400,
    };
  }

  const result = await Axios.post(`${baseUrl}/user/login`, { email, password })
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

export const registerUser = async (name, email, password, confirmPassword) => {
  if (!name || !email || !password || !confirmPassword) {
    return {
      error: {
        code: "Name, email or password",
        message: "Missing name, email or password",
      },
      status: 400,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: {
        code: "Password",
        message: "Passwords do not match",
      },
      status: 400,
    };
  }

  const result = await Axios.post(`${baseUrl}/user`, { name, email, password })
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

export const getUsers = async () => {
  const result = await Axios.get(`${baseUrl}/user`)
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

export const getUserById = async (id, token) => {
  const result = await Axios.get(`${baseUrl}/user/${id}`, {
    headers: { "user-id": id, "user-token": token },
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

export const createUser = async (email, pwd) => {
  const result = await Axios.post(`${baseUrl}/user`, {
    email: email,
    password: pwd,
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

export const getTokenForPassword = async (email) => {
  const result = await Axios.post(
    `${baseUrl}/user/${email}/forgot-password/token`
  )
    .then((res) => {
      return res.status;
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

export const validatingTokenForPassword = async (email, token) => {
  const result = await Axios.get(
    `${baseUrl}/user/${email}/validate-password-token/${token}`
  )
    .then((res) => {
      return res.status;
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

export const updatePassword = async (email, password, token) => {
  const result = await Axios.put(`${baseUrl}/user/${email}/update-password`, {
    password: password,
    token: token,
  })
    .then((res) => {
      return res.status;
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

export const updateUser = async (userId, token, name, email, githubUser) => {
  const result = await Axios.put(
    `${baseUrl}/user/${userId}`,
    {
      name: name,
      email: email,
      github_user: githubUser,
    },
    {
      headers: { "user-id": userId, "user-token": token },
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

export const updateGitHubInstallationByGitHubUser = async (
  userId,
  token,
  githubUser,
  installationId
) => {
  const result = await Axios.post(
    `${baseUrl}/user/github/installation`,
    { github_user: githubUser, installation_id: installationId },
    {
      headers: { "user-id": userId, "user-token": token },
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

export const getGitHubUserAndInstallationId = async (userId, token) => {
  const result = await Axios.get(`${baseUrl}/user/${userId}/github`, {
    headers: { "user-id": userId, "user-token": token },
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

export const activate = (id) => {
  return Axios.post(`${baseUrl}/user/${id}/activate`)
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
};
