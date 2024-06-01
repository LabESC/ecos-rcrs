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
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

export function RCROldDetailVote(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, oldRCR, newRCR } = props;

  const formatDate = (date) => {
    try {
      const date = new Date(oldRCR.updatedAt);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (e) {
      return date;
    }
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
      >
        <DialogTitle
          style={{
            backgroundColor: "#d6d6d6",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
          id={`rcr-dialog-title-${oldRCR.id}`}
        >
          <ArrowCircleLeftIcon
            className="BackButton"
            onClick={close}
            style={{ marginRight: "2em" }}
          />
          RCR #{newRCR.id} - {formatDate(oldRCR.updatedAt)}
        </DialogTitle>

        <DialogContent dividers style={{ background: "#e5e5e5" }}>
          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Name*</Typography>
            <Typography>{oldRCR.name}</Typography>
          </Box>

          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Description*</Typography>

            <Typography>{oldRCR.details}</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
