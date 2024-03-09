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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Snackbar,
  Alert,
  AlertTitle,
  CircularProgress,
  Slide,
  Checkbox,
  IconButton,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircleCheckedFilled from "@mui/icons-material/CheckCircle";
import CircleUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";

// ! Importações de componentes criados
import { IssueModalDetail } from "./Issues/IssueModalDetail.jsx";
import "./OpenRCRDefinitionVotePopUp.css";

// ! Importações de códigos
import { verifyLoggedUser, removeLoggedUser } from "../../api/Auth.jsx";
import {
  updateDefinitionRCRWithStatus,
  getIssueDetailsFromTopicDataLocalStorage,
  getIssueDetailsWithRelatedScoreFromTopicDataLocalStorage,
} from "../../api/Environments";

// ! Função para os título dos steps
function getSteps() {
  return [
    <Typography variant="body1" key="t1" style={{ fontWeight: "bold" }}>
      Confirm all RCRs associated to this environment
    </Typography>,
    <Typography variant="body1" key="t2" style={{ fontWeight: "bold" }}>
      Define a closing date for the voting
    </Typography>,
    <Typography variant="body1" key="t2" style={{ fontWeight: "bold" }}>
      Voting Share URL
    </Typography>,
  ];
}
// ! Função para a transição do Dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function OpenRCRDefinitionVotePopUp(props) {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, rcrs, environmentId } = props;

  // ! Variavies para os steps
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    message: "",
    severity: "error",
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [finalStepContent, setFinalStepContent] = useState({
    url: "",
    message: "",
  });
  const steps = getSteps();

  // ! Função para controlar a passagem entre os steps
  const goToNextStep = () => {
    setActiveStep((activeStep) => activeStep + 1);
  };

  const goToPreviousStep = () => {
    setActiveStep((activeStep) => activeStep - 1);
  };

  const goToClosingDateStep = () => {
    if (rcrsSelected.length === 0) {
      setAlertContent({
        title: "RCRs",
        message: "Please select at least one RCR to proceed",
        severity: "error",
      });
      setAlertOpen(true);
      return;
    }
    goToNextStep();
  };

  // ! Componentes para controlar o modal de issue
  const [issueModal, setIssueModal] = useState({
    id: null,
    issueId: "",
    repo: "",
    body: "",
    tags: "",
    score: "",
    relatedToScore: "",
  });

  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const openMainIssueOnModal = (issue) => {
    const issueData = getIssueDetailsFromTopicDataLocalStorage(issue);
    setIssueModal(issueData);
    setIssueModalOpen(true);
  };

  const openRelatedIssueOnModal = (issueId, mainIssueId, topicNum) => {
    const issueData = getIssueDetailsWithRelatedScoreFromTopicDataLocalStorage(
      parseInt(issueId),
      parseInt(mainIssueId),
      parseInt(topicNum)
    );
    setIssueModal(issueData);
    setIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
  };

  // ! Funcao para manipular copia da url de votacao
  const [openURLCopied, setOpenURLCopied] = useState(false);

  const closeURLSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenURLCopied(false);
  };

  const copyURL = () => {
    navigator.clipboard.writeText(finalStepContent.url);
    setOpenURLCopied(true);
  };

  // ! Função para controlar as rcrs que serão levadas a votação
  const [rcrsSelected, setRcrsSelected] = useState([]);

  const handleRCRSelection = (rcrId, event) => {
    if (rcrsSelected.includes(rcrId)) {
      const newRcrsSelected = rcrsSelected.filter((r) => r !== rcrId);
      console.log(newRcrsSelected);
      setRcrsSelected(newRcrsSelected);
    } else {
      console.log(rcrsSelected.concat(rcrId));
      setRcrsSelected(rcrsSelected.concat(rcrId));
    }
  };

  const checkRCRSelected = (rcrId) => {
    return rcrsSelected.includes(rcrId);
  };

  // ! Função para o conteudo de cada step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box style={{ width: "100% !important" }}>
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                width: "100% !important",
              }}
            >
              {rcrs.map((rcr) => {
                return (
                  <Box
                    key={`BOX__ORCRDVPop_${rcr.id}`}
                    style={{
                      width: "100%",
                      margin: "0.2em",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <Checkbox
                      key={`CHCK_${rcr.id}`}
                      icon={<CircleUnchecked />}
                      checkedIcon={<CircleCheckedFilled />}
                      checked={checkRCRSelected(rcr.id)}
                      onChange={(e) => {
                        handleRCRSelection(rcr.id, e);
                      }}
                      inputProps={{ "aria-label": "controlled" }}
                      color="success"
                    />
                    <Accordion
                      key={`ACC-${rcr.id}`}
                      style={{ minWidth: "95%" }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
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
                          <strong> Description: </strong>
                          {rcr.details}
                        </Typography>
                        <Box style={{ alignItems: "center !important" }}>
                          <strong>Main Issue: </strong>
                          <Button
                            variant="outlined"
                            style={{ padding: "0em", marginLeft: "0.4em" }}
                            onClick={() => {
                              openMainIssueOnModal(rcr.mainIssue);
                            }}
                          >
                            {rcr.mainIssue}
                          </Button>
                        </Box>

                        <Box style={{ alignItems: "center !important" }}>
                          <strong>Related To issues:</strong>
                          {rcr.relatedToIssues.map((issue) => {
                            return (
                              <Button
                                key={`RelIssue-${issue}`}
                                variant="outlined"
                                style={{
                                  padding: "0em",
                                  marginLeft: "0.4em",
                                  marginTop: "0.8em",
                                }}
                                onClick={() => {
                                  openRelatedIssueOnModal(
                                    issue,
                                    rcr.mainIssue,
                                    rcr.topicNum
                                  );
                                }}
                              >
                                {issue}
                              </Button>
                            );
                          })}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                );
              })}
            </Box>
            <Box>
              <Button
                variant="outlined"
                autoFocus
                onClick={goToClosingDateStep}
                color="info"
                style={{ marginTop: "0.8em", marginLeft: "0.8em" }}
              >
                CONFIRM
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <>
            <Box
              className="ContainerTextField"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                width: "100% !important",
              }}
            >
              <Typography variant="body" component="h5" gutterBottom>
                Closing date:
              </Typography>
              <input
                id="txt-date"
                //placeholder="Select the closing date"
                //required
                //variant="outlined"
                type="datetime-local"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #000000",
                  padding: "0.6em",
                  borderRadius: "15px",
                  fontFamily: "Montserrat",
                }}
              />
            </Box>
            <Box
              className="ContainerStep"
              style={{
                marginTop: "1em",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              <Button
                variant="outlined"
                autoFocus
                onClick={goToPreviousStep}
                color="warning"
                style={{ marginRight: "0.8em" }}
              >
                GO BACK
              </Button>
              <Button
                variant="outlined"
                color={finalStepContent.url === "" ? "primary" : "success"}
                onClick={
                  finalStepContent.url === "" ? handleStartVote : goToNextStep
                }
              >
                {isLoading ? (
                  <CircularProgress key="c0" size="1.5em" color="primary" />
                ) : finalStepContent.url === "" ? (
                  "START VOTING"
                ) : (
                  "GET URL"
                )}
              </Button>
            </Box>
          </>
        );
      case 2:
        return (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              width: "100% !important",
            }}
          >
            <Typography
              variant="body1"
              style={{ fontWeight: "bold", marginBottom: "0.7em" }}
            >
              {finalStepContent.message}
            </Typography>

            <Box style={{ display: "flex", alignItems: "center" }}>
              <a
                href={finalStepContent.url}
                target="_blank"
                rel="noreferrer"
                className="linkVoteCopy"
              >
                {finalStepContent.url}
              </a>
              <IconButton
                onClick={() => {
                  copyURL();
                }}
                style={{ color: "rgba(0, 0, 0, 0.87)" }}
                aria-label="copy-url"
              >
                <ContentCopyIcon />
              </IconButton>
            </Box>

            <Button
              variant="outlined"
              onClick={() => {
                redirect("/my-environments");
              }}
              color="info"
              style={{ marginTop: "1em" }}
            >
              GO TO MY ENVIRONMENTS
            </Button>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  // ! Confirmando inicio da votacao
  const handleStartVote = async () => {
    setIsLoading(true);
    // ! FAZER O POST PARA INICIAR A VOTACAO
    let minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);

    let closingDate = document.getElementById("txt-date").value;

    if (closingDate === "") {
      setAlertContent({
        title: "Closing date",
        message: "Please select a closing date",
        severity: "error",
      });

      setIsLoading(false);
      setAlertOpen(true);
      return;
    }

    closingDate = new Date(closingDate);
    if (closingDate < minDate) {
      setAlertContent({
        title: "Closing date",
        message: "Please select a future date (at least 24h01m from now)",
        severity: "error",
      });
      setIsLoading(false);
      setAlertOpen(true);
      return;
    }

    // . Atualizando
    const loggedUser = await verifyLoggedUser();
    const request = await updateDefinitionRCRWithStatus(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      closingDate,
      rcrsSelected
    );

    if (request === true) {
      setAlertContent({
        title: "Success",
        message: "Voting started successfully!",
        severity: "success",
      });
      setFinalStepContent({
        url: `${window.location.origin}/environment/${environmentId}/definitionvote`,
        message:
          "Here's the link for your environment voting! Share with anyone who needs to vote!",
      });
      setIsLoading(false);
      setAlertOpen(true);
    } else {
      setAlertContent({
        title: "Error",
        message:
          "An error occurred while starting the voting! Try again later!",
        severity: "error",
      });
      setIsLoading(false);
      setAlertOpen(true);
    }
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  return (
    <>
      <Dialog
        fullScreen={true}
        maxWidth="xl"
        style={{
          backgroundColor: "transparent",
        }}
        open={open}
        onClose={close}
        aria-labelledby="responsive-dialog-list-rcr-env"
        TransitionComponent={Transition}
        keepMounted
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
            onClick={
              finalStepContent.url !== ""
                ? () => {
                    redirect("/my-environments");
                  }
                : close
            }
            style={{ marginRight: "2em" }}
          />
          Start Definition RCR poll
        </DialogTitle>

        <DialogContent dividers style={{ background: "#e5e5e5" }}>
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            style={{ width: "100% !important" }}
          >
            {steps.map((label, index) => (
              <Step key={`STP_${index}`}>
                <StepLabel key={`STP_L_${index}`}>{label}</StepLabel>
                <StepContent
                  className="ContainerStep"
                  key={`STP_C_${index}`}
                  style={{
                    width: "100% !important",
                    alignItems: index === 0 ? "flex-start" : "center",
                    justifyContent: index === 0 ? "flex-start" : "center",
                  }}
                >
                  {getStepContent(index)}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>
      <Snackbar
        key={`SNACK_ERRORS_DATA`}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={alertOpen}
        autoHideDuration={alertContent.severity === "error" ? 3000 : null}
        onClose={closeAlert}
      >
        <Alert
          onClose={closeAlert}
          severity={alertContent.severity}
          sx={{ width: "100%" }}
        >
          <AlertTitle>{alertContent.title}</AlertTitle>
          {alertContent.message}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        key={`SNACK_COPY_URL_VALIDATION`}
        open={openURLCopied}
        autoHideDuration={2500}
        onClose={closeURLSnack}
        message="URL Copied!"
      />
      <IssueModalDetail
        open={issueModalOpen}
        close={closeIssueModal}
        closeMessage={"Back"}
        issue={issueModal}
      />
    </>
  );
}
