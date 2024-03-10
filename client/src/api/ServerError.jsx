const getServerError = () => {
  return {
    error: {
      code: "SERVER",
      message: {
        "en-US": "Server not aswering, please try again later!",
        "pt-BR":
          "Servidor não está respondendo, por favor tente novamente mais tarde!",
      },
    },
    status: 500,
  };
};

export default getServerError;
