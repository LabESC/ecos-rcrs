import {
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  IconButton,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpIcon,
  FeedIssueDraftIcon,
  CheckCircleFillIcon,
} from "@primer/octicons-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueModalDetail } from "./Issues/IssueModalDetail.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { OpenEndEnvironmentPopUp } from "./OpenEndEnvironmentPopUp.jsx";
import EditIcon from "@mui/icons-material/Edit";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import {
  getEnvironmentIdFromUrl,
  getEnvironmentNameFromLocalStorage,
  getEnvironmentStatusFromLocalStorage,
  getFinalRCR,
  setFinalRCRLToLocalStorage,
  setFinalRCR,
  setFinalRCRAndEndEnvironment,
} from "../../api/Environments.jsx";

const EnvironmentDetailPriority = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";

    // . Funcao para obter um dicionario com as posicoes das rcrs
    const getPositions = (rcrs) => {
      const positions = {};
      rcrs.forEach((rcr, index) => {
        positions[index] = rcr.id;
      });

      return positions;
    };

    // . Função para obter os topicos
    const getDetails = async (userId, userToken) => {
      // . Obtendo o id do ambiente
      const environmentId = getEnvironmentIdFromUrl();
      if (environmentId === null) {
        // . Voltar a página anterior
        redirect("/my-environments");
        return;
      }

      // . Armazenando o id do ambiente
      setEnvironmentId(environmentId);

      // . Obtendo o nome do ambiente
      const environmentName = getEnvironmentNameFromLocalStorage();

      if (environmentName === null) {
        redirect("/my-environments");
        return;
      }

      setEnvironmentName(environmentName);
      document.title = `SECO-RCR: ${environmentName}`;

      // . Obtendo o status do ambiente
      const environmentStatus = getEnvironmentStatusFromLocalStorage();

      if (
        environmentStatus === null ||
        environmentStatus !== "rcr_priority_done"
      ) {
        redirect("/my-environments");
        return;
      }

      // . Obtendo as rcrs prioritarias do usuário
      const response = await getFinalRCR(userId, userToken, environmentId);

      // . Verificando se ocorreu algum erro
      if (response.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${response.error.code}: Getting priority RCRs`,
          response.error.message,
          response.status
        );
        return;
      }

      // . Ordenando as rcrs de acordo com a posição
      const rcrs = response.rcrs.sort((a, b) => a.position - b.position);

      // . Armazenando os ambientes
      setRCRS(rcrs);

      // . Setando o topico atual no localStorage e todos os topicos
      setFinalRCRLToLocalStorage(response);

      // . Obtendo somente a prioridade de cada rcr
      const positions = getPositions(response.rcrs);

      // . Armazenando as posições
      setPositions(positions);

      // . Finalizando o carregamento
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
      setLoggedUser(verifyUser);
      await getDetails(verifyUser.userId, verifyUser.userToken);
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
  const [environmentId, setEnvironmentId] = useState(""); // . Armazena o id do ambiente [UUID]
  const [environmentName, setEnvironmentName] = useState(""); // . Armazena o nome do ambiente
  const [rcrs, setRCRS] = useState([
    {
      id: null,
      name: null,
      details: null,
      topicNum: null,
      mainIssue: null,
      going_to_vote: null,
      relatedToIssues: [],
      definition_votes: {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        comments: [],
      },
      final_vote: null,
      position: 0,
      position: 0,
    },
  ]); // . Armazena os ambientes do usuário
  const [positions, setPositions] = useState({}); // . Armazena as posições das rcrs
  const [loggedUser, setLoggedUser] = useState({
    userId: null,
    userToken: null,
  }); // . Armazena os dados do usuário logado

  const checkRCRPosition = (rcrId) => {
    // . Buscando no array de rcrs
    for (const rcr of rcrs) {
      if (rcr.id === rcrId) {
        return rcr.position;
      }
    }
  };

  const changeRCRPosition = (rcrId, directionOfNewPosition) => {
    const newRCRs = rcrs;
    for (let i = 0; i < newRCRs.length; i++) {
      if (newRCRs[i].id === rcrId) {
        if (directionOfNewPosition === "up") {
          if (i === 0) {
            // . Se for a primeira rcr, não faz nada
            return;
          }

          const temp = newRCRs[i].position;
          newRCRs[i].position = newRCRs[i - 1].position;
          newRCRs[i - 1].position = temp;
          break;
        } else {
          if (i === newRCRs.length - 1) {
            // . Se for a última rcr, não faz nada
            return;
          }

          const temp = newRCRs[i].position;
          newRCRs[i].position = newRCRs[i + 1].position;
          newRCRs[i + 1].position = temp;
          break;
        }
      }
    }

    // . Reordenando o array de rcrs de acordo com a nova posição
    newRCRs.sort((a, b) => a.position - b.position);

    // . Obtendo cada id e a posicao e salvando
    const votesUpdated = [];
    for (const rcr of rcrs) {
      votesUpdated.push({ id: rcr.id, position: rcr.position });
    }
    setPositions({ ...votesUpdated });
  };

  // . Funcao para salvar estado atual
  const saveActualState = async () => {
    setIsLoading(true);
    const request = await setFinalRCR(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      rcrs
    );

    if (request === true) {
      setAlertContent({
        title: "Success",
        message: "Actual rcr states saved successfully!",
        severity: "success",
      });
      setIsLoading(false);
      setAlertOpen(true);
    } else {
      setAlertContent({
        title: "Error",
        message:
          "An error occurred while starting the voting! Try again later!",
        severity: "error",
      });
      setIsLoading(false);
      setAlertOpen(true);
    }
  };

  // ! Variáveis e funções para manipulação dos Alerts
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState({
    severity: "error",
    title: "Error",
    message: "An error occurred",
  });

  const openAlert = (severity, title, message) => {
    setAlertContent({
      severity: severity,
      title: title,
      message: message,
    });
    setAlertOpen(true);
    closeEditRCR();
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  const endEnvironmentAction = () => {
    console.log();
  };

  // ! Funcoes para manipulacao do popup de clone
  const [openFinish, setOpenFinish] = useState(false);

  const openFinishPopUp = () => {
    setOpenFinish(true);
  };

  const closeFinishPopUp = () => {
    setOpenFinish(false);
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <>
        <Box className="ContainerMyEnvironments">
          <Box
            style={{
              marginBottom: "1.5em",
            }}
            className="ContainerTitle"
          >
            <Typography
              variant="h5"
              style={{
                textDecoration: "underline",
                marginLeft: "1em",
                fontWeight: "bold",
              }}
            >
              {environmentName}
            </Typography>

            <Typography
              variant="h6"
              visibility={
                rcrs.length > 0
                  ? rcrs[0].id !== null
                    ? "visible"
                    : "hidden"
                  : "hidden"
              }
            >
              {"RCRs Voted: " + rcrs.length}
            </Typography>

            <SuccessButton
              icon={<CheckCircleFillIcon size={18} />}
              message={"Finish Environment"}
              width={"150px"}
              height={"35px"}
              uppercase={false}
              marginLeft="0"
              marginRight="4em"
              backgroundColor={"#9fff64"}
              action={async () => {
                openFinishPopUp();
              }}
              visibility={rcrs.length !== 0 ? "visible" : "hidden"}
            />

            <SuccessButton
              icon={<FeedIssueDraftIcon size={18} />}
              message={"Save Actual State"}
              width={"150px"}
              height={"35px"}
              uppercase={false}
              marginLeft="0"
              marginRight="4em"
              action={() => {
                saveActualState();
              }}
              backgroundColor={"#f0dfc7"}
              visibility={rcrs.length !== 0 ? "visible" : "hidden"}
            />
          </Box>
          <Box>
            <Box
              key={`box-details`}
              style={{
                display: "flex",
                minWidth: "100%",
                marginBottom: "0.3em",
              }}
            >
              Position | RCR Name
            </Box>
            {rcrs.map((rcr) => {
              return (
                <Box
                  key={`box-${rcr.id}`}
                  style={{
                    display: "flex",
                    minWidth: "100%",
                    marginBottom: "0.3em",
                  }}
                >
                  <Box
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: "0.5em",
                      minWidth: "3%",
                      maxWidth: "3%",
                    }}
                  >
                    {rcr.position}
                  </Box>
                  <Accordion key={`Acc-${rcr.id}`} style={{ minWidth: "90%" }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id={`ACC-Summ-${rcr.id}`}
                      style={{
                        fontWeight: "bold",
                        flexDirection: "row-reverse",
                        padding: "0.2em",
                      }}
                    >
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Box
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Box style={{ marginLeft: "0.4em" }}>
                            {` | ${rcr.name ? rcr.name.toUpperCase() : ""}`}
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        <strong>Description: </strong>
                        {rcr.details}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  <IconButton
                    className={
                      checkRCRPosition(rcr.id) == 1
                        ? "arrowDisabled"
                        : "arrowUpSelect"
                    }
                    onClick={() => {
                      changeRCRPosition(rcr.id, "up");
                    }}
                    style={{
                      //color: "rgba(0, 0, 0, 0.87)",
                      minWidth: "5%",
                      maxWidth: "5%",
                    }}
                  >
                    <ArrowUpIcon size={15} />
                  </IconButton>
                  <IconButton
                    className={
                      checkRCRPosition(rcr.id) == rcrs.length
                        ? "arrowDisabled"
                        : "arrowUpSelect"
                    }
                    onClick={() => {
                      changeRCRPosition(rcr.id, "down");
                    }}
                    style={{
                      //color: "rgba(0, 0, 0, 0.87)",
                      transform: "rotate(180deg)",
                    }}
                  >
                    <ArrowUpIcon
                      size={15}
                      style={{
                        minWidth: "5%",
                        maxWidth: "5%",
                      }}
                    />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Box>
      </>
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
      <OpenEndEnvironmentPopUp
        open={openFinish}
        close={closeFinishPopUp}
        environmentId={environmentId}
        loggedUser={loggedUser}
        finalRCRs={rcrs}
      />
      <Snackbar
        key={`SNACK_ERRORS_DATA`}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={alertOpen}
        autoHideDuration={alertContent.severity === "error" ? 3000 : null}
        onClose={closeAlert}
      >
        <Alert
          onClose={closeAlert}
          severity={alertContent.severity}
          sx={{ width: "100%" }}
        >
          <AlertTitle>{alertContent.title}</AlertTitle>
          {alertContent.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default EnvironmentDetailPriority;
