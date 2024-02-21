import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export function IssueModalDetail(props) {
  const { open, close, closeMessage, issue } = props;

  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      fullScreen={fullScreen}
      style={{ backgroundColor: "transparent" }}
      open={open}
      onClose={close}
      aria-labelledby="responsive-dialog-title"
      //style={{ background: "#D6D6D6" }}
    >
      <DialogContent dividers style={{ background: "#D6D6D6" }}>
        <Typography gutterBottom>
          <strong> Repo: </strong> {issue.repo}
        </Typography>
        {issue.score ? (
          <Typography gutterBottom>
            <strong> Topic Score: </strong> {parseFloat(issue.score).toFixed(5)}
          </Typography>
        ) : (
          ""
        )}
        <Typography gutterBottom>
          <strong> Github Issue ID: </strong>
          <a
            href={`https://github.com/${issue.repo}/issues/${issue.issueId}`}
            target="_blank"
          >
            {issue.issueId}
          </a>
        </Typography>
        <Typography gutterBottom>
          <strong> Related To Main Issue Score: </strong> {issue.relatedToScore}
        </Typography>
        <Typography
          gutterBottom
          style={{ display: "flex", flexDirection: "column" }}
        >
          <strong> Content: </strong> {issue.body}
        </Typography>
      </DialogContent>

      <DialogActions style={{ background: "#D6D6D6" }}>
        <Button
          autoFocus
          onClick={close}
          style={{ background: "green !important" }}
        >
          {closeMessage}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
