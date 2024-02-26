import {
  TextField,
  Button,
  Link,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Badge,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { CheckCircleFillIcon, XCircleFillIcon } from "@primer/octicons-react";
import { Draggable } from "react-drag-reorder";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import {
  getEnvironmentIdFromUrl,
  getPriorityRCRs,
  setPriorityRCRLToLocalStorage,
  getEnvironmentNameFromLocalStorage,
  getEnvironmentStatusFromLocalStorage,
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
        positions[rcr.id] = index;
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
        environmentStatus !== "rcr_voting_done"
      ) {
        redirect("/my-environments");
        return;
      }

      // . Obtendo as rcrs prioritarias do usuário
      const response = await getPriorityRCRs(userId, userToken, environmentId);

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

      // . Armazenando os ambientes
      setRCRS(response.rcrs);

      // . Setando o topico atual no localStorage e todos os topicos
      setPriorityRCRLToLocalStorage(response);

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
    },
  ]); // . Armazena os ambientes do usuário
  const [positions, setPositions] = useState({}); // . Armazena as posições das rcrs

  // . Função para abrir o modal da issue
  const openIssueDetailModal = (issue) => {
    // !! IMPLEMENTAR
    console.log(issue);
  };

  // . Funcao para verificar se a rcr foi excluida
  const checkRCRExcluded = (rcrId) => {
    const rcr = rcrs.find((rcr) => rcr.id === rcrId);
    if (rcr === undefined) {
      return false;
    }
    return rcr.definition_votes[1] > 0;
  };

  const checkRCRPosition = (rcrId) => {
    const rcr = positions[rcrId];
    if (rcr === undefined) {
      return 0;
    }
    return rcr;
  };

  const changeRCRPosition = (rcrId, newPosition) => {};

  // . Declarando elementos da página
  const pageContent = () => {
    return (
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
        </Box>
        <Box>
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
                <Accordion key={`Acc-${rcr.id}`} style={{ minWidth: "100%" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id={`ACC-Summ-${rcr.id}`}
                    style={{
                      fontWeight: "bold",
                      flexDirection: "row-reverse",
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
                        {rcr.exclude_to_priority === true ? (
                          <span
                            style={{
                              color: "green",
                              display: "flex",
                              justifyContent: "center",
                              marginLeft: "0.2em",
                            }}
                          >
                            <XCircleFillIcon size={15} />
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#ff8700",
                              display: "flex",
                              justifyContent: "center",
                              marginLeft: "0.2em",
                            }}
                          >
                            {checkRCRPosition(rcr.id)}
                          </span>
                        )}
                        <Box style={{ marginLeft: "0.4em" }}>
                          {`#${rcr.id} - ${rcr.name.toUpperCase()}`}
                        </Box>
                      </Box>
                      {
                        // !! INSERIR ESCALA LIKERT com o "final_vote"
                      }
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <strong>Details: </strong>
                      {rcr.details}
                    </Typography>

                    <Box style={{ alignItems: "center !important" }}>
                      <strong>Main Issue: </strong>
                      <Button
                        variant="outlined"
                        style={{ padding: "0em", marginLeft: "0.4em" }}
                        onClick={() => {
                          openIssueOnModal(rcr.mainIssue);
                        }}
                      >
                        {rcr.mainIssue.id}
                      </Button>
                    </Box>

                    <Box style={{ alignItems: "center !important" }}>
                      <strong>Related To issues:</strong>
                      {rcr.relatedToIssues.map((issue) => {
                        return (
                          <Button
                            key={`RelIssue-${issue.id}`}
                            variant="outlined"
                            style={{
                              padding: "0em",
                              marginLeft: "0.4em",
                              marginTop: "0.8em",
                            }}
                            onClick={() => {
                              openIssueOnModal(issue);
                            }}
                          >
                            {issue.id}
                          </Button>
                        );
                      })}
                    </Box>
                  </AccordionDetails>
                  <AccordionActions
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong style={{ marginLeft: "8px" }}>
                      Comment on the score:
                    </strong>
                    <TextField
                      id={`txt-comment-${rcr.id}`}
                      placeholder="Comment on the RCR"
                      required
                      variant="outlined"
                      style={{ marginRight: "0.5em", width: "80%" }}
                      multiline
                      rows={4}
                    />
                  </AccordionActions>
                </Accordion>
              </Box>
            );
          })}
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

export default EnvironmentDetailPriority;
