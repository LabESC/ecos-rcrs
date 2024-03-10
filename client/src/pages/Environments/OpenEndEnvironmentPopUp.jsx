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
import { setFinalRCRAndEndEnvironment } from "../../api/Environments";
import { useNavigate } from "react-router-dom";

export function OpenEndEnvironmentPopUp(props) {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  const { open, close, environmentId, finalRCRs, loggedUser } = props;
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
  const finishEnvironmentAction = async () => {
    const response = await setFinalRCRAndEndEnvironment(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      finalRCRs
    );

    if (response !== true) {
      setRequest({
        title: `${response.error.code}: Finishing environment`,
        message: response.error.message,
        severity: "error",
      });
      setRequestMade(true);
      return;
    }

    setRequest({
      title: "Environment finished",
      message: "The environment was finished, wait for the page reloading.",
      severity: "success",
    });

    setRequestMade(true);

    // . Atualizar pagina depois de 5 segundos
    setTimeout(() => {
      redirect("/my-environments");
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
          Finish environment
        </DialogTitle>

        <DialogContent
          style={{
            background: "#d9d9d9",
          }}
        >
          <DialogContentText>
            <Typography
              key={`msg_description_finish`}
              style={{ margin: "0.5em 0" }}
            >
              Do you want to finish the environment?
            </Typography>
          </DialogContentText>
        </DialogContent>

        <DialogActions
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            background: "#d9d9d9",
          }}
        >
          <Button
            autoFocus
            onClick={finishEnvironmentAction}
            color="success"
            sx={{ fontWeight: "600" }}
          >
            YES, FINISH NOW
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
