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
      return { error: err.data, status: err.status };
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
      return { error: err };
    });
};

export const getUserById = async (id) => {
  await Axios.get(`${baseUrl}/user/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      return { error: err };
    });
};

export const createUser = async (email, pwd) => {
  await Axios.post(`${baseUrl}/user`, { email: email, password: pwd })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      return { error: err };
    });
};
