import {
  Chip,
  Button,
  Link,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FileSymlinkFileIcon } from "@primer/octicons-react";
import Papa from "papaparse";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueModalDetail } from "./Issues/IssueModalDetail.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { CommentPopUp } from "./CommentPopUp.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import {
  getEnvironmentIdFromUrl,
  getFinalRCRForReport,
  setFinalRCRLToLocalStorage,
  getEnvironmentNameFromLocalStorage,
  getEnvironmentStatusFromLocalStorage,
} from "../../api/Environments.jsx";

const EnvironmentFinalReport = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Definindo o regex para caracteres inválidos para nome de arquivo
  const invalidFileNameCharsRegex = /[\\/:\*\?"<>\|]/g;

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";

    const getScoreDescription = (score) => {
      score = parseInt(score);

      switch (score) {
        case 1:
          return `Strongly Disagree`;
        case 2:
          return `Disagree`;
        case 3:
          return `Neutral`;
        case 4:
          return `Agree`;
        case 5:
          return `Strongly Agree`;
        default:
          return "No score";
      }
    };

    const generateCSVPapaparse = (rcrs, filename) => {
      const data = [];

      rcrs.forEach((rcr) => {
        data.push({
          priority: rcr.votes_position,
          id: rcr.id,
          name: rcr.name,
          details: rcr.details,
          mainIssue: rcr.mainIssue.url,
          relatedToIssues: rcr.relatedToIssues
            .map((issue) => issue.url)
            .toString(),
          definitions_vote_count_strongly_agree: rcr.definition_votes[5],
          definitions_vote_count_agree: rcr.definition_votes[4],
          definitions_vote_count_neutral: rcr.definition_votes[3],
          definitions_vote_count_disagree: rcr.definition_votes[2],
          definitions_vote_count_strongly_disagree: rcr.definition_votes[1],
          final_vote: getScoreDescription(rcr.final_vote),
        });
      });

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      setCSVURL(url);
      setCSVFilename(filename.replace(invalidFileNameCharsRegex, "_"));
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

      if (environmentStatus === null || environmentStatus !== "done") {
        redirect("/my-environments");
        return;
      }

      // . Obtendo as rcrs finais do ambiente
      const response = await getFinalRCRForReport(
        userId,
        userToken,
        environmentId
      );
      console.log(response);

      // . Verificando se ocorreu algum erro
      if (response.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${response.error.code}: Getting final RCRs`,
          response.error.message,
          response.status
        );
        return;
      }
      console.log(response.final_data.rcrs);

      // . Armazenando os ambientes
      setRCRS(response.final_data.rcrs);

      // . Setando o topico atual no localStorage e todos os topicos
      setFinalRCRLToLocalStorage(response.final_data.rcrs);

      generateCSVPapaparse(response.final_data.rcrs, environmentName);

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
      mainIssue: {
        id: "",
        body: "",
        repo: "",
        tags: "",
        issueId: "",
        url: "",
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
      definition_votes: {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        comments: [],
      },
      final_vote: null,
      votes_position: 0,
      exclude_to_priority: false,
    },
  ]); // . Armazena os ambientes do usuário
  const [loggedUser, setLoggedUser] = useState({
    userId: null,
    userToken: null,
  }); // . Armazena os dados do usuário logado

  const getScoreDescriptionWithVoteCounts = (score, allVotes) => {
    score = parseInt(score);
    // * Contando quantos votos teve pro score, considerando que all votes é um objeto com as chaves de 1 a 5 e que voce so quer saber a quantidade de votos do score atual
    let votes = 0;
    for (const key in allVotes) {
      if (parseInt(key) === score) {
        votes += allVotes[key];
      }
    }

    switch (score) {
      case 1:
        return `Strongly Disagree (${votes} votes)`;
      case 2:
        return `Disagree (${votes} votes)`;
      case 3:
        return `Neutral (${votes} votes)`;
      case 4:
        return `Agree (${votes} votes)`;
      case 5:
        return `Strongly Agree (${votes} votes)`;
      default:
        return "No score";
    }
  };

  const getRCRScoreDescriptionWithVoteCountsAndPercent = (score, allVotes) => {
    score = parseInt(score);

    // * Contando quantos votos teve pro score, considerando que all votes é um objeto com as chaves de 1 a 5 e que voce so quer saber a quantidade de votos do score atual
    let votes = 0;
    let allVotesLength = 0;

    for (const key in allVotes) {
      if (parseInt(key) === score) {
        votes += allVotes[key];
      }
      if (parseInt(key)) allVotesLength += allVotes[key];
    }

    let percent = (votes / allVotesLength) * 100;
    percent = isNaN(percent) ? 0 : percent.toFixed(2);

    switch (score) {
      case 1:
        return `Strongly Disagree (${votes} votes - ${percent}%)`;

      case 2:
        return `Disagree (${votes} votes - ${percent}%)`;
      case 3:
        return `Neutral (${votes} votes - ${percent}%)`;
      case 4:
        return `Agree (${votes} votes - ${percent}%)`;
      case 5:
        return `Strongly Agree (${votes} votes - ${percent}%)`;
      default:
        return "No score";
    }
  };

  const getScoreDescription = (score) => {
    score = parseInt(score);

    switch (score) {
      case 1:
        return `Strongly Disagree`;
      case 2:
        return `Disagree`;
      case 3:
        return `Neutral`;
      case 4:
        return `Agree`;
      case 5:
        return `Strongly Agree`;
      default:
        return "No score";
    }
  };

  const getScoreColor = (score) => {
    score = parseInt(score);

    switch (score) {
      case 1:
        return `#cc0e0e`;
      case 2:
        return `#cc540e`;
      case 3:
        return `#998408`;
      case 4:
        return `#5b9e08`;
      case 5:
        return `#0c9e09`;
      default:
        return "No score";
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

  // ! Funções para manipulação do alerta
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

  const scoresAcceptedForVoteDetails = ["1", "2", "3", "4", "5"];

  // ! Funções para exportacao da rcr
  const [csvURL, setCSVURL] = useState(null); // . Armazena o link para download do CSV
  const [csvFilename, setCSVFilename] = useState(""); // . Armazena o nome do arquivo [CSV]

  const exportAsCSV2 = async () => {
    if (csvURL !== null) {
      setIsLoading(true);

      // . Criando um elemento com o link para download do arquivo
      const a = document.createElement("a");
      a.setAttribute("href", csvURL);
      a.setAttribute("download", csvFilename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsLoading(false);
    }
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
              {"RCRs processed: " + rcrs.length}
            </Typography>

            <SuccessButton
              icon={<FileSymlinkFileIcon size={16} />}
              message={"Export to CSV"}
              width={"150px"}
              height={"35px"}
              uppercase={false}
              marginLeft="0"
              marginRight="4em"
              backgroundColor={"#9fff64"}
              action={() => {
                //exportAsCSV();
                exportAsCSV2();
              }}
              visibility={rcrs.length !== 0 ? "visible" : "hidden"}
            />
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
                    style={{ minWidth: "92%", maxWidth: "92%" }}
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
                            {
                              /*`#${rcr.id} - */ `${
                                rcr.name ? rcr.name.toUpperCase() : ""
                              }`
                            }
                          </Box>
                        </Box>
                        <Box style={{ marginRight: "1em" }}>
                          <Typography>
                            Most votes at:
                            <strong
                              style={{
                                color: getScoreColor(rcr.final_vote),
                                marginLeft: "0.3em",
                              }}
                            >
                              {getScoreDescriptionWithVoteCounts(
                                rcr.final_vote,
                                rcr.definition_votes
                              )}
                            </strong>
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        <strong>Description: </strong>
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
                      <Box
                        key={`box-voting_details-${rcr.id}`}
                        style={{
                          margin: "0.8em 0 0.2em 0",
                          width: "100%",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <strong>Voting details:</strong>
                        <Box
                          style={{
                            marginRight: "0.5em",
                            width: "90%",
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                          }}
                        >
                          {Object.keys(rcr.definition_votes).map((key) => {
                            if (!scoresAcceptedForVoteDetails.includes(key))
                              return;
                            const voteCount = rcr.definition_votes[key];

                            return (
                              <Chip
                                label={`${getRCRScoreDescriptionWithVoteCountsAndPercent(
                                  key,
                                  rcr.definition_votes
                                )}`}
                                style={{
                                  marginRight: "0.5em",
                                  marginTop: "0.5em",
                                  color: getScoreColor(key),
                                  fontWeight: "bold",
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>

                      {Object.keys(rcr.definition_votes.comments).map((key) => {
                        const comments = rcr.definition_votes.comments[key];
                        if (comments.length < 1) return;

                        console.log(key, comments);
                        return (
                          <Box
                            key={`box-voting_details-${rcr.id}`}
                            style={{
                              margin: "0.8em 0 0.2em 0",
                              width: "100%",
                              display: "flex",
                              flexDirection: "row",
                            }}
                          >
                            <strong>Voting comments:</strong>
                            <Box
                              style={{
                                marginRight: "0.5em",
                                width: "90%",
                                display: "flex",
                                flexDirection: "row",
                              }}
                            >
                              <Chip
                                label={`${getScoreDescription(key)} (${
                                  comments.length
                                })`}
                                style={{
                                  marginRight: "0.5em",
                                  color: getScoreColor(key),
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  openCommentPopUp(key, comments);
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}

                      <Box
                        style={{
                          margin: "0.8em 0 0.2em 0",
                          width: "100%",
                          display:
                            rcr.definition_votes.comments.length > 0
                              ? "flex"
                              : "none",
                          flexDirection: "row",
                        }}
                      >
                        <strong>Comments on the score:</strong>
                        <Box
                          style={{
                            marginRight: "0.5em",
                            width: "90%",
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          {Object.keys(rcr.definition_votes.comments).map(
                            (key, comments) => {
                              if (comments.length < 1) return;

                              return (
                                <Chip
                                  label={`${getScoreDescription(key)}`}
                                  onClick={() => {
                                    openCommentPopUp(comments);
                                  }}
                                  style={{
                                    marginRight: "0.5em",
                                    color: getScoreColor(key),
                                    fontWeight: "bold",
                                  }}
                                />
                              );
                            }
                          )}
                        </Box>
                      </Box>
                    </AccordionDetails>
                    <AccordionActions
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    ></AccordionActions>
                  </Accordion>
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
        <CommentPopUp
          open={commentPopUpOpen}
          close={closeCommentPopUp}
          closeMessage={"GO BACK"}
          commentScore={commentPopUpData}
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
    </ThemeProvider>
  );
};

export default EnvironmentFinalReport;
