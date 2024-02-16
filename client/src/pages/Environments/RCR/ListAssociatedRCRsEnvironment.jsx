import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

export function ListAssociatedRCRsEnvPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, rcrs } = props;

  return (
    <Dialog
      fullScreen={fullScreen}
      style={{
        backgroundColor: "transparent",
      }}
      open={open}
      onClose={close}
      aria-labelledby="responsive-dialog-list-rcr-env"
      //style={{ background: "#D6D6D6" }}
    >
      <DialogTitle
        style={{
          backgroundColor: "#d6d6d6",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ArrowCircleLeftIcon
          className="BackButton"
          onClick={close}
          style={{ marginRight: "2em" }}
        />
        All RCRs identified at this environment
      </DialogTitle>

      <DialogContent dividers style={{ background: "#e5e5e5" }}>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "inherit",
          }}
        >
          {rcrs.map((rcr) => {
            return (
              <Accordion key={`ACC-${rcr.id}`} style={{ minWidth: "95%" }}>
                <AccordionSummary
                  //expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id={`ACC-SUMM-${rcr.id}`}
                >
                  <strong>{`#${rcr.id} - ${rcr.name}`}</strong>
                </AccordionSummary>
                <AccordionDetails id={`ACC-DET-${rcr.id}`}>
                  <Typography>
                    <strong> Topic: </strong> {rcr.topicNum}
                  </Typography>
                  <Typography>
                    <strong> Details: </strong>
                    {rcr.details}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
