import {
  Button,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import {
  ArrowUpIcon,
  XCircleFillIcon,
  FeedPlusIcon,
  PeopleIcon,
} from "@primer/octicons-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueModalDetail } from "../Environments/Issues/IssueModalDetail.jsx";
import { OpenRCRPriorityVotePopUp } from "./PopUps/OpenRCRPriorityVotePopUp.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";

// ! Importações de códigos
import {
  getEnvironmentIdFromUrl,
  getPriorityDataForVoting,
} from "../../api/Environments.jsx";

const PriorityDataPage = () => {
  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";
    const setPositionsToPage = (rcrs) => {
      // . Obtendo cada id e a posicao e salvando
      const votesUpdated = [];
      for (const rcr of rcrs) {
        votesUpdated.push({ id: rcr.id, position: rcr.votes_position });
      }
      setPositions(votesUpdated);
    };
    // . Função para obter os topicos
    const getDetails = async () => {
      // . Obtendo o id do ambiente
      const environmentId = getEnvironmentIdFromUrl();
      if (environmentId === null) {
        // . Mostrando erro
        setIsLoading(false);
        activeErrorDialog(
          `SECO - RCR: Getting environment detail`,
          "Error getting environment id from URL.",
          "404"
        );
        return;
      }

      // . Armazenando o id do ambiente
      setEnvironmentId(environmentId);

      // . Obtendo os ambientes do usuário
      const response = await getPriorityDataForVoting(environmentId);

      // . Verificando se ocorreu algum erro
      if (response.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${response.error.code}: Getting environment detail`,
          response.error.message,
          response.status
        );
        return;
      }

      setEnvironment(response);
      setEnvironmentName(response.name);
      setRCRS(response.priority_data.rcrs);
      setPositionsToPage(response.priority_data.rcrs);

      // . Finalizando o carregamento
      setIsLoading(false);
    };

    // . Executando a função
    getDetails();
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
  const [environment, setEnvironment] = useState({
    id: "",
    user_id: "",
    name: "",
    details: "",
    mining_type: "",
    organization_name: "",
    status: "",
    repos: [],
    priority_data: {
      rcrs: [
        {
          id: "",
          name: "",
          details: "",
          topicNum: "",
          mainIssue: {
            id: "",
            body: "",
            repo: "",
            tags: "",
            issueId: "",
          },
          relatedToIssues: [
            {
              id: "",
              body: "",
              repo: "",
              tags: "",
              issueId: "",
            },
          ],
          exclude_to_priority: true,
        },
      ], // . Armazena as RCRs do ambiente,
    },
    closing_date: "",
  });
  const [rcrs, setRCRS] = useState([
    {
      id: "",
      name: "",
      details: "",
      topicNum: "",
      mainIssue: {
        id: "",
        body: "",
        repo: "",
        tags: "",
        issueId: "",
      },
      relatedToIssues: [
        {
          id: "",
          body: "",
          repo: "",
          tags: "",
          issueId: "",
        },
      ],
      exclude_to_priority: true,
    },
  ]);
  const [positions, setPositions] = useState([]);

  const checkRCRPosition = (rcrId) => {
    console.log(rcrId);
    // . Buscando no array de rcrs
    for (const rcr of environment.priority_data.rcrs) {
      if (rcr.id === rcrId) {
        return rcr.votes_position;
      }
    }
  };

  const changeRCRPosition = (rcrId, directionOfNewPosition) => {
    const newRCRs = environment.priority_data.rcrs;
    for (let i = 0; i < newRCRs.length; i++) {
      if (newRCRs[i].id === rcrId) {
        if (directionOfNewPosition === "up") {
          if (i === 0) {
            // . Se for a primeira rcr, não faz nada
            return;
          }

          const temp = newRCRs[i].votes_position;
          newRCRs[i].votes_position = newRCRs[i - 1].votes_position;
          newRCRs[i - 1].votes_position = temp;
          break;
        } else {
          if (i === newRCRs.length - 1) {
            // . Se for a última rcr, não faz nada
            return;
          }

          const temp = newRCRs[i].votes_position;
          newRCRs[i].votes_position = newRCRs[i + 1].votes_position;
          newRCRs[i + 1].votes_position = temp;
          break;
        }
      }
    }

    // . Reordenando o array de rcrs de acordo com a nova posição
    newRCRs.sort((a, b) => a.votes_position - b.votes_position);

    // . Obtendo cada id e a posicao e salvando
    const votesUpdated = [];
    for (const rcr of rcrs) {
      votesUpdated.push({ id: rcr.id, position: rcr.votes_position });
    }
    setPositions(votesUpdated);
  };

  // ! Funcoes para manipulacao da issue
  const [issueModal, setIssueModal] = useState({
    id: null,
    issueId: "",
    repo: "",
    body: "",
    tags: "",
    score: "",
    relatedToScore: "",
  });
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const openIssueDetailModal = (issue) => {
    // . Armazenando os dados da issue
    setIssueModal(issue);
    setIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
  };

  // ! Variáveis e funções para manipulação do Dialog de salvamento do voto
  const [startRCRPriorityVoteModalOpen, setStartRCRPriorityVoteModalOpen] =
    useState(false);

  const openPriorityRCRVoteModal = () => {
    console.log(positions);
    setStartRCRPriorityVoteModalOpen(true);
  };

  const closePriorityRCRVoteModal = () => {
    setStartRCRPriorityVoteModalOpen(false);
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

            <SuccessButton
              icon={<PeopleIcon size={18} />}
              message={"Submit vote"}
              width={"180px"}
              height={"30px"}
              uppercase={false}
              marginLeft="0"
              marginRight="4em"
              backgroundColor={"#9fff64"}
              action={() => {
                openPriorityRCRVoteModal();
              }}
              visibility={Object.keys(positions) !== 0 ? "visible" : "hidden"}
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
            {environment.priority_data.rcrs.map((rcr) => {
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
                    {rcr.votes_position}
                  </Box>

                  <Accordion
                    key={`Acc-${rcr.id}`}
                    style={{ minWidth: "90%", maxWidth: "90%" }}
                  >
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
                            openIssueDetailModal(rcr.mainIssue);
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
                                openIssueDetailModal(issue);
                              }}
                            >
                              {issue.id}
                            </Button>
                          );
                        })}
                      </Box>
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
        <IssueModalDetail
          open={issueModalOpen}
          close={closeIssueModal}
          closeMessage={"BACK"}
          issue={issueModal}
        />
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
      <OpenRCRPriorityVotePopUp
        open={startRCRPriorityVoteModalOpen}
        close={closePriorityRCRVoteModal}
        vote={positions}
        environmentId={environmentId}
      />
    </ThemeProvider>
  );
};

export default PriorityDataPage;
