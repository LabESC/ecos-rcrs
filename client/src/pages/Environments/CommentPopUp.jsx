import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

export function CommentPopUp(props) {
  const { open, close, closeMessage, commentScore } = props;

  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      // fullScreen={fullScreen}
      fullWidth={true}
      maxWidth="xl"
      style={{ backgroundColor: "transparent" }}
      open={open}
      onClose={close}
      aria-labelledby="responsive-dialog-title"
      PaperProps={{
        sx: {
          minHeight: "75%",
          maxHeight: "75%",
        },
      }}
    >
      <DialogContent dividers style={{ background: "#D6D6D6" }}>
        <Typography
          gutterBottom
          style={{ color: commentScore.color, fontWeight: 500 }}
        >
          <strong style={{ color: "#000" }}> Score: </strong>{" "}
          {commentScore.score}
        </Typography>
        <Box style={{ display: "flex", flexDirection: "column" }}>
          <strong style={{ marginBottom: "0.4em" }}> Comment: </strong>
          {commentScore.comments.map((comment, index) => {
            return (
              <Typography
                key={index}
                gutterBottom
                style={{ marginBottom: "0.6em" }}
              >
                {comment}
              </Typography>
            );
            /*<Typography
            key={index}
            gutterBottom
            style={{ display: "flex", flexDirection: "column" }}
          >
            <strong> Comment: </strong> {comment}
        </Typography>*/
          })}
        </Box>
        {/*<Typography
          gutterBottom
          style={{ display: "flex", flexDirection: "column" }}
        >
          <strong> Comment: </strong> {commentScore.comment}
        </Typography>*/}
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
