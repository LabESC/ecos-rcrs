import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { updateStatus } from "../../api/Environments";
import { verifyLoggedUser } from "../../api/Auth";
import { useState } from "react";

export function CancelEnvironmentDialog(props) {
  const { open, close, closeParent, environmentId } = props;
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

  // . Cancelar ambiente
  const deleteEnvironmentAction = async () => {
    // * Obtendo dados do usuario logado
    const user = await verifyLoggedUser();
    if (user === null) {
      close();
      return;
    }

    console.log(user);
    // * Atualizando status do ambiente
    const updatedEnvironment = await updateStatus(
      user.userId,
      user.userToken,
      environmentId,
      "cancelled"
    );

    // * Verificando se houve erro
    if (updatedEnvironment.error) {
      setRequest({
        title: `${response.error.code}: Deleting environment`,
        message: response.error.message,
        severity: "error",
      });
      setRequestMade(true);
      return;
    }

    setRequest({
      title: "Environment deleted",
      message: "The environment was inactivated, wait for the page reloading.",
      severity: "success",
    });
    setRequestMade(true);
    close();
    closeParent();

    // . Atualizar pagina depois de 5 segundos
    setTimeout(() => {
      window.location.reload();
    }, 3000);

    /* // * Fechando o popUp
    window.location.reload(false);*/
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
          DELETE ENVIRONMENT
        </DialogTitle>

        <DialogContent
          style={{
            background: "#d9d9d9",
          }}
        >
          <DialogContentText>
            Are you sure you want to delete the environment?
          </DialogContentText>
        </DialogContent>

        <DialogActions
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#d9d9d9",
          }}
        >
          <Button autoFocus onClick={close} color="warning">
            NO, KEEP IT
          </Button>
          <Button autoFocus onClick={deleteEnvironmentAction} color="warning">
            YES, DELETE
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key="SNACK_DELETE_REQ"
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
