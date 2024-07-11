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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import CancelIcon from "@mui/icons-material/Cancel";

export function UpdateRCRAfterTopicPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));

  // ! Imports do props (recebidos do componente pai)
  const {
    open,
    close,
    rcr,
    openMainIssue,
    openRelatedIssue,
    action,
    issuesRcr,
    setIssuesRcr,
    title,
    setTitle,
    details,
    setDetails,
  } = props;

  // * Atualizando issue relacionada a RCR (desassociando ou reassociando-a)
  const updateRelatedToIssueFromRcr = (relatedToIssue) => {
    if (issuesRcr.includes(relatedToIssue)) {
      // . Se a issue relacionada ja estiver relacionada, remova-a
      const newRelatedToIssues = issuesRcr.filter((r) => r !== relatedToIssue);
      console.log("newRelatedToIssues", newRelatedToIssues);
      setIssuesRcr(newRelatedToIssues);
    } else {
      // . Se nao estiver relacionada, relacione-a
      console.log("newRelatedToIssues", issuesRcr.concat(relatedToIssue));
      setIssuesRcr(issuesRcr.concat(relatedToIssue));
    }
  };

  return (
    <Box style={{ width: "100%" }}>
      <Dialog
        fullScreen={fullScreen}
        //maxWidth="xs"
        style={{
          backgroundColor: "transparent",
        }}
        open={open}
        onClose={close}
        aria-labelledby="dialog_update_after_topics"
      >
        <DialogTitle
          style={{
            backgroundColor: "#d6d6d6",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
          id={`rcr-dialog-title-${rcr.id}`}
        >
          <ArrowCircleLeftIcon
            className="BackButton"
            onClick={close}
            style={{ marginRight: "2em" }}
          />
          Update RCR #{rcr.id}
        </DialogTitle>

        <DialogContent dividers style={{ background: "#e5e5e5" }}>
          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Name*</Typography>
            <TextField
              id="txt-name-edit"
              variant="outlined"
              fullWidth
              placeholder="Insert the name of the RCR"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </Box>
          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Description*</Typography>
            <TextField
              id="txt-details-edit"
              variant="outlined"
              fullWidth
              placeholder="Insert a description for the rcr"
              multiline
              maxRows={4}
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
              }}
            />
          </Box>

          <Box className="ButtonArea">
            <Typography className="TextFieldLabel">Main Issue*</Typography>
            <Chip
              label={rcr.mainIssue}
              key={`CHP_MAIN_${rcr.mainIssue}`}
              style={{ margin: "0.25em" }}
              onClick={() => {
                openMainIssue(rcr.mainIssue, rcr.topicNum);
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
              {rcr.relatedToIssues.map((relatedToIssue, index) => {
                return (
                  <Chip
                    label={relatedToIssue}
                    key={`CHP_${relatedToIssue}`}
                    style={{ margin: "0.25em" }}
                    onClick={() => {
                      openRelatedIssue(
                        relatedToIssue,
                        rcr.mainIssue,
                        rcr.topicNum
                      );
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
            onClick={async () => {
              await action(rcr);
            }}
          >
            UPDATE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
