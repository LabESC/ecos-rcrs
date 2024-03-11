import {
  Chip,
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
  Checkbox,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircleCheckedFilled from "@mui/icons-material/CheckCircle";
import CircleUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import EditIcon from "@mui/icons-material/Edit";
import { FeedIssueDraftIcon, PeopleIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueModalDetail } from "./Issues/IssueModalDetail.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { UpdateRCRPopUp } from "./RCR/UpdateRCR.jsx";
import { OpenRCRPriorityVotePopUp } from "./OpenRCRPriorityVotePopUp.jsx";
import { CommentPopUp } from "./CommentPopUp.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import {
  getEnvironmentIdFromUrl,
  getPriorityRCRs,
  setPriorityRCRLToLocalStorage,
  getEnvironmentNameFromLocalStorage,
  getEnvironmentStatusFromLocalStorage,
  getTopicData,
  setAllTopicsDataToLocalStorage,
  getIssueDataFromTopicDataAtLocalStorage,
  getIssueDataWithRelatedScoreFromTopicDataAtLocalStorage,
  setPriorityData,
} from "../../api/Environments.jsx";

const EnvironmentDetailDefinition = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";

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

      // . Obtendo o dado de topicos do ambiente
      const topicRequest = await getTopicData(userId, userToken, environmentId);

      // . Verificando se ocorreu algum erro
      if (topicRequest.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${topicRequest.error.code}: Getting topic data`,
          topicRequest.error.message["en-US"],
          topicRequest.status
        );
        return;
      }

      // . Armazenando os topicos
      setAllTopicsDataToLocalStorage(topicRequest);

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
      console.log(response.rcrs);

      // . Armazenando os ambientes
      setRCRS(response.rcrs);

      // . Setando o topico atual no localStorage e todos os topicos
      setPriorityRCRLToLocalStorage(response);

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
      votes_position: 0,
      exclude_to_priority: false,
    },
  ]); // . Armazena os ambientes do usuário
  const [loggedUser, setLoggedUser] = useState({
    userId: null,
    userToken: null,
  }); // . Armazena os dados do usuário logado

  // . Funcao para verificar se a rcr foi excluida
  const checkRCRExcluded = (rcrId) => {
    const rcr = rcrs.find((rcr) => rcr.id === rcrId);
    if (rcr === undefined) {
      return false;
    }
    return rcr.exclude_to_priority === true;
  };

  const changeRCRStatus = (rcrId) => {
    const newRCRs = rcrs;
    let arrPosition = -1;
    for (let i = 0; i < newRCRs.length; i++) {
      if (newRCRs[i].id === rcrId) {
        console.log("Achei ", rcrId, " na posicao ", i, " do array");
        arrPosition = i; // . Armazenando a posição da rcr no array
        newRCRs[i].exclude_to_priority = !newRCRs[i].exclude_to_priority; // . Invertendo o valor de exclusão
        break;
      }
    }

    console.log(newRCRs);
    setRCRS([...newRCRs]);
  };

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

  const openIssueDetailModal = (topicNum, issueId, mainIssueId = null) => {
    // . Obtendo os dados do tópico
    let issue;
    if (mainIssueId) {
      issue = getIssueDataWithRelatedScoreFromTopicDataAtLocalStorage(
        topicNum,
        issueId,
        mainIssueId
      );
    } else {
      issue = getIssueDataFromTopicDataAtLocalStorage(topicNum, issueId);
    }

    // . Verificando se ocorreu algum erro
    if (!issue) {
      activeErrorDialog(
        "Getting issue data",
        "There was an error getting the issue data",
        500
      );
      return;
    }

    // . Armazenando os dados da issue
    setIssueModal(issue);
    setIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
  };

  // ! Funções para manipulação do popup de edicao de rcr
  const [editRCROpen, setEditRCROpen] = useState(false);
  const [editRCR, setEditRCR] = useState({
    id: null,
    name: null,
    details: null,
    relatedToIssues: [],
    mainIssue: null,
  });
  const [editRCRRelatedIssues, setEditRCRRelatedIssues] = useState([]);
  const [editRCRTitle, setEditRCRTitle] = useState(""); // . Armazena o nome da RCR posta para edicao
  const [editRCRDetails, setEditRCRDetails] = useState(""); // . Armazena os detalhes da RCR posta para edicao

  const openEditRCR = (rcr) => {
    setEditRCR(rcr);
    setEditRCRTitle(rcr.name);
    setEditRCRDetails(rcr.details);
    setEditRCRRelatedIssues([...rcr.relatedToIssues]);
    setEditRCROpen(true);
  };

  const closeEditRCR = () => {
    setEditRCROpen(false);
  };

  const changeRCR = () => {
    const newRcrs = rcrs;
    for (let i = 0; i < newRcrs.length; i++) {
      if (newRcrs[i].id === editRCR.id) {
        newRcrs[i].name = editRCRTitle;
        newRcrs[i].details = editRCRDetails;
        newRcrs[i].relatedToIssues = editRCRRelatedIssues;
        break;
      }
    }
    setRCRS([...newRcrs]);
    openAlert(
      "success",
      `RCR #${editRCR.id} updated at browser.`,
      `If you want to register your actual state, please click on "Save Actual State"`
    );
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

  // ! Funções para manipulação de dados da rcr
  const saveActualState = async () => {
    setIsLoading(true);
    const request = await setPriorityData(
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

  // ! Funções para manipulação do pop up de votacao
  const [priorityVotingPopUpOpen, setPriorityVotingPopUpOpen] = useState(false);

  const openVotingStartPopUp = () => {
    // . Verificando se existe alguma rcr que foi pra votacao
    let hasRcrToVote = false;
    for (const rcr of rcrs) {
      if (rcr.exclude_to_priority === false) {
        hasRcrToVote = true;
        break;
      }
    }

    if (!hasRcrToVote) {
      openAlert(
        "error",
        "No RCR to vote",
        "There is no RCR to vote. Please, add at least one RCR to vote."
      );
      return;
    }

    setPriorityVotingPopUpOpen(true);
  };

  const closeVotingStartPopUp = () => {
    setPriorityVotingPopUpOpen(false);
  };

  const scoresAcceptedForVoteDetails = ["1", "2", "3", "4", "5"];

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
              icon={<PeopleIcon size={18} />}
              message={"Start priority voting"}
              width={"150px"}
              height={"35px"}
              uppercase={false}
              marginLeft="0"
              marginRight="4em"
              backgroundColor={"#9fff64"}
              action={() => {
                openVotingStartPopUp();
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
              backgroundColor={"#9fff64"}
              action={() => {
                saveActualState();
              }}
              visibility={rcrs.length !== 0 ? "visible" : "hidden"}
            />
          </Box>
          <Box>
            {/*<Box
              key={`box-details`}
              style={{
                display: "flex",
                minWidth: "100%",
                marginBottom: "0.3em",
              }}
            >
              Position | RCR Name
            </Box>*/}
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
                  <Checkbox
                    key={`CHCK_${rcr.id}`}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    checked={!checkRCRExcluded(rcr.id)}
                    onChange={(e) => {
                      changeRCRStatus(rcr.id);
                    }}
                    inputProps={{ "aria-label": "controlled" }}
                    color="success"
                  />
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
                        {
                          // !! INSERIR ESCALA LIKERT com o "final_vote"
                        }
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
                            openIssueDetailModal(rcr.topicNum, rcr.mainIssue);
                          }}
                        >
                          {rcr.mainIssue}
                        </Button>
                      </Box>

                      <Box style={{ alignItems: "center !important" }}>
                        <strong>Related To issues:</strong>
                        {rcr.relatedToIssues.map((issue) => {
                          return (
                            <Button
                              key={`RelIssue-${issue}`}
                              variant="outlined"
                              style={{
                                padding: "0em",
                                marginLeft: "0.4em",
                                marginTop: "0.8em",
                              }}
                              onClick={() => {
                                openIssueDetailModal(
                                  rcr.topicNum,
                                  issue,
                                  rcr.mainIssue
                                );
                              }}
                            >
                              {issue}
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
                          }}
                        >
                          {Object.keys(rcr.definition_votes).map((key) => {
                            if (!scoresAcceptedForVoteDetails.includes(key))
                              return;
                            const voteCount = rcr.definition_votes[key];

                            return (
                              <Chip
                                label={`${getScoreDescription(
                                  key
                                )} (${voteCount})`}
                                style={{
                                  marginRight: "0.5em",
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
                  <IconButton
                    onClick={() => {
                      openEditRCR(rcr);
                    }}
                    style={{
                      marginRight: "0.5em",
                    }}
                    disabled={rcr.exclude_to_priority === true ? true : false}
                  >
                    <EditIcon size={15}></EditIcon>
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
        <UpdateRCRPopUp
          open={editRCROpen}
          close={closeEditRCR}
          rcr={editRCR}
          openMainIssue={openIssueDetailModal}
          openRelatedIssue={openIssueDetailModal}
          action={changeRCR}
          issuesRcr={editRCRRelatedIssues}
          setIssuesRcr={setEditRCRRelatedIssues}
          title={editRCRTitle}
          setTitle={setEditRCRTitle}
          details={editRCRDetails}
          setDetails={setEditRCRDetails}
        />
        <OpenRCRPriorityVotePopUp
          open={priorityVotingPopUpOpen}
          close={closeVotingStartPopUp}
          rcrs={rcrs}
          environmentId={environmentId}
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

export default EnvironmentDetailDefinition;
