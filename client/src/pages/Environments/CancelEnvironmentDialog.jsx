import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { updateStatus } from "../../api/Environments";
import { verifyLoggedUser } from "../../api/Auth";

export function CancelEnvironmentDialog(props) {
  const { open, close, closeParent, environmentId } = props;
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const btnSubmit = async () => {
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
      console.log(updatedEnvironment.error);
      close();
      return;
    }

    // * Fechando o popUp
    window.location.reload(false);
    close();
    closeParent();
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
          <Button autoFocus onClick={btnSubmit} color="warning">
            YES, CANCEL
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
