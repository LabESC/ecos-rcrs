import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Chip,
  Box,
  TextField,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import CancelIcon from "@mui/icons-material/Cancel";
import { registerRCR } from "../../../api/Environments";
import { useState } from "react";
import { IssueModalDetail } from "./IssueModalDetail";

import { verifyLoggedUser } from "../../../api/Auth";

export function RequestRCRPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, mainIssue, relatedTo, environmentId, topicNum } = props;

  // ! Variaveis do alert Snackbar
  const [isLoading, setIsLoading] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    message: "",
    severity: "",
  });

  const closeAlert = () => {
    setHasAlert(false);
  };

  // ! Variavies do popup de detalhar issue
  const [issueModal, setIssueModal] = useState({
    id: null,
    issueId: "",
    repo: "",
    body: "",
    tags: "",
    score: "",
    relatedToScore: "",
  });

  // ! Variáveis e funções para manipulação do Dialog de Issue
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const openIssueOnModal = (issue) => {
    setIssueModal(issue);
    setIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
  };

  // ! Variaveis e funcoes do RCR
  const [issuesRcr, setIssuesRcr] = useState([]);

  // * Inserindo todas as issues relacionadas as issuesRcr
  const updateAllRelatedToIssues = () => {
    if (relatedTo.every((r) => issuesRcr.includes(r))) {
      setIssuesRcr([]);
    } else {
      setIssuesRcr(relatedTo);
    }
  };

  // * Atualizando issue relacionada a RCR (desassociando ou reassociando-a)
  const updateRelatedToIssueFromRcr = (relatedToIssue) => {
    if (issuesRcr.includes(relatedToIssue)) {
      // . Se a issue relacionada ja estiver relacionada, remova-a
      const newRelatedToIssues = issuesRcr.filter((r) => r !== relatedToIssue);
      setIssuesRcr(newRelatedToIssues);
    } else {
      // . Se nao estiver relacionada, relacione-a
      setIssuesRcr(issuesRcr.concat(relatedToIssue));
    }
  };

  // * Registrando um novo RCR
  const createNewRcr = async () => {
    setIsLoading(true);
    // . Buscando usuario logado
    const loggedUser = await verifyLoggedUser();
    if (!loggedUser) {
      setIsLoading(false);
      setAlertMessage({
        title: "User not logged",
        message:
          "Your user data was not found in your browser data, please log in and try again.",
        severity: "error",
      });
      setHasAlert(true);
      return;
    }

    // . Obtendo dados do RCR
    const name = document.getElementById("txt-name").value;
    const details = document.getElementById("txt-details").value;

    if (name === "" || details === "") {
      setIsLoading(false);
      setAlertMessage({
        title: "Empty fields",
        message: "Name and description are required",
        severity: "error",
      });
      setHasAlert(true);
      return;
    }

    if (issuesRcr.length === 0) {
      setIsLoading(false);
      setAlertMessage({
        title: "Empty related issues",
        message: "At least one related issue is required",
        severity: "error",
      });
      setHasAlert(true);
      return;
    }

    const data = {
      name,
      details,
      relatedToIssues: issuesRcr.map((issue) => issue.id),
      topicNum,
      mainIssue: mainIssue.id,
    };

    const response = await registerRCR(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      data
    );

    console.log(response);
    // . Verificando se ocorreu algum erro
    if (response.error) {
      setIsLoading(false);
      setAlertMessage({
        title: `${response.error.code}: Creating RCR failed`,
        message: `${response.error.status}: ${response.error.message}`,
      });
      setHasAlert(true);
    } else {
      setIssuesRcr([]);
      setIsLoading(false);
      setAlertMessage({
        title: "RCR created",
        message: "The RCR was successfully created. Reloading page...",
        severity: "success",
      });
      setHasAlert(true);
    }

    close();
    location.reload();
  };

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        style={{
          backgroundColor: "transparent",
        }}
        open={open}
        onClose={close}
        aria-labelledby="responsive-dialog-rcr"
        //style={{ background: "#D6D6D6" }}
      >
        <DialogTitle
          style={{
            backgroundColor: "#d6d6d6",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ArrowCircleLeftIcon
            className="BackButton"
            onClick={close}
            style={{ marginRight: "2em" }}
          />
          Register new RCR
        </DialogTitle>

        <DialogContent dividers style={{ background: "#e5e5e5" }}>
          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Name*</Typography>
            <TextField
              id="txt-name"
              variant="outlined"
              fullWidth
              placeholder="Insert the name of the RCR"
            />
          </Box>
          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Description*</Typography>
            <TextField
              id="txt-details"
              variant="outlined"
              fullWidth
              placeholder="Insert a description for the rcr"
              multiline
              maxRows={4}
            />
          </Box>

          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Main Issue*</Typography>
            <Chip
              label={mainIssue.id}
              key={`CHP_MAIN_${mainIssue.id}`}
              style={{ margin: "0.25em" }}
              onClick={() => {
                openIssueOnModal(mainIssue);
              }}
            />
          </Box>
          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Related issues*</Typography>
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
              <Button onClick={updateAllRelatedToIssues}>
                {relatedTo.every((r) => issuesRcr.includes(r))
                  ? "Unselect all"
                  : "Select all"}
              </Button>
            </Box>
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
              {relatedTo.map((relatedToIssue, index) => {
                return (
                  <Chip
                    label={relatedToIssue.id}
                    key={`CHP_${relatedToIssue.id}`}
                    style={{ margin: "0.25em" }}
                    onClick={() => {
                      openIssueOnModal(relatedToIssue);
                    }}
                    onDelete={() => {
                      updateRelatedToIssueFromRcr(relatedToIssue);
                    }}
                    deleteIcon={
                      issuesRcr.includes(relatedToIssue) ? (
                        <CancelIcon />
                      ) : (
                        <AddCircleOutlineIcon />
                      )
                    }
                  />
                );
              })}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          style={{
            background: "#d6d6d6",
          }}
        >
          <Button
            sx={{ marginTop: "0 !important" }}
            className="LoginBtnSignUp"
            onClick={createNewRcr}
          >
            {isLoading ? "REGISTERING..." : "REGISTER"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={hasAlert}
        autoHideDuration={2500}
        onClose={closeAlert}
      >
        <Alert
          onClose={closeAlert}
          severity={alertMessage.severity}
          sx={{ width: "100%" }}
        >
          <AlertTitle>{alertMessage.title}</AlertTitle>
          {alertMessage.message}
        </Alert>
      </Snackbar>
      <IssueModalDetail
        open={issueModalOpen}
        close={closeIssueModal}
        closeMessage={"BACK"}
        issue={issueModal}
      />
    </>
  );
}
