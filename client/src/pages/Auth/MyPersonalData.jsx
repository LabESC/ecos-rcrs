import {
  Box,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Typography,
  Tooltip,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { DiffAddedIcon, SyncIcon } from "@primer/octicons-react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import "color-legend-element";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { GitHubButton, SuccessButton } from "../../components/Buttons.jsx";

// ! Importações de códigos
import { verifyLoggedUser, removeLoggedUser } from "../../api/Auth.jsx";
import {
  requestMiningData,
  requestTopicData,
  forceEndVote,
} from "../../api/Environments.jsx";

import { getUserById, updateUser } from "../../api/User.jsx";

const MyPersonalData = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.title = "SECO-RCR: My Data";
    document.body.style.background = "white";

    // . Função para obter os ambientes do usuário
    const getMyData = async (userId, userToken) => {
      // . Obtendo os ambientes do usuário
      const response = await getUserById(userId, userToken);

      // . Verificando se ocorreu algum erro
      if (response.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${response.error.code}: Getting my data`,
          response.error.message,
          response.status
        );
        return;
      }

      // . Armazenando os dados do usuario
      setMyData(response);
      setName(response.name);
      setEmail(response.email);
      setGithubUser(response.github_user ? response.github_user : "");
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
      await getMyData(verifyUser.userId, verifyUser.userToken);
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

  // ! Variaveis e funçoes para manipulacao do Alert das requisicoes
  const [requestMade, setRequestMade] = useState(false);
  const [request, setRequest] = useState({ title: "", message: "" });

  const closeRequestMade = () => {
    setRequestMade(false);
  };

  // ! Funções para manipulação de dados na página
  const [loggedUser, setLoggedUser] = useState({ userId: "", userToken: "" });
  const [myData, setMyData] = useState([]); // . Armazena os dados do usuário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [githubUser, setGithubUser] = useState("");

  // ! Função para atualizar os dados do usuário
  const updateUserData = async () => {
    setIsLoading(true);

    // . Atualizando os dados do usuário
    const response = await updateUser(
      loggedUser.userId,
      loggedUser.userToken,
      name,
      email,
      githubUser
    );

    // . Verificando se ocorreu algum erro
    if (response.error) {
      setIsLoading(false);
      activeErrorDialog(
        `${response.error.code}: Updating my data`,
        response.error.message,
        response.status
      );
      return;
    }

    // . Atualizando os dados do usuário
    console.log(response);
    setMyData(response);
    setIsLoading(false);

    // . Exibindo mensagem de sucesso
    setRequest({
      title: "Success",
      message: "Your data was successfully updated.",
    });
    setRequestMade(true);
  };

  const openGitHubAuth = async () => {
    window.open(
      "https://github.com/apps/seco-rcr/installations/select_target",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <Box
        className="ContainerMyEnvironments"
        style={{
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Box
          className="ButtonArea"
          sx={{
            alignItems: "center !important",
          }}
        >
          <Typography className="TextFieldLabel">Name</Typography>
          <TextField
            id="txt-name"
            variant="outlined"
            style={{ width: "50%" }}
            placeholder="Insert your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Box>
        <Box
          className="ButtonArea"
          sx={{
            alignItems: "center !important",
          }}
        >
          <Typography className="TextFieldLabel">E-mail</Typography>
          <TextField
            id="txt-email"
            variant="outlined"
            style={{ width: "50%" }}
            disabled
            placeholder="Insert the name of the environment"
            value={email}
          />
        </Box>
        <Box
          className="ButtonArea"
          sx={{
            alignItems: "center !important",
          }}
        >
          <Typography className="TextFieldLabel">GitHub User</Typography>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center !important",
            }}
          >
            <TextField
              id="txt-name"
              variant="outlined"
              style={{ width: "52%", marginRight: "1em" }}
              placeholder="Insert your GitHub user"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
            />
            <GitHubButton
              visibility={myData.github_user ? "visible" : "hidden"}
              action={openGitHubAuth}
              message="Sign In with Your GitHub Account"
              marginLeft="0"
              marginRight="0"
            />
          </Box>
        </Box>
        <SuccessButton
          message="Update My Data"
          action={updateUserData}
          marginRight="0"
          marginLeft="0"
        />
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <SideBar pageContent={pageContent} isLoading={isLoading} />
      <PopUpError
        open={hasLoginError}
        close={closeErrorDialog}
        title={errorCode}
        message={errorMessage}
      />
      <Snackbar
        key="SNACK_REQ_INFO"
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
      <Backdrop
        sx={{
          background: "rgba(0,0,0,0.5)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <CircularProgress sx={{ color: "#0084fe" }} />
      </Backdrop>
    </ThemeProvider>
  );
};

export default MyPersonalData;
