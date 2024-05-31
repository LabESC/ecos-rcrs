import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
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
  IconButton,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";

// ! Importações de componentes criados
import "./OpenRCRDefinitionVotePopUp.css";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import { updatePriorityRCRWithStatus } from "../../api/Environments.jsx";

// ! Função para os título dos steps
function getSteps() {
  return [
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

export function OpenRCRPriorityVotePopUp(props) {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

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

  // ! Função para o conteudo de cada step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
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
              {/*<Button
                variant="outlined"
                autoFocus
                onClick={goToPreviousStep}
                color="warning"
                style={{ marginRight: "0.8em" }}
              >
                GO BACK
            </Button>*/}
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
      case 1:
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

    // Ordenando as rcrs
    let newRCRs = [...rcrs];

    newRCRs = newRCRs.sort((a, b) => {
      if (a.exclude_to_priority === true) return 1; // Se a rcr foi excluida, ela deve ser a ultima
      if (b.exclude_to_priority === true) {
        let aVotes = 0;
        let bVotes = 0;
        aVotes = a.definition_votes[a.final_vote] / a.definition_votes.counts;
        bVotes = b.definition_votes[b.final_vote] / b.definition_votes.counts;

        // Após obter o coeficiente de votos, pondere a partir do coefifiente de votos e se o voto final é maior ou menor
        // a posição do voto final é mais importante que a quantidade de votos
        if (a.final_vote > b.final_vote) return -1;
        if (a.final_vote <= b.final_vote) {
          if (aVotes > bVotes) return -1;
          else return 1;
        }
      }
    });

    // Gerando a nova posicao de "positions"
    for (let i = 0, j = 1; i < newRCRs.length; i++) {
      if (newRCRs[i].exclude_to_priority === false) {
        newRCRs[i].position = j;
        j++;
      }
    }

    console.log(newRCRs);
    // . Atualizando
    const loggedUser = await verifyLoggedUser();
    const request = await updatePriorityRCRWithStatus(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      closingDate,
      newRCRs //rcrs
    );

    if (request === true) {
      setAlertContent({
        title: "Success",
        message: "Voting started successfully!",
        severity: "success",
      });
      setFinalStepContent({
        url: `${window.location.origin}/environment/${environmentId}/priorityvote`,
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
          Start Priority RCR voting
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
    </>
  );
}
