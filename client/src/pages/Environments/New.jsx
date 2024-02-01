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
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { FeedPlusIcon, CodescanCheckmarkIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import { createEnvironment } from "../../api/Environments.jsx";
import { doesRepoExist, getOrganizationRepos } from "../../api/GitHub.jsx";

const NewEnvironment = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.title = "ECOS-IC: My Environments";
    document.body.style.background = "white";

    // . Verificando se o usuário está logado e obtendo seus dados
    const checkUser = async () => {
      const verifyUser = await verifyLoggedUser();

      // . Se não houver usuário logado, redireciona para a página de login
      if (verifyUser === null) {
        redirect("/");
        return;
      }
      setLoggedUser(verifyUser);
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
  const [repositories, setRepositories] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hasSearchError, setHasSearchError] = useState(false);
  const [searchError, setSearchError] = useState({ title: "", message: "" });
  const [addButtonRepoColor, setAddButtonRepoColor] = useState("#0084fe");

  const closeSearchErrorDialog = () => {
    setHasSearchError(false);
  };

  const getOrganizationRepositories = async () => {
    const org = document.getElementById("txt-organization").value;
    if (org === "") return;

    setIsLoadingSearch(true);
    const res = await getOrganizationRepos(org);
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
      setRepositories(res);
      setIsLoadingSearch(false);
    }
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
    const res = await doesRepoExist(repo);
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
  };

  const removeRepositoryFromRepositories = (repo) => {
    const newRepos = repositories.filter((r) => r !== repo);
    setRepositories(newRepos);
  };

  const createNewEnvironment = async () => {
    const name = document.getElementById("txt-name").value;
    const details = document.getElementById("txt-details").value;
    const userId = loggedUser.userId;
    const userToken = loggedUser.userToken;
    const organization = document.getElementById("txt-organization").value;

    if (miningType === "organization" && organization === "") {
      setSearchError({
        title: "Organization",
        message: "Organization is required",
      });
      setHasSearchError(true);
      return;
    }

    if (repositories.length === 0) {
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
      repositories,
      miningType,
      organization
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

  const closeAndRedirectToMyEnvironments = () => {
    setHasCreatedError(false);
    redirect("/my-environments");
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
          <Box className="LoginCardContent">
            <Box className="DivLoginTextAndButtons">
              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">Name</Typography>
                <TextField
                  id="txt-name"
                  variant="outlined"
                  fullWidth
                  placeholder="Insert the name of the environment"
                />
              </Box>
              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">Details</Typography>
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
                  Mining Type
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
                <Typography className="TextFieldLabel">Organization</Typography>
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
                    placeholder="Insert the disered organization"
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
                  visibility: miningType === "repos" ? "visible" : "collapse",
                }}
              >
                <Typography className="TextFieldLabel">Repository</Typography>
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
                    placeholder="Insert the disered repository"
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
              <Box className="ButtonArea">
                <Typography
                  className="TextFieldLabel"
                  style={{
                    visibility: repositories.length > 0 ? "visible" : "hidden",
                  }}
                >
                  Selected repositories
                </Typography>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    width: "inherit",
                  }}
                >
                  {repositories.map((repo, index) => {
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
                  })}
                </Box>
              </Box>
            </Box>
            <Button className="LoginBtnSignUp" onClick={createNewEnvironment}>
              {isLoading ? "REQUESTING..." : "REQUEST"}
            </Button>
          </Box>
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
        open={isLoading || isLoadingSearch}
      >
        <CircularProgress sx={{ color: "#0084fe" }} />
      </Backdrop>
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
    </ThemeProvider>
  );
};

export default NewEnvironment;
