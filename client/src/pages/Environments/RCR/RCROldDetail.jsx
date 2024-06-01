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

export function RCROldDetail(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, oldRCR, newRCR, openRelatedIssue } = props;

  const formatDate = (date) => {
    try {
      const newDate = new Date(date);
      return newDate.toLocaleDateString() + " " + newDate.toLocaleTimeString();
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
              {oldRCR.relatedToIssues.map((relatedToIssue, index) => {
                return (
                  <Chip
                    label={relatedToIssue}
                    key={`CHP_${relatedToIssue}`}
                    style={{ margin: "0.25em" }}
                    onClick={() => {
                      openRelatedIssue(
                        newRCR.topicNum,
                        relatedToIssue,
                        newRCR.mainIssue
                      );
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
