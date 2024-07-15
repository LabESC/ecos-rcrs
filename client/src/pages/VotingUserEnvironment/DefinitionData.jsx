import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import {
  CheckCircleFillIcon,
  PeopleIcon,
  AlertFillIcon,
} from "@primer/octicons-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import Sidebar from "./SideBar.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { OpenRCRDefinitionVotePopUp } from "./OpenRCRDefinitionVotePopUp.jsx";
import { IssueModalDetail } from "../Environments/Issues/IssueModalDetail.jsx";
import LikertScale from "./LikertScale.jsx";
import VotingScale from "./VotingScale.jsx";

// ! Importações de códigos
import {
  getDefinitionDataForVoting,
  getEnvironmentIdFromUrlVoting,
} from "../../api/Environments.jsx";

const DefinitionDataPage = () => {
  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";

    // . Função para obter os topicos
    const getDetails = async () => {
      // . Obtendo o id do ambiente
      const environmentId = getEnvironmentIdFromUrlVoting();
      if (environmentId === null) {
        // . Voltar a página anterior
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
        },
      ], // . Armazena as RCRs do ambiente,
    },
    closing_date: "",
  });
  const [scoresIssue, setScoresIssue] = useState([]); // . Armazena os scores das issues [Array de Objetos]
  const [definitionDataVoted, setDefinitionDataVoted] = useState([]);

  // ! Funções para manipulação de dados na página
  const handleScoreIssue = (newValue, issueId) => {
    const newScoresIssue = [...scoresIssue];
    const index = newScoresIssue.findIndex((issue) => issue.id === issueId);
    if (index !== -1) {
      newScoresIssue[index].score = newValue;
    } else {
      newScoresIssue.push({
        id: issueId,
        score: newValue,
      });
    }

    setScoresIssue(newScoresIssue);
  };

  const checkIssueHasVote = (issueId) => {
    const definitionData = definitionDataVoted.find(
      (issue) => issue.id === issueId
    );
    if (definitionData === undefined) {
      return false;
    }
    return true;
  };

  const registerRCRVote = async (rcrId) => {
    const comment = document.getElementById(`txt-comment-${rcrId}`).value;

    // . Verificar se o score foi preenchido
    let scoreData = scoresIssue.find((issue) => issue.id === rcrId);

    if (scoreData === undefined) {
      activeErrorDialog(
        `SECO - RCR: Registering vote`,
        "Score not filled for the RCR.",
        "400"
      );
      return;
    }

    // !! Restricao de comentario (se igual a "Não", obrigar comentario)
    if (scoreData.score === 1 && comment.trim() === "") {
      activeErrorDialog(
        `SECO - RCR: Registering vote`,
        "Comment is required for 'NO' vote.",
        "400"
      );
      return;
    }

    // . Verificar se ja existe o voto em "definitionDataVoted", se sim, alterar, senão, adicionar
    const newDefinitionDataVoted = [...definitionDataVoted];
    const index = newDefinitionDataVoted.findIndex((rcr) => rcr.id === rcrId);
    if (index !== -1) {
      newDefinitionDataVoted[index].score = scoreData.score;
      newDefinitionDataVoted[index].comment = comment;
    } else {
      newDefinitionDataVoted.push({
        id: rcrId,
        score: scoreData.score,
        comment: comment,
      });
    }

    setDefinitionDataVoted(newDefinitionDataVoted);
  };

  // ! Variáveis e funções para manipulação do Dialog de Issue
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

  // ! Variáveis e funções para manipulação do Dialog de Lista de RCR
  const [startRCRDefinitionVoteModalOpen, setStartRCRDefinitionVoteModalOpen] =
    useState(false);

  const openDefinitionRCRVoteModal = () => {
    setStartRCRDefinitionVoteModalOpen(true);
  };

  const closeDefinitionRCRVoteModal = () => {
    setStartRCRDefinitionVoteModalOpen(false);
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <Box
        className="ContainerMyEnvironments"
        style={{ width: "100% !important" }}
      >
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
              RCR Definition vote for
            </Typography>
            <Typography
              variant="h5"
              style={{
                textDecoration: "underline",
                marginLeft: "0.3em",
                fontWeight: "bold",
              }}
            >
              {environment.name}
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
              openDefinitionRCRVoteModal();
            }}
            visibility={definitionDataVoted.length !== 0 ? "visible" : "hidden"}
          />
        </Box>
        <Box>
          <Box sx={{ margin: "1.1em 1.5em" }}>
            Please populate the voting with your agreement on the requirement
            changes request.
            {/*<strong>
              Levels of agreement
            </strong>
            <ul>
              <li>1 - Strongly disagree</li>
              <li>2 - Disagree</li>
              <li>3 - Neutral</li>
              <li>4 - Agree</li>
              <li>5 - Strongly agree</li>
            </ul>*/}
          </Box>
          {environment.definition_data.rcrs.map((defData) => {
            return (
              <Box
                key={`box-${defData.id}`}
                style={{
                  display: "flex",
                  minWidth: "100%",
                  marginBottom: "0.3em",
                }}
              >
                <Accordion
                  key={`Acc-${defData.id}`}
                  style={{ minWidth: "100%" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id={`ACC-Summ-${defData.id}`}
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
                        {checkIssueHasVote(defData.id) ? (
                          <span
                            style={{
                              color: "green",
                              display: "flex",
                              justifyContent: "center",
                              marginLeft: "0.2em",
                            }}
                          >
                            <CheckCircleFillIcon size={15} />
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
                            <AlertFillIcon size={15} />
                          </span>
                        )}
                        <Box style={{ marginLeft: "0.4em" }}>
                          {`#${defData.id} - ${defData.name.toUpperCase()}`}
                        </Box>
                      </Box>
                      {
                        <VotingScale
                          onChangeLevel={handleScoreIssue}
                          rcrId={defData.id}
                        />
                      }
                      {/*<LikertScale
                          onChangeLevel={handleScoreIssue}
                          rcrId={defData.id}
                        />*/}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <strong>Details: </strong>
                      {defData.details}
                    </Typography>

                    <Box style={{ alignItems: "center !important" }}>
                      <strong>Main Issue: </strong>
                      <Button
                        variant="outlined"
                        style={{ padding: "0em", marginLeft: "0.4em" }}
                        onClick={() => {
                          openIssueOnModal(defData.mainIssue);
                        }}
                      >
                        {defData.mainIssue}
                      </Button>
                    </Box>

                    <Box style={{ alignItems: "center !important" }}>
                      <strong>Related To issues:</strong>
                      {defData.relatedToIssues.map((issue) => {
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
                            {issue}
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
                      id={`txt-comment-${defData.id}`}
                      placeholder="Comment on the RCR"
                      required
                      variant="outlined"
                      style={{ marginRight: "0.5em", width: "80%" }}
                      multiline
                      rows={4}
                    />
                  </AccordionActions>
                </Accordion>

                <Button
                  variant="filled"
                  className="btn-vote-voting-user"
                  onClick={() => {
                    registerRCRVote(defData.id);
                  }}
                >
                  <span
                    style={{
                      color: "#d2d2d2",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleFillIcon size={15} />
                  </span>
                  {
                    //<DiffAddedIcon />
                  }
                </Button>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Sidebar pageContent={pageContent} isLoading={isLoading} />
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
      <OpenRCRDefinitionVotePopUp
        open={startRCRDefinitionVoteModalOpen}
        close={closeDefinitionRCRVoteModal}
        vote={definitionDataVoted}
        environmentId={environmentId}
      />
      <IssueModalDetail
        open={issueModalOpen}
        close={closeIssueModal}
        closeMessage={"Back"}
        issue={issueModal}
      />
    </ThemeProvider>
  );
};

export default DefinitionDataPage;
