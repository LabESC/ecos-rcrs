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
import { useState } from "react";

export function ListAssociatedRCRsPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, rcrs } = props;

  // ! Variaveis do alert Snackbar
  const [isLoading, setIsLoading] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    message: "",
    severity: "",
  });

  const closeAlert = () => {
    setHasAlert(false);
  };

  // ! Variavies do popup de detalhar issue
  const [issueModal, setIssueModal] = useState({
    id: null,
    issueId: "",
    repo: "",
    body: "",
    tags: "",
    score: "",
    relatedToScore: "",
  });

  // ! Variáveis e funções para manipulação do Dialog de Issue
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const openIssueOnModal = (issue) => {
    setIssueModal(issue);
    setIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      style={{
        backgroundColor: "transparent",
      }}
      open={open}
      onClose={close}
      aria-labelledby="responsive-dialog-list-rcr"
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
        All RCRs associated to this issue
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
                  <strong>{rcr.name}</strong>
                </AccordionSummary>
                <AccordionDetails id={`ACC-DET-${rcr.id}`}>
                  {rcr.details}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
