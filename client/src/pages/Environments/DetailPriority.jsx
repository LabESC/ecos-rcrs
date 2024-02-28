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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  IconButton,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpIcon,
  XCircleFillIcon,
  FeedPlusIcon,
} from "@primer/octicons-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueModalDetail } from "./Issues/IssueModalDetail.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";

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
          topicRequest.error.message,
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
      position: 0,
      votes_position: 0,
    },
  ]); // . Armazena os ambientes do usuário
  const [positions, setPositions] = useState({}); // . Armazena as posições das rcrs

  // . Funcao para verificar se a rcr foi excluida
  const checkRCRExcluded = (rcrId) => {
    const rcr = rcrs.find((rcr) => rcr.id === rcrId);
    if (rcr === undefined) {
      return false;
    }
    return rcr.definition_votes[1] > 0;
  };

  const checkRCRPosition = (rcrId) => {
    // . Buscando no array de rcrs
    for (const rcr of rcrs) {
      if (rcr.id === rcrId) {
        return rcr.position;
      }
    }
  };

  const changeRCRPosition = (rcrId, directionOfNewPosition) => {
    console.log(rcrId, directionOfNewPosition);

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
    console.log(newRCRs);
    setRCRS([...newRCRs]);
  };

  const excludeRCR = (rcrId) => {
    const newRCRs = rcrs;
    let arrPosition = -1;
    for (let i = 0; i < newRCRs.length; i++) {
      if (newRCRs[i].id === rcrId) {
        arrPosition = i; // . Armazenando a posição da rcr no array
        newRCRs[i].exclude_to_priority = !newRCRs[i].exclude_to_priority; // . Invertendo o valor de exclusão
        break;
      }
    }

    if (arrPosition === -1) return;

    // . Dependendo da condicao de exclusao da proridade, reordene o array
    if (newRCRs[arrPosition].exclude_to_priority === true) {
      // !! TODO: Erro quando a rcr e a ultima e e excluida, ao ser readicionada, ela retorna com uma posicao +1 o tamanho do array (ex: 5 rcrs, exclui a 5, ao readicionar ela fica na posicao 6)
      // . Removendo a rcr
      const removedRCR = newRCRs.splice(arrPosition, 1);

      // . Alterando a posicao das rcrs abaixo desta
      for (let i = arrPosition; i < newRCRs.length; i++) {
        newRCRs[i].position -= 1;
      }

      // . Adicionando a rcr removida no final do array e atualizando a sua posicao
      removedRCR[0].position = newRCRs.length + 1;
      newRCRs.push(removedRCR[0]);
    } else {
      // . Verificando se as issues acima deste sao removidas, se sim, ir subindo ate encontrar uma que nao seja e deixa-la na posicao abaixo
      for (let i = arrPosition; i >= 0; i--) {
        if (newRCRs[i].exclude_to_priority === false) {
          const tempPos = newRCRs[i].position + 1;

          // . Alterando a posicao das rcrs abaixo desta
          for (let j = tempPos; j < arrPosition; j++) {
            newRCRs[j].position += 1;
          }

          newRCRs[arrPosition].position = tempPos;

          break;
        }
      }

      // . Reordenar array conforme a posicao
      newRCRs.sort((a, b) => a.position - b.position);
    }

    console.log(newRCRs);
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
                  <IconButton
                    className={
                      rcr.exclude_to_priority === true
                        ? "iconButtonAdd"
                        : "iconButtonRemove"
                    }
                    onClick={() => {
                      excludeRCR(rcr.id);
                    }}
                    style={{
                      marginRight: "0.5em",
                    }}
                  >
                    {rcr.exclude_to_priority === true ? (
                      <FeedPlusIcon size={15}></FeedPlusIcon>
                    ) : (
                      <XCircleFillIcon size={15} />
                    )}
                  </IconButton>
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
                          {rcr.exclude_to_priority === true ? (
                            <span
                              style={{
                                color: "red",
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
                              {checkRCRPosition(rcr.id)} |
                            </span>
                          )}
                          <Box style={{ marginLeft: "0.4em" }}>
                            {
                              /*`#${rcr.id} - */ `${
                                rcr.name ? rcr.name.toUpperCase() : ""
                              }`
                            }
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
                    </AccordionDetails>
                    <AccordionActions
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
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
    </ThemeProvider>
  );
};

export default EnvironmentDetailPriority;
