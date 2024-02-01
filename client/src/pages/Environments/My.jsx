import {
  TextField,
  Button,
  Link,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { DiffAddedIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { EnvironmentCard } from "./EnvironmentCard.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { RequestAgainPopUp } from "./RequestAgain.jsx";

// ! Importações de códigos
import { verifyLoggedUser, removeLoggedUser } from "../../api/Auth.jsx";
import {
  getMyEnvironments,
  setEnvironmentNameToLocalStorage,
  requestMiningData,
} from "../../api/Environments.jsx";

const MyEnvironment = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.title = "ECOS-IC: My Environments";
    document.body.style.background = "white";

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

      setLoggedUser(verifyUser);

      // . Obtendo os ambientes do usuário
      await getEnvironments(verifyUser.userId, verifyUser.userToken);
    };

    // . Executando a função
    checkUser();
  }, []);

  // ! Variáveis e funções para manipulação do Dialog carregamento
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

  // ! Variáveis e funções para manipulação do Dialog de erro/interrupção
  const [hasEnvironmentError, setHasEnvironmentError] = useState(false);
  const [environmentErrorCode, setEnvironmentErrorCode] = useState("");
  const [environmentErrorMessage, setEnvironmentErrorMessage] = useState("");
  const [action, setAction] = useState({
    environmentId: "",
    code: "",
    msg: "",
    status: "",
  });

  const activeEnvironmentErrorDialog = () => {
    let code = action.code;
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setEnvironmentErrorCode(code);
    setEnvironmentErrorMessage(action.msg);
    setHasEnvironmentError(true);
  };

  const cardClick = (environmentId, status) => {
    switch (status) {
      case "mining_error":
        setAction({
          environmentId,
          status,
          code: "Mining error",
          msg: "An error occurred while mining repositories, you can request mining again or cancel the environment.",
        });
        activeEnvironmentErrorDialog();
        break;
      case "topics_error":
        setAction({
          environmentId,
          status,
          code: "Topic generation error",
          msg: "An error occurred while generating the topics, you can request the generation again or cancel the environment.",
        });
        activeEnvironmentErrorDialog();
        break;
      case "mining_done":
        setAction({
          environmentId,
          status,
          code: "Topic generation",
          msg: "You want to request the generation of topics?",
        });
        activeEnvironmentErrorDialog();
        break;

      case "waiting_rcr_voting":
        setAction({
          environmentId,
          status,
          code: "RCR definition voting",
          msg: "You want to stop now the RCR definition voting step?",
        });
        activeEnvironmentErrorDialog();
        break;

      case "waiting_rcr_priority":
        setAction({
          environmentId,
          status,
          code: "RCR priority voting",
          msg: "You want to stop now the RCR priority voting step?",
        });
        activeEnvironmentErrorDialog();
        break;

      case "topics_done":
        setEnvironmentNameToLocalStorage(name);
        goEnvironmentDetail(environmentId);
        break;

      case "waiting_rcr_voting":
        // !! IMPLEMENTAR... (AGUARDANDO FUNÇÃO/ENDPOINT)
        break;

      case "waiting_rcr_priority":
        // !! IMPLEMENTAR... (AGUARDANDO FUNÇÃO/ENDPOINT)
        break;

      case "rcr_voting_done":
        // !! IMPLEMENTAR... (AGUARDANDO PAGINA)
        break;

      case "rcr_priority_done":
        // !! IMPLEMENTAR... (AGUARDANDO PAGINA)
        break;

      case "done":
        // !! IMPLEMENTAR... (AGUARDANDO FUNÇÃO/ENDPOINT)
        break;
      default: // * mining, making_topics, não faz nada
        break;
    }
  };

  const requestPopUpAction = async () => {
    switch (action.status) {
      case "mining_error":
        setHasEnvironmentError(false);
        await requestMiningData(
          loggedUser.userId,
          loggedUser.userToken,
          action.environmentId
        );
        setRequest({
          title: "Mining requested",
          message: "The mining of repositories has been requested.",
        });
        setRequestMade(true);
        break;

      case "topics_error":
      case "mining_done":
        setHasEnvironmentError(false);
        // !! IMPLEMENTAR... (AGUARDANDO FUNÇÃO/ENDPOINT) await...
        setRequest({
          title: "Topics generation requested",
          message: "The generation of topics has been requested.",
        });
        setRequestMade(true);
        break;

      case "waiting_rcr_voting":
        setHasEnvironmentError(false);
        // !! IMPLEMENTAR... (AGUARDANDO FUNÇÃO/ENDPOINT)
        break;

      case "waiting_rcr_priority":
        setHasEnvironmentError(false);
        // !! IMPLEMENTAR... (AGUARDANDO FUNÇÃO/ENDPOINT)
        break;

      default:
        break;
    }
  };

  const requestPopUpActionCancel = () => {
    // !! IMPLEMENTAR... (Mudança de status do ambiente para cancelado)
  };

  const closeEnvironmentErrorDialog = () => {
    setHasEnvironmentError(false);
  };

  // ! Variaveis e funçoes para manipulacao do Alert das requisicoes
  const [requestMade, setRequestMade] = useState(false);
  const [request, setRequest] = useState({ title: "", message: "" });

  const closeRequestMade = () => {
    setRequestMade(false);
  };

  // ! Funções para manipulação de dados na página
  const [loggedUser, setLoggedUser] = useState({ userId: "", userToken: "" });
  const [environments, setEnvironments] = useState([]); // . Armazena os ambientes do usuário

  // . Ir para a página de criar novo ambiente
  const goNewEnvironment = () => {
    redirect("/new-environment");
  };

  // . Ir para a página de detalhes do ambiente
  const goEnvironmentDetail = (id) => {
    redirect(`/environment/${id}`);
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
            backgroundColor={"#9fff64"}
            action={goNewEnvironment}
          />
        </Box>
        <Box className="ContainerEnvironments">
          {environments.map((env) => (
            <EnvironmentCard
              id={env.id}
              name={env.name}
              status={env.status}
              action={() => {
                cardClick(env.id, env.status);
              }}
              key={`ENV_${env.id}`}
            />
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
      <RequestAgainPopUp
        open={hasEnvironmentError}
        close={closeEnvironmentErrorDialog}
        title={environmentErrorCode}
        message={environmentErrorMessage}
        action={requestPopUpAction}
        status={action.status}
        actionCancel={requestPopUpActionCancel}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={requestMade}
        autoHideDuration={2500}
        onClose={closeRequestMade}
      >
        <Alert
          onClose={closeRequestMade}
          severity="info"
          sx={{ width: "100%" }}
        >
          <AlertTitle>{request.title}</AlertTitle>
          {request.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default MyEnvironment;
