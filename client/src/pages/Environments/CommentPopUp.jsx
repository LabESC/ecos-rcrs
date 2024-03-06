import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export function CommentPopUp(props) {
  const { open, close, closeMessage, commentScore } = props;

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
        <Typography
          gutterBottom
          style={{ color: commentScore.color, fontWeight: 500 }}
        >
          <strong style={{ color: "#000" }}> Score: </strong>{" "}
          {commentScore.score}
        </Typography>
        <Typography
          gutterBottom
          style={{ display: "flex", flexDirection: "column" }}
        >
          <strong> Comment: </strong> {commentScore.comment}
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
