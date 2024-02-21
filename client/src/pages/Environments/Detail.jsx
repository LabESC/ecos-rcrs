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
import { DiffAddedIcon, RepoIcon, PeopleIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueCard } from "./Issues/IssueCard.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";
import { ListAssociatedRCRsEnvPopUp } from "./RCR/ListAssociatedRCRsEnvironment.jsx";
import { OpenRCRDefinitionVotePopUp } from "./OpenRCRDefinitionVotePopUp.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import {
  setTopicDataToLocalStorage,
  getEnvironmentIdFromUrl,
  getTopicData,
  getEnvironmentNameFromLocalStorage,
  getDefinitionRCRs,
} from "../../api/Environments.jsx";

const EnvironmentDetail = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";

    // . Função para ordenar as issues dos topicos pelo tamanho do  array "relatedTo"
    const orderIssuesByRelatedTo = (topics) => {
      // . Ordenando as issues
      topics.forEach((topic) => {
        topic.issues.sort((a, b) => {
          return b.relatedTo.length - a.relatedTo.length;
        });
      });
      return topics;
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

      // . Obtendo os ambientes do usuário
      const response = await getTopicData(userId, userToken, environmentId);

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

      // . Armazenando os ambientes
      const topics = orderIssuesByRelatedTo(response);
      setTopics(topics);

      // . Setando o topico atual no localStorage
      setTopicDataToLocalStorage(topics[0]);

      // . Obtendo rcrs prioritarias associadas
      const priorityRCRs = await getDefinitionRCRs(
        userId,
        userToken,
        environmentId
      );

      if (priorityRCRs.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${priorityRCRs.error.code}: Getting priority RCRs`,
          priorityRCRs.error.message,
          priorityRCRs.status
        );
        return;
      }

      // . Setando as rcrs prioritarias
      setPriorityRCRs(priorityRCRs.rcrs);

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
  const [topics, setTopics] = useState([
    { id: null, issues: "", name: "", topic: "" },
  ]); // . Armazena os ambientes do usuário
  const [actualTopic, setActualTopic] = useState(0); // . Armazena o ambiente atual
  const [priorityRCRs, setPriorityRCRs] = useState([]); // . Armazena as RCRs prioritarias [Array

  // . Função para mudar o topico atual (SELECT)
  const changeTopic = (event) => {
    setActualTopic(event.target.value);
    setTopicDataToLocalStorage(topics[event.target.value]);
  };

  // . Função para ir a pagina da issue
  const goToissueDetail = (issue) => {
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
              topics.length > 0
                ? topics[0].id !== null
                  ? "visible"
                  : "hidden"
                : "hidden"
            }
          >
            {"Topics: " + topics.length}
          </Typography>
          <SuccessButton
            icon={<PeopleIcon size={18} />}
            message={"Start Priority Vote Session"}
            width={"220px"}
            height={"30px"}
            uppercase={false}
            marginLeft="0"
            marginRight="4em"
            backgroundColor={"#9fff64"}
            action={() => {
              openDefinitionRCRVoteModal();
            }}
            visibility={priorityRCRs.length !== 0 ? "visible" : "hidden"}
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
            visibility={priorityRCRs.length !== 0 ? "visible" : "hidden"}
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
            onChange={(e) => changeTopic(e)}
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
          {topics.length !== 0 && topics[actualTopic].issues !== ""
            ? topics[actualTopic].issues.map((issue) => {
                return (
                  <IssueCard
                    key={`EnvCard-${issue.id}`}
                    id={issue.id}
                    issue={issue}
                    onClick={() => goToissueDetail(issue, topics[actualTopic])}
                  />
                );
              })
            : ""}
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
        rcrs={priorityRCRs}
      />
      <OpenRCRDefinitionVotePopUp
        open={startRCRDefinitionVoteModalOpen}
        close={closeDefinitionRCRVoteModal}
        rcrs={priorityRCRs}
        environmentId={environmentId}
      />
    </ThemeProvider>
  );
};

export default EnvironmentDetail;
