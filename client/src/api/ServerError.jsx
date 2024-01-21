export const getServerError = () => {
  return {
    error: {
      code: "SERVER",
      message: "Server not aswering, please try again later!",
    },
    status: 500,
  };
};
