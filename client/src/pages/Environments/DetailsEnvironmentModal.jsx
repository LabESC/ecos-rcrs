import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export function DetailsEnvironmentModal(props) {
  const { open, close, closeMessage, environment, topicsLength } = props;

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
    >
      <DialogContent dividers style={{ background: "#D6D6D6" }}>
        <Typography gutterBottom>
          <strong> Name: </strong> {environment.name}
        </Typography>
        <Typography gutterBottom>
          <strong> Description: </strong> {environment.details}
        </Typography>
        <Typography gutterBottom>
          <strong> Mining Type: </strong>
          {environment.mining_type === "repos"
            ? "Many Repositories"
            : "Orgqanization"}
        </Typography>
        <Typography gutterBottom>
          <strong> Filter Type: </strong>
          {environment.filter_type === "keywords" ? "Keywords" : "None"}
        </Typography>

        {environment.filter_type !== "none" &&
        environment.issuesLength.issuesObtainedLength &&
        environment.issuesLength.issuesFilteredLength ? (
          <>
            <Typography gutterBottom>
              <strong> {"Issues Obtained:"} </strong>
              {environment.issuesLength.issuesObtainedLength}
            </Typography>
            <Typography gutterBottom>
              <strong> {"Issues Mined (after filters):"} </strong>
              {environment.issuesLength.issuesFilteredLength}
            </Typography>
          </>
        ) : (
          ""
        )}
        <Typography gutterBottom>
          <strong> Topics quantity: </strong>
          {topicsLength}
        </Typography>
        {environment.mining_type !== "repos" ? (
          <Typography gutterBottom sx={{ marginTop: "1em" }}>
            <strong> GitHub Organization: </strong>
            {environment.organization_name}
          </Typography>
        ) : (
          ""
        )}
        {environment.keywords && environment.keywords.length > 0 ? (
          <Typography gutterBottom sx={{ marginTop: "1em" }}>
            <strong> Environment keywords: </strong>
            {environment.keywords.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </Typography>
        ) : (
          ""
        )}
        {}
        {environment.repos.length > 0 ? (
          <Typography gutterBottom sx={{ marginTop: "1em" }}>
            <strong> Repositories: </strong>
            {environment.repos.map((repo) => (
              <li key={repo}>{repo}</li>
            ))}
          </Typography>
        ) : (
          ""
        )}
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
