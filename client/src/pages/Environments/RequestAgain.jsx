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

export function RequestAgainPopUp(props) {
  const { open, close, action, actionCancel, message, status } = props;
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
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
          justifyContent: "flex-end",
          background: "#d9d9d9",
        }}
      >
        <ArrowCircleLeftIcon className="BackButton" onClick={close} />
      </DialogTitle>

      <DialogContent
        style={{
          background: "#d9d9d9",
        }}
      >
        <DialogContentText>{message}</DialogContentText>
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
        <Button
          autoFocus
          onClick={actionCancel}
          color="error"
          style={{
            visibility:
              status !== "mining_error" || status !== "topics_error"
                ? "visible"
                : "hidden",
          }}
        >
          CANCEL ENVIRONMENT
        </Button>
        <Button autoFocus onClick={action} color="warning">
          {status.includes("error")
            ? "TRY AGAIN"
            : status.includes("waiting")
            ? "END NOW"
            : "REQUEST"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
