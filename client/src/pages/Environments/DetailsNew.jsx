import {
  Tooltip,
  IconButton,
  Link,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Pagination,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { InfoIcon, RepoIcon, PeopleIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueCard } from "./Issues/IssueCard.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { ListAssociatedRCRsEnvPopUp } from "./RCR/ListAssociatedRCRsEnvironment.jsx";
import { OpenRCRDefinitionVotePopUp } from "./OpenRCRDefinitionVotePopUp.jsx";
import { DetailsEnvironmentModal } from "./DetailsEnvironmentModal.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import {
  setTopicDataToLocalStorage,
  getEnvironmentIdFromUrl,
  getEnvironmentDetailsFromLocalStorage,
  getTopicData,
  getTopicDataFromLocalStorage,
  getEnvironmentNameFromLocalStorage,
  getDefinitionRCRs,
  setAllTopicsDataToLocalStorage,
  getEnvironmentIdFromUrl2,
  // ! Novos
  getTopicInfo,
  getTopicDataByTopicNumAndPage,
  setIssueToLocalStorage,
  hasRCRInDefinitionData,
} from "../../api/Environments.jsx";

const EnvironmentDetailNew = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";

    // . Função para obter os topicos
    const getDetails = async (userId, userToken) => {
      // . Obtendo o id do ambiente
      const environmentId = getEnvironmentIdFromUrl2();

      // . Armazenando o id do ambiente
      setEnvironmentId(environmentId);

      // . Obtendo o nome do ambiente
      const environmentName = getEnvironmentNameFromLocalStorage();

      setEnvironmentName(environmentName);
      document.title = `SECO-RCR: ${environmentName}`;

      // . Obtendo os dados do tópico do ambiente
      const responseinfo = await getTopicInfo(userId, userToken, environmentId);
      const responseActual = await getTopicDataByTopicNumAndPage(
        userId,
        userToken,
        environmentId,
        actualTopic,
        page
      );

      setTopics(responseinfo);
      setTopicIssuesData(responseActual);
      setMaxPage(Math.ceil(responseinfo[actualTopic].length / 24));

      // . Setando o topico atual no localStorage e todos os topicos
      setActualTopic(actualTopic);

      // . Obtendo rcrs prioritarias associadas
      /* const definitionRCRs = await getDefinitionRCRs(
        userId,
        userToken,
        environmentId
      );

      if (definitionRCRs.error) {
        setIsLoading(false);
        if (definitionRCRs.status === 404) {
          return;
        }

        activeErrorDialog(
          `${definitionRCRs.error.code}: Getting definition RCRs`,
          definitionRCRs.error.message,
          definitionRCRs.status
        );
        return;
      }

      // . Setando as rcrs prioritarias
      setDefinitionRCRs(definitionRCRs.rcrs);
*/
      const hasRCR = await hasRCRInDefinitionData(
        userId,
        userToken,
        environmentId
      );

      if (!hasRCR.error) {
        setHasRCR(hasRCR);
      }

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

      // . Armazenando os dados do usuário
      setLoggedUser(verifyUser);

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
  const [loggedUser, setLoggedUser] = useState({}); // . Armazena os dados do usuário logado
  const [environmentId, setEnvironmentId] = useState(""); // . Armazena o id do ambiente [UUID]
  const [environmentName, setEnvironmentName] = useState(""); // . Armazena o nome do ambiente
  const [topics, setTopics] = useState([
    { id: null, issues: "", name: "", topic: "" },
  ]); // . Armazena os ambientes do usuário
  const [actualTopic, setActualTopic] = useState(0); // . Armazena o ambiente atual
  const [page, setPage] = useState(1); // . Armazena a página atual
  const [maxPage, setMaxPage] = useState(1); // . Armazena a quantidade máxima de páginas do topico atual
  const [topicIssuesData, setTopicIssuesData] = useState([]); // . Armazena os dados das issues do tópico atual [Array]
  const [hasRCR, setHasRCR] = useState(false); // . Armazena se o ambiente possui RCRs [Boolean]
  const [definitionRCRs, setDefinitionRCRs] = useState([]); // . Armazena as RCRs prioritarias [Array]

  // . Função para ir a pagina da issue
  const goToissueDetail = (issue) => {
    // . Obtendo o nome do topico da issue
    issue.topicName = topics[issue.topicNum].name;
    setIssueToLocalStorage(issue);
    redirect(`/environment/${environmentId}/issue/${issue.id}`);
  };

  // ! Variáveis e funções para manipulação do Dialog de Lista de RCR
  const [priorityRCRListModalOpen, setPriorityRCRListModalOpen] =
    useState(false);

  const openPriorityListRcrModal = () => {
    setPriorityRCRListModalOpen(true);
  };

  const closePriorityListRcrModal = () => {
    setPriorityRCRListModalOpen(false);
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

  // ! Variáveis e funções para manipulação do Dialog de Detalhes do Environment
  const [detailsModal, setDetailsModal] = useState(false);

  const openDetailsModal = () => {
    setDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setDetailsModal(false);
  };

  // ! Funçao pra mudar de topico
  const changeActualTopic = async (e) => {
    setActualTopic(e.target.value);
    setPage(1);
    setMaxPage(Math.ceil(topics[e.target.value].length / 24));
    setIsLoading(true);

    const newTopicData = await getTopicDataByTopicNumAndPage(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      e.target.value,
      1
    );

    setTopicIssuesData(newTopicData);
    setIsLoading(false);
  };

  // ! Função pra mudar de pagina
  const changePage = async (newPage) => {
    setIsLoading(true);
    // Buscando dados do topico atual pra nova pagina
    const newTopicData = await getTopicDataByTopicNumAndPage(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      actualTopic,
      newPage
    );

    // Setando os dados do topico atual
    setPage(newPage);
    setTopicIssuesData(newTopicData);
    setIsLoading(false);
  };

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
          <Tooltip title="Details of environment">
            <IconButton
              onClick={() => {
                openDetailsModal();
              }}
              sx={{
                fontSize: "0.8em",
                color: "rgba(0, 0, 0, 0.87)",
                bgcolor: "rgba(40, 202, 244, 0.52)",
                transition: "0.2s",
                "&:hover": {
                  bgcolor: "rgba(141, 226, 248, 0.52)",
                },
              }}
              aria-label="copy-url"
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>

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
            message={"Start RCR Definition Voting"}
            width={"220px"}
            height={"30px"}
            uppercase={false}
            marginLeft="0"
            marginRight="4em"
            backgroundColor={"#9fff64"}
            action={() => {
              openDefinitionRCRVoteModal();
            }}
            visibility={hasRCR ? "visible" : "hidden"}
          />

          <SuccessButton
            icon={<RepoIcon size={18} />}
            message={"List RCR"}
            width={"200px"}
            height={"30px"}
            uppercase={false}
            marginLeft="0"
            marginRight="4em"
            backgroundColor={"#75d5ff"}
            action={() => {
              openPriorityListRcrModal();
            }}
            visibility={hasRCR ? "visible" : "hidden"}
          />
        </Box>
        <FormControl
          fullWidth
          id="areaSlcTopic"
          className="ContainerMyEnvironments"
        >
          <InputLabel id="slcTopicLbl">Topic</InputLabel>
          <Select
            labelId="slcTopicLbl"
            id="slcTopic"
            value={actualTopic}
            label="Topic"
            onChange={(e) => changeActualTopic(e)}
          >
            {topics.map((env) => {
              return (
                <MenuItem
                  key={`MnItSlcTopic-${env.id}`}
                  value={env.id}
                  style={{ whiteSpace: "normal" }}
                >
                  {env.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Box
          className="ContainerEnvironments"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            margin: "0.5em 0.3em",
          }}
        >
          {topicIssuesData // topics.length !== 0 && topics[actualTopic].issues !== ""
            ? topicIssuesData.map((issue) => {
                return (
                  <IssueCard
                    key={`EnvCard-${issue.id}`}
                    id={issue.id}
                    issue={issue}
                    onClick={() => goToissueDetail(issue)}
                  />
                );
              })
            : ""}
        </Box>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "0.5em",
          }}
        >
          <Pagination
            color="primary"
            count={maxPage}
            page={page}
            onChange={(_, v) => changePage(v)}
          />
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
      <ListAssociatedRCRsEnvPopUp
        open={priorityRCRListModalOpen}
        close={closePriorityListRcrModal}
        environmentId={environmentId}
        environmentName={environmentName}
        setIsLoading={setIsLoading}
        openVotingModal={openDefinitionRCRVoteModal}
      />
      <OpenRCRDefinitionVotePopUp
        open={startRCRDefinitionVoteModalOpen}
        close={closeDefinitionRCRVoteModal}
        //rcrs={definitionRCRs}
        environmentId={environmentId}
      />
      <DetailsEnvironmentModal
        open={detailsModal}
        close={closeDetailsModal}
        closeMessage={"CLOSE"}
        environment={getEnvironmentDetailsFromLocalStorage()}
        topicsLength={topics.length}
      />
    </ThemeProvider>
  );
};

export default EnvironmentDetailNew;
