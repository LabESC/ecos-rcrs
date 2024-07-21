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
import { ArrowUpIcon, PeopleIcon } from "@primer/octicons-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "./SideBar.jsx";
import { IssueModalDetail } from "../Environments/Issues/IssueModalDetail.jsx";
import { OpenRCRPriorityVotePopUpNew } from "./PopUps/OpenRCRPriorityVotePopUpNew.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { CommentPopUp } from "../Environments/CommentPopUp.jsx";
import { RCROldDetailVote } from "./PopUps/RCROldDetail.jsx";

// ! Importações de códigos
import {
  getEnvironmentIdFromUrl,
  getDefinitionDataForVoting,
} from "../../api/Environments.jsx";

import { getDefinitionVoteFromLocalStorage } from "../../api/VotingUser.jsx";

const PriorityDataPageNew = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";
    const setPositionsToPage = (rcrs) => {
      // . Obtendo cada id e a posicao e salvando
      const votesUpdated = [];
      for (const rcr of rcrs) {
        votesUpdated.push({
          id: rcr.id,
          position: rcr.position,
        });
      }
      setPositions(votesUpdated);
    };

    // . Função para obter os topicos
    const getDetails = async () => {
      // . Verificando se há voto de definição registrado, se nao tiver, redirecione para a página de votação de definição
      const definitionVote = getDefinitionVoteFromLocalStorage();
      if (!definitionVote) {
        redirect(`/environment/${environmentId}/definitionvote`);
      }
      setDefinitionVote(definitionVote);

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
      const response = await getDefinitionDataForVoting(environmentId);

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

      // . Armazenando o ambiente
      setEnvironment(response);
      setEnvironmentName(response.name);

      // . Filtrando somente as issues votadas no definitionVote
      const rcrs = response.definition_data.rcrs.filter(
        (rcr) => definitionVote.findIndex((vote) => vote.id === rcr.id) !== -1
      );

      // . Recalculando posição de cada RCR
      rcrs.map((rcr, index) => {
        rcr.position = index + 1;
      });

      setRCRS(rcrs);

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
    definition_data: {
      rcrs: [
        {
          id: "",
          name: "",
          details: "",
          topicNum: "",
          priority: "",
          exclude_to_priority: true,
          olds: [],
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
      priority: "",
      exclude_to_priority: true,
      olds: [],
    },
  ]);
  const [definitionVote, setDefinitionVote] = useState([]);

  const checkRCRPosition = (rcrId) => {
    // . Buscando no array de rcrs
    for (const rcr of environment.definition_data.rcrs) {
      if (rcr.id === rcrId) {
        return rcr.position;
      }
    }
  };

  const changeRCRPosition = (rcrId, directionOfNewPosition) => {
    let newRCRs = rcrs;
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
    newRCRs = newRCRs.sort((a, b) => a.position - b.position);

    setRCRS([...newRCRs]);
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

  const openIssueOnModal = (issue) => {
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
    setStartRCRPriorityVoteModalOpen(true);
  };

  const closePriorityRCRVoteModal = () => {
    setStartRCRPriorityVoteModalOpen(false);
  };

  const getScoreDescriptionWithVoteCounts = (score, allVotes) => {
    score = parseInt(score);
    // * Contando quantos votos teve pro score, considerando que all votes é um objeto com as chaves de 1 a 5 e que voce so quer saber a quantidade de votos do score atual
    let votes = 0;
    let allVotesLength = 0;
    for (const key in allVotes) {
      if (parseInt(key)) allVotesLength = allVotesLength + allVotes[key];

      if (parseInt(key) === score) {
        votes += allVotes[key];
      }
    }

    switch (score) {
      case 1:
        return `No (${votes} votes of ${parseInt(allVotesLength)})`; //return `Strongly Disagree (${votes} votes)`;
      case 2:
        return `I don't know (${votes} votes of ${parseInt(allVotesLength)})`; //`Disagree (${votes} votes)`;
      case 3:
        return `Yes (${votes} votes of ${parseInt(allVotesLength)})`; //`Neutral (${votes} votes)`;
      /*case 4:
        return `Agree (${votes} votes)`;
      case 5:
        return `Strongly Agree (${votes} votes)`;*/
      default:
        return "No score";
    }
  };

  const getScoreDescription = (score) => {
    score = parseInt(score);

    switch (score) {
      case 1:
        return "No"; //`Strongly Disagree`;
      case 2:
        return "I don't know"; //`Disagree`;
      case 3:
        return "Yes"; //`Neutral`;
      /*case 4:
        return `Agree`;
      case 5:
        return `Strongly Agree`;*/
      default:
        console.log("no", score);
        return "No score";
    }
  };

  const getScoreColor = (score) => {
    score = parseInt(score);

    switch (score) {
      case 1:
        return `#cc0e0e`;
      /*case 2:
        return `#cc540e`;
      case 3:*/
      case 2:
        return `#998408`;
      /*case 4:
        return `#5b9e08`;
      case 5:*/
      case 3:
        return `#0c9e09`;
      default:
        return "#000000";
    }
  };

  // ! Funções para manipulação do popup de comentario
  const [commentPopUpOpen, setCommentPopUpOpen] = useState(false);
  const [commentPopUpData, setCommentPopUpData] = useState({
    score: null,
    comments: [],
  });

  const openCommentPopUp = (score, comments) => {
    setCommentPopUpData({
      score: getScoreDescription(score),
      color: getScoreColor(score),
      comments: comments,
    });
    setCommentPopUpOpen(true);
  };

  const closeCommentPopUp = () => {
    setCommentPopUpOpen(false);
  };

  // . Funções para modal de OLD RCRs
  const [oldRCROpen, setOldRCROpen] = useState(false);
  const [oldRCR, setOldRCR] = useState({
    id: null,
    name: null,
    details: null,
    relatedToIssues: [],
    mainIssue: null,
  });
  const [newRCR, setNewRCR] = useState({
    id: null,
    name: null,
    details: null,
    relatedToIssues: [],
    mainIssue: null,
  });

  const formatDate = (date) => {
    try {
      const newDate = new Date(date);
      return newDate.toLocaleDateString() + " " + newDate.toLocaleTimeString();
    } catch (e) {
      return date;
    }
  };

  const openOldRCR = (oldRCR, newRCR) => {
    setOldRCR(oldRCR);
    setNewRCR(newRCR);
    setOldRCROpen(true);
  };

  const closeOldRCR = () => {
    setOldRCROpen(false);
  };

  const scoresAcceptedForVoteDetails = ["1", "2", "3"];

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
            <Box
              style={{
                justifyContent: "flex-start",
                display: "flex",
              }}
            >
              <Typography
                variant="h5"
                style={{
                  marginLeft: "1em",
                  fontWeight: "bold",
                }}
              >
                RCR Priority vote for
              </Typography>
              <Typography
                variant="h5"
                style={{
                  textDecoration: "underline",
                  marginLeft: "0.3em",
                  fontWeight: "bold",
                }}
              >
                {environmentName}
              </Typography>
            </Box>

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
              visibility={Object.keys(rcrs) !== 0 ? "visible" : "hidden"}
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
                  key={`box-${rcr.position}`}
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
      <OpenRCRPriorityVotePopUpNew
        open={startRCRPriorityVoteModalOpen}
        close={closePriorityRCRVoteModal}
        definitionVote={definitionVote}
        priorityVote={rcrs}
        environmentId={environmentId}
      />
      <CommentPopUp
        open={commentPopUpOpen}
        close={closeCommentPopUp}
        closeMessage={"GO BACK"}
        commentScore={commentPopUpData}
      />
      <RCROldDetailVote
        open={oldRCROpen}
        close={closeOldRCR}
        oldRCR={oldRCR}
        newRCR={newRCR}
      />
    </ThemeProvider>
  );
};

export default PriorityDataPageNew;
