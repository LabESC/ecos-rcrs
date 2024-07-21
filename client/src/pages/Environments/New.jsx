import {
  TextField,
  Button,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  AlertTitle,
  Tooltip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import {
  FeedPlusIcon,
  CodescanCheckmarkIcon,
  InfoIcon,
} from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { RequestUFCPopUp } from "./UserFeedbackChannel/RequestPopUp.jsx";
import { DetailUFCPopUp } from "./UserFeedbackChannel/DetailPopUp.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import { createEnvironment } from "../../api/Environments.jsx";
import {
  doesRepoExist,
  getOrganizationRepos,
  getRCRKeywords,
} from "../../api/GitHub.jsx";

const NewEnvironment = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.title = "SECO-RCR: My Environments";
    document.body.style.background = "white";

    const getKeywords = async () => {
      const res = await getRCRKeywords();
      if (res.error) {
        activeErrorDialog(res.error.code, res.error.message, res.status);
        return;
      }
      console.log(res.join(","));
      setRCRKeywords(res);
    };

    // . Verificando se o usuário está logado e obtendo seus dados
    const checkUser = async () => {
      const verifyUser = await verifyLoggedUser();

      // . Se não houver usuário logado, redireciona para a página de login
      if (verifyUser === null) {
        redirect("/");
        return;
      }
      setLoggedUser(verifyUser);
      await getKeywords();
      setIsLoading(false);
    };

    // . Executando a função
    checkUser();
  }, []);

  // ! Variáveis e funções para manipulação dos Dialogs
  const [isLoading, setIsLoading] = useState(true);
  const [hasCreatedError, setHasCreatedError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const closeErrorDialog = () => {
    if (errorMessage.startsWith("201:")) {
      setHasCreatedError(false);
      redirect("/my-environments");
      return;
    }

    setHasCreatedError(false);
  };

  const activeErrorDialog = (code, msg, status) => {
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setErrorCode(code);
    setErrorMessage(`${status}:\n${msg}`);
    setHasCreatedError(true);
  };

  // ! Variáveis e funções para manipulação dos elementos
  const [loggedUser, setLoggedUser] = useState({ userId: "", userToken: "" });
  const [miningType, setMiningType] = useState("organization");
  const [filterType, setFilterType] = useState("none");
  const [statusOption, setStatusOption] = useState("all");
  const [hasDateFilter, setHasDateFilter] = useState("false");
  const [createdAtSince, setCreatedAtSince] = useState("");
  const [createdAtUntil, setCreatedAtUntil] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [organizationName, setOrganizationName] = useState("");
  const [orgRepositories, setOrgRepositories] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hasSearchError, setHasSearchError] = useState(false);
  const [searchError, setSearchError] = useState({ title: "", message: "" });
  const [addButtonRepoColor, setAddButtonRepoColor] = useState("#0084fe");
  const [addButtonKeywordColor, setAddButtonKeywordColor] = useState("#0084fe");
  const [rcrKeywords, setRCRKeywords] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [userFeedbackChannels, setUserFeedbackChannels] = useState([
    {
      type: "Software repository",
      name: "GitHub",
      details: "",
      url: "https://github.com/",
    },
  ]);
  const [openRequestUFC, setOpenRequestUFC] = useState(false);
  const [addButtonUFC, setAddButtonUFC] = useState("#0084fe");
  const [ufcForDialog, setUfcForDialog] = useState({
    type: "",
    name: "",
    details: "",
    url: "",
  });
  const [openDetailsUFC, setOpenDetailsUFC] = useState(false);

  const closeSearchErrorDialog = () => {
    setHasSearchError(false);
  };

  const getOrganizationRepositories = async () => {
    const org = document.getElementById("txt-organization").value;
    if (org === "") return;

    setIsLoadingSearch(true);
    const res = await getOrganizationRepos(org, loggedUser.userId);

    if (res === false) {
      setSearchError({
        title: "Organization",
        message: "Organization not found",
      });
      setHasSearchError(true);
      setIsLoadingSearch(false);
      return;
    }

    if (!res) {
      setSearchError({
        title: "Server not responding",
        message: "Try again later.",
      });
      setHasSearchError(true);
      setIsLoadingSearch(false);
      return;
    }

    if (res.error) {
      setSearchError({ title: res.error.code, message: res.error.message });
      setHasSearchError(true);
      setIsLoadingSearch(false);
      return;
    }

    if (res.length === 0) {
      setSearchError({
        title: "Organization",
        message: "Organization has no repositories",
      });
      setHasSearchError(true);
      setIsLoadingSearch(false);
      return;
    }

    if (res.length > 0) {
      setOrgRepositories(res);
      setIsLoadingSearch(false);
      setOrganizationName(org);
    }

    document.getElementById("txt-organization").value = "";
  };

  const checkRepoAvailable = async () => {
    const repo = document.getElementById("txt-add-repository").value;
    if (repo === "") return;

    // . Verificando se ja foi adicionado em repositories
    if (repositories.includes(repo)) {
      setSearchError({
        title: "Repository",
        message: "Repository already added",
      });
      setHasSearchError(true);
      return;
    }

    setIsLoadingSearch(true);
    const res = await doesRepoExist(repo, loggedUser.userId);
    if (res.error) {
      setSearchError({ title: res.error.code, message: res.error.message });
      setHasSearchError(true);
      setIsLoadingSearch(false);
      return;
    }
    if (res === false) {
      setSearchError({ title: "Repository", message: "Repository not found" });
      setHasSearchError(true);
      setIsLoadingSearch(false);
      return;
    }

    if (res === true) {
      setRepositories([...repositories, repo]);
      setIsLoadingSearch(false);
    }
    document.getElementById("txt-add-repository").value = "";
  };

  const removeRepositoryFromRepositories = (repo) => {
    const newRepos = repositories.filter((r) => r !== repo);
    setRepositories(newRepos);
  };

  const removeRepositoryFromOrgRepositories = (repo) => {
    // * Se o usuário remover um repositorio ao estar na opção de organização, ele estará trocando o tipo da mineração para repos
    const newRepos = orgRepositories.filter((r) => r !== repo);
    setRepositories([...newRepos]);
    setMiningType("repos");
  };

  const createNewEnvironment = async () => {
    // . Obtendo dados do ambiente
    const name = document.getElementById("txt-name").value;
    const details = document.getElementById("txt-details").value;
    let createdAtSince = document.getElementById("txt-created_at_since").value;
    let createdAtUntil = document.getElementById("txt-created_at_until").value;
    const userId = loggedUser.userId;
    const userToken = loggedUser.userToken;

    // . Formatando datas...
    if (createdAtSince === "") createdAtSince = null;
    else createdAtSince = createdAtSince + "T00:00:00.000Z";
    if (createdAtUntil === "") createdAtUntil = null;
    else createdAtUntil = createdAtUntil + "T23:59:59.999Z";

    if (name === "") {
      setSearchError({ title: "Name", message: "Name is required" });
      setHasSearchError(true);
      return;
    }

    if (details === "") {
      setSearchError({ title: "Details", message: "Details is required" });
      setHasSearchError(true);
      return;
    }

    // . Se o filtro de data for aplicado e nenhuma das datas preenchidas, exibir erro
    if (
      hasDateFilter === "true" &&
      createdAtSince === "" &&
      createdAtUntil === ""
    ) {
      setSearchError({
        title: "Date filter",
        message:
          "At least one date is required (Since or Until), if you want to filter by date",
      });
      setHasSearchError(true);
      return;
    }

    // . Se o filtro de data nao foi aplicado, nular datas
    if (hasDateFilter === "false") {
      createdAtSince = null;
      createdAtUntil = null;
    }

    if (miningType === "organization" && organizationName === "") {
      setSearchError({
        title: "Organization",
        message: "Organization is required",
      });
      setHasSearchError(true);
      return;
    }

    if (miningType === "organization" && orgRepositories.length === 0) {
      setSearchError({
        title: "Organization",
        message: "Organization has no repositories",
      });
      setHasSearchError(true);
      return;
    }

    if (miningType === "repos" && repositories.length === 0) {
      setSearchError({
        title: "Repositories",
        message: "At least one repository is required",
      });
      setHasSearchError(true);
      return;
    }

    setIsLoading(true);

    const res = await createEnvironment(
      userId,
      userToken,
      name,
      details,
      miningType === "repos" ? repositories : orgRepositories,
      miningType,
      filterType,
      organizationName,
      keywords,
      rcrKeywords,
      userFeedbackChannels,
      createdAtSince,
      createdAtUntil,
      statusOption
    );
    setIsLoading(false);

    if (res.error) {
      activeErrorDialog(res.error.code, res.error.message, res.status);
    } else {
      activeErrorDialog(
        "Environment",
        "Environment successfully created.",
        201
      );
    }
  };

  const addKeyword = () => {
    const keyword = document.getElementById("txt-repository").value;
    if (keyword === "") return;

    setKeywords([...keywords, keyword]);
    document.getElementById("txt-repository").value = "";
  };

  const removeKeyword = (keyword) => {
    const newKeywords = keywords.filter((k) => k !== keyword);
    setKeywords(newKeywords);
  };

  const removeRCRKeyword = (keyword) => {
    const newRCRKeywords = rcrKeywords.filter((k) => k !== keyword);
    setRCRKeywords(newRCRKeywords);
  };

  // * Registrando um novo User Feedback Channel localmente
  const createNewUFC = async () => {
    // . Obtendo dados do RCR
    const name = document.getElementById("txt-ufc-name").value;
    const type = document.getElementById("txt-ufc-type").value;
    const details = document.getElementById("txt-ufc-details").value;
    const url = document.getElementById("txt-ufc-url").value;

    setIsLoading(true);
    closeRequestUFCDialog();

    if (name === "") {
      setIsLoading(false);
      setSearchError({
        title: "Empty name for User Feedback Channel",
        message: "Name is required",
      });
      setHasSearchError(true);
      return;
    }
    if (type === "") {
      setIsLoading(false);
      setSearchError({
        title: "Empty type for User Feedback Channel",
        message: "Type is required",
      });
      setHasSearchError(true);
      return;
    }

    const data = {
      name,
      type,
      details,
      url,
    };

    setUserFeedbackChannels([...userFeedbackChannels, data]);
    setIsLoading(false);
  };

  // * Atualizando um User Feedback Channel localmente
  const updateUFC = async () => {
    // . Obtendo dados do RCR
    const name = document.getElementById("txt-ufc-name-upd").value;
    const type = document.getElementById("txt-ufc-type-upd").value;
    const details = document.getElementById("txt-ufc-details-upd").value;
    const url = document.getElementById("txt-ufc-url-upd").value;

    setIsLoading(true);
    closeDetailsUFCDialog();

    if (name === "") {
      setIsLoading(false);
      setSearchError({
        title: "Empty name for User Feedback Channel",
        message: "Name is required",
      });

      setHasSearchError(true);
      return;
    }

    if (type === "") {
      setIsLoading(false);
      setSearchError({
        title: "Empty type for User Feedback Channel",
        message: "Type is required",
      });

      setHasSearchError(true);
      return;
    }

    const data = {
      name,
      type,
      details,
      url,
    };

    // . Removendo o UFC antigo
    setUserFeedbackChannels([
      ...userFeedbackChannels.filter(
        (ufc) =>
          ufc.name !== ufcForDialog.name && ufc.type !== ufcForDialog.type
      ),
      data,
    ]);

    //setUserFeedbackChannels([...userFeedbackChannels, data]);
    setIsLoading(false);
  };

  // ! Funções para manipulação do PopUp de solicitação de UFC
  const openRequestUFCDialog = () => {
    setOpenRequestUFC(true);
  };

  const closeRequestUFCDialog = () => {
    setOpenRequestUFC(false);
  };

  // ! Funções para manipulação do PopUp de detalhe da UFC
  const openDetailsUFCDialog = () => {
    setOpenDetailsUFC(true);
  };

  const closeDetailsUFCDialog = () => {
    setOpenDetailsUFC(false);
  };

  const checkIfHasGitHubUFC = () => {
    return userFeedbackChannels.filter((ufc) => ufc.name === "GitHub").length;
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <Box
        className="ContainerMyEnvironments"
        style={{
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Box
          style={{
            justifyContent: "center",
          }}
          className="ContainerTitle"
        >
          <Typography
            variant="h5"
            style={{
              textDecoration: "underline",
              marginLeft: "1em",
              fontWeight: "600",
            }}
          >
            Request new environment
          </Typography>
        </Box>
        <Box
          className="ContainerEnvironments"
          style={{
            justifyContent: "center",
          }}
        >
          <Box className="NewEnvironmentContent">
            <Box className="LoginCardContent">
              <Box className="DivLoginTextAndButtons">
                <Box className="ButtonArea">
                  <Typography className="TextFieldLabel">Name*</Typography>
                  <TextField
                    id="txt-name"
                    variant="outlined"
                    fullWidth
                    placeholder="Insert the name of the environment"
                  />
                </Box>
                <Box className="ButtonArea">
                  <Typography className="TextFieldLabel">
                    Description*
                  </Typography>
                  <TextField
                    id="txt-details"
                    variant="outlined"
                    fullWidth
                    placeholder="Insert a description for the environment"
                    multiline
                    maxRows={4}
                  />
                </Box>
                <FormControl className="ButtonArea">
                  <FormLabel
                    id="radio-button-mining_type"
                    className="TextFieldLabel"
                  >
                    Filter Type*
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="radio-button-filter_type"
                    name="radioButton-filterType"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <FormControlLabel
                      value="none"
                      control={<Radio />}
                      label="No Filter"
                    />

                    <FormControlLabel
                      value="keywords"
                      control={<Radio />}
                      label={
                        <Tooltip title="This will applly a filter of requirement change keywords (RCR) and allow you to add specific project keywords that refers to RCR at the issues mined">
                          <Box>
                            {"By keywords     "}
                            <InfoIcon size={16} />
                          </Box>
                        </Tooltip>
                      }
                    ></FormControlLabel>
                  </RadioGroup>
                </FormControl>

                <Box
                  className="ButtonArea"
                  style={{
                    visibility:
                      filterType === "keywords" ? "visible" : "collapse",
                  }}
                >
                  <Typography className="TextFieldLabel">
                    Environment keywords
                  </Typography>
                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <TextField
                      id="txt-repository"
                      fullWidth
                      variant="outlined"
                      placeholder="Insert the disered keyword for the filter"
                    />
                    <Button
                      onClick={addKeyword}
                      style={{ marginLeft: "0.5em" }}
                      id="btn-add-keyword"
                      onMouseOver={() => {
                        setAddButtonKeywordColor("#7da7fa");
                      }}
                      onMouseOut={() => {
                        setAddButtonKeywordColor("#0084fe");
                      }}
                    >
                      <FeedPlusIcon size={24} fill={addButtonKeywordColor} />
                    </Button>
                  </Box>
                </Box>

                <Box className="ButtonArea">
                  <Typography className="TextFieldLabel">
                    User Feedback Channels
                  </Typography>

                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    {userFeedbackChannels.length > 0
                      ? userFeedbackChannels.map((ufc, index) => {
                          return (
                            <Chip
                              label={ufc.name}
                              id={`CHP_UFC_${ufc.name}_${index}`}
                              key={`CHP_UFC_${name}_${index}`}
                              style={{
                                margin: "0.25em",
                                backgroundColor: "#b3def5",
                              }}
                              onClick={() => {
                                setUfcForDialog(ufc);
                                openDetailsUFCDialog();
                              }}
                              onDelete={() => {
                                setUserFeedbackChannels(
                                  userFeedbackChannels.filter(
                                    (ufc, i) => i !== index
                                  )
                                );
                              }}
                            />
                          );
                        })
                      : ""}

                    <Tooltip title="Add a new User Feedback Channel (this is only for documentation purposes)">
                      <Button
                        onClick={openRequestUFCDialog}
                        style={{ marginLeft: "0.5em" }}
                        id="btn-add-ufc"
                        onMouseOver={() => {
                          setAddButtonUFC("#7da7fa");
                        }}
                        onMouseOut={() => {
                          setAddButtonUFC("#0084fe");
                        }}
                      >
                        <FeedPlusIcon size={24} fill={addButtonUFC} />
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
                <Box
                  id="box-github-mining"
                  style={{
                    visibility:
                      checkIfHasGitHubUFC() > 0
                        ? "visible !important"
                        : "hidden !important",
                  }}
                >
                  <FormControl className="ButtonArea">
                    <FormLabel
                      id="radio-button-mining_type"
                      className="TextFieldLabel"
                    >
                      GitHub Mining Type*
                    </FormLabel>
                    <RadioGroup
                      row
                      aria-labelledby="radio-button-mining_type"
                      name="radioButton-miningType"
                      value={miningType}
                      onChange={(e) => setMiningType(e.target.value)}
                    >
                      <FormControlLabel
                        value="organization"
                        control={<Radio />}
                        label="Organization"
                      />
                      <FormControlLabel
                        value="repos"
                        control={<Radio />}
                        label="Many Repos"
                      />
                    </RadioGroup>
                  </FormControl>

                  <Box
                    className="ButtonArea"
                    style={{
                      visibility:
                        miningType === "organization" ? "visible" : "collapse",
                    }}
                  >
                    <Typography className="TextFieldLabel">
                      GitHub Organization
                    </Typography>
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      <TextField
                        id="txt-organization"
                        fullWidth
                        variant="outlined"
                        placeholder="Insert the disered GitHub organization"
                      />
                      <Button
                        onClick={getOrganizationRepositories}
                        style={{ marginLeft: "0.5em" }}
                        id="btn-add-repository"
                        onMouseOver={() => {
                          setAddButtonRepoColor("#7da7fa");
                        }}
                        onMouseOut={() => {
                          setAddButtonRepoColor("#0084fe");
                        }}
                      >
                        <CodescanCheckmarkIcon
                          size={24}
                          fill={addButtonRepoColor}
                        />
                      </Button>
                    </Box>
                  </Box>
                  <Box
                    className="ButtonArea"
                    style={{
                      visibility:
                        miningType === "repos" ? "visible" : "collapse",
                    }}
                  >
                    <Typography className="TextFieldLabel">
                      GitHub Repository
                    </Typography>
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      <TextField
                        id="txt-add-repository"
                        fullWidth
                        variant="outlined"
                        placeholder="Insert the disered GitHub repository"
                      />
                      <Button
                        onClick={checkRepoAvailable}
                        style={{ marginLeft: "0.5em" }}
                        id="btn-add-repository"
                        onMouseOver={() => {
                          setAddButtonRepoColor("#7da7fa");
                        }}
                        onMouseOut={() => {
                          setAddButtonRepoColor("#0084fe");
                        }}
                      >
                        <FeedPlusIcon size={24} fill={addButtonRepoColor} />
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <FormControl className="ButtonArea">
                <FormLabel id="radio-button-status" className="TextFieldLabel">
                  GitHub Issue Status*
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="radio-button-status"
                  name="radioButton-status"
                  value={statusOption}
                  onChange={(e) => setStatusOption(e.target.value)}
                >
                  <FormControlLabel
                    value="all"
                    control={<Radio />}
                    label="All (open and closed)"
                  />

                  <FormControlLabel
                    value="open"
                    control={<Radio />}
                    label="Open"
                  />

                  <FormControlLabel
                    value="closed"
                    control={<Radio />}
                    label="Closed"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl className="ButtonArea">
                <FormLabel id="radio-button-date" className="TextFieldLabel">
                  GitHub Issue Created At Filter*
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="radio-button-date"
                  name="radioButton-date"
                  value={hasDateFilter}
                  onChange={(e) => setHasDateFilter(e.target.value)}
                >
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="No filter (all)"
                  />

                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Filter"
                  />
                </RadioGroup>
              </FormControl>
              <Box
                className="ButtonArea"
                style={{
                  visibility: hasDateFilter === "true" ? "visible" : "collapse",
                }}
              >
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                  }}
                >
                  <Typography
                    className="TextFieldLabel"
                    style={{
                      width: "45%",
                      marginRight: "2.5%",
                    }}
                  >
                    Since
                  </Typography>
                  <Typography
                    className="TextFieldLabel"
                    style={{
                      marginLeft: "2.5%",
                    }}
                  >
                    Until
                  </Typography>
                </Box>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                  }}
                >
                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "45%",
                      marginRight: "2.5%",
                    }}
                  >
                    <TextField
                      title="Since"
                      id="txt-created_at_since"
                      type="date"
                      fullWidth
                      variant="outlined"
                    />
                  </Box>

                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "45%",
                      marginLeft: "2.5%",
                    }}
                  >
                    <TextField
                      title="Until"
                      id="txt-created_at_until"
                      type="date"
                      fullWidth
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
              <Button className="LoginBtnSignUp" onClick={createNewEnvironment}>
                {isLoading ? "REQUESTING..." : "REQUEST"}
              </Button>
            </Box>
            <Box className="LoginCardContent">
              <Box
                className="ButtonArea"
                style={{
                  visibility:
                    (repositories.length > 0 && miningType === "repos") ||
                    (orgRepositories.length > 0 && miningType !== "repos")
                      ? "visible"
                      : "hidden",
                }}
              >
                <Typography className="TextFieldLabel">
                  Selected GitHub repositories
                </Typography>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    width: "inherit",
                    maxHeight: "150px",
                    overflow: "auto",
                  }}
                >
                  {miningType === "repos"
                    ? repositories.map((repo, index) => {
                        return (
                          <Chip
                            label={repo}
                            key={`CHP_${index}`}
                            style={{ margin: "0.25em" }}
                            onDelete={() => {
                              removeRepositoryFromRepositories(repo);
                            }}
                          />
                        );
                      })
                    : orgRepositories.map((repo, index) => {
                        return (
                          <Chip
                            label={repo}
                            key={`CHP_${index}`}
                            style={{ margin: "0.25em" }}
                            onDelete={() => {
                              removeRepositoryFromOrgRepositories(repo);
                            }}
                          />
                        );
                      })}
                </Box>
              </Box>
              <Box
                className="ButtonArea"
                style={{
                  visibility: filterType === "keywords" ? "visible" : "hidden",
                }}
              >
                <Typography
                  className="TextFieldLabel"
                  style={{
                    visibility:
                      filterType === "keywords" && rcrKeywords.length > 0
                        ? "visible"
                        : "hidden",
                  }}
                >
                  RCR keywords
                </Typography>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    width: "inherit",
                    maxHeight: "150px",
                    overflow: "auto",
                  }}
                >
                  {rcrKeywords.map((keyword, index) => {
                    return (
                      <Chip
                        label={keyword}
                        key={`CHP-RCRKEY_${index}`}
                        style={{ margin: "0.25em" }}
                        onDelete={() => {
                          removeRCRKeyword(keyword);
                        }}
                      />
                    );
                  })}
                </Box>
                <Typography
                  className="TextFieldLabel"
                  sx={{
                    marginTop: "1em",
                    visibility: keywords.length > 0 ? "visible" : "hidden",
                  }}
                >
                  Environment keywords
                </Typography>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    width: "inherit",
                    maxHeight: "150px",
                    overflow: "auto",
                  }}
                >
                  {keywords.map((keyword, index) => {
                    return (
                      <Chip
                        label={keyword}
                        key={`CHP-KEY_${index}`}
                        style={{ margin: "0.25em" }}
                        onDelete={() => {
                          removeKeyword(keyword);
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <SideBar pageContent={pageContent} isLoading={isLoading} />
      <PopUpError
        open={hasCreatedError}
        close={closeErrorDialog}
        title={errorCode}
        message={errorMessage}
        id="pop-up-error-loading"
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={hasSearchError}
        autoHideDuration={2500}
        onClose={closeSearchErrorDialog}
      >
        <Alert
          onClose={closeSearchErrorDialog}
          severity="error"
          sx={{ width: "100%" }}
        >
          <AlertTitle>{searchError.title}</AlertTitle>
          {searchError.message}
        </Alert>
      </Snackbar>
      <RequestUFCPopUp
        open={openRequestUFC}
        close={closeRequestUFCDialog}
        createNewUFC={createNewUFC}
      />
      <DetailUFCPopUp
        open={openDetailsUFC}
        close={closeDetailsUFCDialog}
        ufc={ufcForDialog}
        updateUFC={updateUFC}
      />
      <Backdrop
        sx={{
          background: "rgba(0,0,0,0.5)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading || isLoadingSearch}
      >
        <CircularProgress sx={{ color: "#0084fe" }} />
      </Backdrop>
    </ThemeProvider>
  );
};

export default NewEnvironment;
