import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { CancelEnvironmentDialog } from "./CancelEnvironmentDialog";

export function RequestAgainPopUp2(props) {
  const { open, close, action, btnSubmit } = props;
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openCancel, setOpenCancel] = useState(false);

  const handleCancel = () => {
    setOpenCancel(true);
  };

  const closeCancel = () => {
    setOpenCancel(false);
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
          {action.code}
        </DialogTitle>

        <DialogContent
          style={{
            background: "#d9d9d9",
          }}
        >
          <DialogContentText>
            {Array.isArray(action.msg)
              ? action.msg.map((message, index) => {
                  if (typeof message === "string")
                    return (
                      <Typography
                        key={`msg_${index}`}
                        style={{ margin: "0.5em 0" }}
                      >
                        {message}
                      </Typography>
                    );
                  else return message;
                })
              : action.msg}
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
          <Button
            autoFocus
            onClick={handleCancel}
            color="error"
            style={{
              visibility:
                action.status !== "mining_error" ||
                action.status !== "topics_error"
                  ? "visible"
                  : "hidden",
            }}
          >
            CANCEL ENVIRONMENT
          </Button>
          <Button autoFocus onClick={btnSubmit} color="warning">
            {action.status.includes("error")
              ? "TRY AGAIN"
              : action.status.includes("waiting")
              ? "END VOTING NOW"
              : "REQUEST"}
          </Button>
        </DialogActions>
      </Dialog>
      <CancelEnvironmentDialog
        open={openCancel}
        close={closeCancel}
        closeParent={close}
        environmentId={action.environmentId}
      />
    </>
  );
}
