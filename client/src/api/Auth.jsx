// ! Registrando dados do usuário logado no locationStore
export const registerLoggedUser = async (userId, userToken) => {
  // . Registrando dados no localStorage
  localStorage.setItem("SECO_24_user-id", userId);
  localStorage.setItem("SECO_24_user-token", userToken);

  return true;
};

// ! Verifica se existe dados para o usuário logado registrados no locationStore
export const verifyLoggedUser = async () => {
  // . Verificando se há dados no localStorage
  let userId = false;
  let userToken = false;

  try {
    userId = localStorage.getItem("SECO_24_user-id");
    console.log("ENCONTROU ID: ", userId);
    userToken = localStorage.getItem("SECO_24_user-id");
    console.log("ENCONTROU TOKEN: ", userToken);
  } catch (e) {
    console.log("NÃO ENCONTROU: ", userId);
  }

  // . Se não houver dados, retorne null
  if (userId === false || userToken === false) {
    return null;
  }

  // . Retornando os dados formatados para o componente
  return { userId: userId, userToken: userToken };
};

// ! Remove os dados do usuário logado do locationStore
export const logOut = async () => {
  // . Removendo dados do localStorage
  localStorage.removeItem("SECO_24_user-id");
  localStorage.removeItem("SECO_24_user-token");

  return true;
};
