import { TextField, Button, Link, Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { DiffAddedIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { EnvironmentCard } from "../../components/EnvironmentCard.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";

// ! Importações de códigos
import { verifyLoggedUser, removeLoggedUser } from "../../api/Auth.jsx";

const MyEnvironment = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Variáveis de estado e padrões
  const [loggedUser, setLoggedUser] = useState({
    userId: null,
    userToken: null,
  }); // . Armazena os dados do usuário
  const headerHeight = 60; // . Altura do header

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
  const [environments, setEnvironments] = useState([
    { status: "mining", name: "Env1" },
    { status: "mining_error", name: "Env2" },
    { status: "mining_done", name: "Env3" },
    { status: "making_topics", name: "Env4" },
    { status: "topics_error", name: "Env5" },
    { status: "topics_done", name: "Env6" },
    { status: "waiting_rcr_voting", name: "Env7" },
    { status: "rcr_voting_done", name: "Env8" },
    { status: "waiting_rcr_priority", name: "Env9" },
    { status: "rcr_priority_done", name: "Env10" },
    { status: "done", name: "Env11" },
  ]); // . Armazena os ambientes do usuário

  const getEnvironments = async () => {
    // . Obtendo os ambientes do usuário
    const response = await fetch(
      `http://localhost:3001/environments/${loggedUser.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggedUser.userToken}`,
        },
      }
    );

    // . Verificando se houve algum erro
    if (!response.ok) {
      const error = await response.json();
      activeErrorDialog(error.code, error.message, response.status);
      return;
    }

    // . Obtendo os ambientes
    const data = await response.json();
    setEnvironments(data);
  };

  const goToLogOut = async () => {
    await removeLoggedUser();
    return redirect("/");
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <Box className="ContainerMyEnvironments">
        <Box
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1.5em",
          }}
        >
          <SuccessButton
            icon={<DiffAddedIcon size={18} />}
            message={"New environment"}
            width={"200px"}
            height={"30px"}
            uppercase={false}
          />
        </Box>
        <Box className="ContainerEnvironments">
          {environments.map((env) => (
            <EnvironmentCard environment={env} />
          ))}
        </Box>
      </Box>
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
