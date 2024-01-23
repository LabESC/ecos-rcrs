import {
  TextField,
  Button,
  Link,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
} from "@mui/material";
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
import { getMyEnvironments } from "../../api/Environments.jsx";

const MyEnvironment = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.title = "ECOS-IC: My Environments";

    // . Função para obter os ambientes do usuário
    const getEnvironments = async (userId, userToken) => {
      // . Obtendo os ambientes do usuário
      const response = await getMyEnvironments(userId, userToken);

      // . Verificando se ocorreu algum erro
      if (response.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${response.error.code}: Getting environments`,
          response.error.message,
          response.status
        );
        return;
      }

      // . Armazenando os ambientes
      setEnvironments(response);
      setIsLoading(false);
    };

    // . Verificando se o usuário está logado e obtendo seus dados
    const checkUser = async () => {
      const verifyUser = await verifyLoggedUser();

      // . Se não houver usuário logado, redireciona para a página de login
      if (verifyUser === null) {
        redirect("/");
        return;
      }

      // . Obtendo os ambientes do usuário
      await getEnvironments(verifyUser.userId, verifyUser.userToken);
    };

    // . Executando a função
    checkUser();
  }, []);

  // ! Variáveis e funções para manipulação dos Dialogs
  const [isLoading, setIsLoading] = useState(true);
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
  const [environments, setEnvironments] = useState([]); // . Armazena os ambientes do usuário

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
            <EnvironmentCard environment={env} key={`ENV_${env.id}`} />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <SideBar pageContent={pageContent} isLoading={isLoading} />
      <Backdrop
        sx={{
          background: "rgba(0,0,0,0.5)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <CircularProgress sx={{ color: "#0084fe" }} />
      </Backdrop>
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
