import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  TextField,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useState } from "react";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { cloneEnvironment } from "../../api/Environments";

export function CloneEnvironmentPopUp(props) {
  const { open, close, environmentId, loggedUser } = props;
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Variaveis e funçoes para manipulacao do Alert das requisicoes
  const [requestMade, setRequestMade] = useState(false);
  const [request, setRequest] = useState({
    title: "",
    message: "",
    severity: "",
  });

  const closeRequestMade = () => {
    setRequestMade(false);
  };

  // . Clonar ambiente
  const cloneEnvironmentAction = async () => {
    const newName = document.getElementById("txt-name").value;
    if (newName === "") {
      setRequest({
        title: "Invalid name",
        message: "The name cannot be empty.",
        severity: "error",
      });
      setRequestMade(true);
      return;
    }

    const response = await cloneEnvironment(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      newName
    );

    if (response.error) {
      setRequest({
        title: `${response.error.code}: Cloning environment`,
        message: response.error.message,
        severity: "error",
      });
      setRequestMade(true);
      return;
    }

    setRequest({
      title: "Environment cloned",
      message: "The environment was cloned, wait for the page reloading.",
      severity: "success",
    });
    setRequestMade(true);

    // . Atualizar pagina depois de 5 segundos
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={close}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle
          id="responsive-dialog-title"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            background: "#d9d9d9",
          }}
        >
          <ArrowCircleLeftIcon
            className="BackButton"
            onClick={close}
            style={{ marginRight: "0.25em" }}
          />
          Clone environment
        </DialogTitle>

        <DialogContent
          style={{
            background: "#d9d9d9",
          }}
        >
          <DialogContentText>
            <Typography
              key={`msg_description_clone`}
              style={{ margin: "0.5em 0", fontSize: "0.8em", color: "red" }}
            >
              When cloning an environment, the new environment will be an exact
              copy of the original environment until the topics generation and
              the rcrs made til that point including all the data,
              configurations and settings, but ignoring all the voting steps
              forwards.
            </Typography>
          </DialogContentText>
          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Name*</Typography>
            <TextField
              id="txt-name"
              variant="outlined"
              fullWidth
              placeholder="Insert the new name for the cloned environment"
            />
          </Box>
        </DialogContent>

        <DialogActions
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            background: "#d9d9d9",
          }}
        >
          <Button autoFocus onClick={cloneEnvironmentAction} color="success">
            CLONE
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key="SNACK_CLONE_REQ"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={requestMade}
        autoHideDuration={2500}
        onClose={closeRequestMade}
      >
        <Alert
          onClose={closeRequestMade}
          severity={request.severity ? request.severity : "info"}
          sx={{ width: "100%" }}
        >
          <AlertTitle>{request.title}</AlertTitle>
          {request.message}
        </Alert>
      </Snackbar>
    </>
  );
}
