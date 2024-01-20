import { TextField, Button, Link, Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import theme from "../../components/MuiTheme.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { EnvironmentCard } from "../../components/EnvironmentCard.jsx";
// ! Importações de componentes criados
import SideBar from "../../components/SideBar.jsx";

// ! Importações de códigos
import { verifyLoggedUser, logOut } from "../../api/Auth.jsx";

const MyEnvironment = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Variáveis de estado e padrões
  const [loggedUser, setLoggedUser] = useState({
    userId: null,
    userToken: null,
  }); // . Armazena os dados do usuário

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.title = "ECOS-IC: My Environments";

    // . Verificando se o usuário está logado e obtendo seus dados
    const verifyUser = verifyLoggedUser();
    if (verifyUser === null) {
      redirect("/");
    }

    // . Armazenando os dados do usuário
    setLoggedUser(verifyUser);
  }, []);

  // ! Variáveis e funções para manipulação dos Dialogs
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const activeErrorDialog = (code, msg, status) => {
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setErrorCode(code);
    setErrorMessage(`${status}:\n${msg}`);
    setHasLoginError(true);
  };

  const closeErrorDialog = () => {
    setHasLoginError(false);
  };

  // ! Funções para manipulação de dados na página
  const [environments, setEnvironments] = useState([{}]); // . Armazena os ambientes do usuário
  const goToLogOut = async () => {
    await logOut();
    return redirect("/");
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <EnvironmentCard
        environment={{ status: "mining", name: "Environment 1" }}
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <SideBar pageContent={pageContent} />

      <PopUpError
        open={hasLoginError}
        close={closeErrorDialog}
        title={errorCode}
        message={errorMessage}
      />
    </ThemeProvider>
  );
};

export default MyEnvironment;
