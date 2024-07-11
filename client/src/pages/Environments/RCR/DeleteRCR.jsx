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

export function DeleteRCRConfirm(props) {
  const { open, close, btnSubmit } = props;
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

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
          Confirm RCR Deletion
        </DialogTitle>

        <DialogContent
          style={{
            background: "#d9d9d9",
          }}
        >
          <DialogContentText>
            Are you sure you want to delete this RCR?
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
          <Button autoFocus onClick={close} color="success">
            NO
          </Button>
          <Button autoFocus onClick={btnSubmit} color="error">
            YES, DELETE IT
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
