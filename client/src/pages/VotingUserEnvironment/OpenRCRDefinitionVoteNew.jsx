import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
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
import {
  createVotingUser,
  generateAccessCode,
  registerDefinitionVotes,
  setDefinitionVoteToLocalStorage,
} from "../../api/VotingUser";

function getSteps() {
  return [
    <Typography variant="body1" key="t1" style={{ fontWeight: "bold" }}>
      Insert your e-mail
    </Typography>,
    <Typography variant="body1" key="t2" style={{ fontWeight: "bold" }}>
      Validate your e-mail
    </Typography>,
    <Typography variant="body1" key="t3" style={{ fontWeight: "bold" }}>
      Vote registered successfully!
    </Typography>,
  ];
}

export function OpenRCRDefinitionVotePopUpNew(props) {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, vote, environmentId } = props;

  // ! Variavies para os steps
  const [email, setEmail] = useState("");
  const [votingUserId, setVotingUserId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    message: "",
    severity: "error",
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [voteRegisteredType, setVoteRegisteredType] = useState("new");
  const steps = getSteps();

  const goToNextStep = () => {
    setActiveStep((activeStep) => activeStep + 1);
  };

  const goBackStep = () => {
    setActiveStep((activeStep) => activeStep - 1);
  };

  const registerVotingUser = async () => {
    setIsLoading(true);

    // . Verificando se o e-mail foi inserido
    if (email === "") {
      setAlertContent({
        title: "E-mail",
        message: "Please insert your e-mail",
        severity: "error",
      });
      setIsLoading(false);
      setAlertOpen(true);
      return;
    }

    // . Criando o usuário votante
    const request = await createVotingUser(email);

    if (request.error) {
      setAlertContent({
        title: "Error",
        message: request.error,
        severity: "error",
      });
      setIsLoading(false);
      setAlertOpen(true);
      return;
    }

    setVotingUserId(request.id);

    // . Gerando o código de acesso
    const accessCode = await generateAccessCode(email);

    if (accessCode !== true) {
      setAlertContent({
        title: "Error",
        message: accessCode.error,
        severity: "error",
      });
      setIsLoading(false);
      setAlertOpen(true);
      return;
    }

    setIsLoading(false);
    goToNextStep();
  };

  const registeringVote = async () => {
    console.log(vote);
    setDefinitionVoteToLocalStorage(vote);
    redirect(`/environment/${environmentId}/priorityvote`);
    /*
    setVoteRegisteredType(request);
    setIsLoading(false);
    goToNextStep();*/
  };

  // ! Função para o conteudo de cada step
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
          Voting
        </DialogTitle>

        <DialogContent dividers style={{ background: "#e5e5e5" }}>
          <>
            <Box className="ContainerTextField">
              <Typography variant="body" component="h5" gutterBottom>
                Vote is registered locally (in your browser). Please click on
                the button below to prioritize the RCRs voted.
              </Typography>
            </Box>
            <Box className="ContainerStep" style={{ marginTop: "1em" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={registeringVote}
              >
                {isLoading ? (
                  <CircularProgress key="c0" size="1.5em" color="white" />
                ) : (
                  "GO TO PRIORITY VOTE"
                )}
              </Button>
            </Box>
          </>
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={alertOpen}
        autoHideDuration={3000}
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
