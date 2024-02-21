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
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ! Importações de códigos
import { verifyLoggedUser, removeLoggedUser } from "../../api/Auth.jsx";
import { updateDefinitionRCRWithStatus } from "../../api/Environments";

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

  const goToNextStep = () => {
    setActiveStep((activeStep) => activeStep + 1);
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
            <Box>
              <Button autoFocus onClick={goToNextStep} color="error">
                CONFIRM
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <>
            <Box className="ContainerTextField">
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
            <Box className="ContainerStep" style={{ marginTop: "1em" }}>
              <Button
                variant="contained"
                color={finalStepContent.url === "" ? "primary" : "success"}
                onClick={
                  finalStepContent.url === "" ? handleStartVote : goToNextStep
                }
              >
                {isLoading ? (
                  <CircularProgress key="c0" size="1.5em" color="white" />
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

            <a href={finalStepContent.url} target="_blank" rel="noreferrer">
              {finalStepContent.url}
            </a>

            <Button
              variant="contained"
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
      closingDate
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
    </>
  );
}
