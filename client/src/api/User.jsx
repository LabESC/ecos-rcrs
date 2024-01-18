import Axios from "axios";
const baseUrl = import.meta.env.VITE_DB_MICROSERVICE_BASE;

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
    .catch((err) => {
      return { error: err.response.data, status: err.response.status };
    });

  return result;
};

export const registerUser = async (name, email, password) => {
  if (!name || !email || !password) {
    return {
      error: {
        code: "Name, email or password",
        message: "Missing name, email or password",
      },
      status: 400,
    };
  }

  const result = await Axios.post(`${baseUrl}/user`, { name, email, password })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { error: err.response.data, status: err.response.status };
    });

  return result;
};

export const getUsers = async () => {
  await Axios.get(`${baseUrl}/user`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      return { error: err.response.data, status: err.response.status };
    });
};

export const getUserById = async (id) => {
  await Axios.get(`${baseUrl}/user/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      return { error: err.response.data, status: err.response.status };
    });
};

export const createUser = async (email, pwd) => {
  await Axios.post(`${baseUrl}/user`, { email: email, password: pwd })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      return { error: err.response.data, status: err.response.status };
    });
};

export const getTokenForPassword = async (email) => {
  const result = await Axios.post(
    `${baseUrl}/user/${email}/forgot-password/token`
  )
    .then((res) => {
      return res.status;
    })
    .catch((err) => {
      console.log(err);
      return { error: err.response.data, status: err.response.status };
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
      console.log(err);

      return { error: err.response.data, status: err.response.status };
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
      console.log(err);

      return { error: err.response.data, status: err.response.status };
    });
  return result;
};
