import { useState, useEffect } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Container,
  TextField,
  Link,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../components/MuiTheme.jsx";
import "./Password.css";
import { PopUpError } from "../../components/PopUp.jsx";
import {
  getTokenForPassword,
  validatingTokenForPassword,
  updatePassword,
} from "../../api/User.jsx";

function getSteps() {
  return [
    <Typography variant="body1" key="t1" style={{ fontWeight: "bold" }}>
      Enter your e-mail
    </Typography>,
    <Typography variant="body1" key="t2" style={{ fontWeight: "bold" }}>
      Validate your Token
    </Typography>,
    <Typography variant="body1" key="t3" style={{ fontWeight: "bold" }}>
      Insert your new password
    </Typography>,
    <Typography variant="body1" key="t3" style={{ fontWeight: "bold" }}>
      Password updated
    </Typography>,
  ];
}

export default function ForgotPassword() {
  // ! Executado ao iniciar o componente
  useEffect(() => {
    document.title = "ECOS-IC: Password reset";
  }, []);

  // ! Variáveis de estado e padrões
  const [hasError, setHasError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeErrorDialog = (code, msg, status) => {
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setErrorCode(code);
    setErrorMessage(`${status}:\n${msg}`);
    setHasError(true);
  };

  const closeErrorDialog = () => {
    setHasError(false);
  };

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();

  // ! Função para sair da primeira etapa
  const goToToken = async () => {
    setIsLoading(true);
    // * Obtém os valores dos campos de texto
    const emailValue = document.getElementById("txt-email").value;

    // * Verifica se o campo está vazio
    if (emailValue === "") {
      activeErrorDialog("EMAIL", "The email field is empty", 400);
      setIsLoading(false);
      return;
    }

    // * Chama a função de login e modifica o estado de acordo com o resultado
    setEmail(emailValue);
    const res = await getTokenForPassword(emailValue);

    if (res.error) {
      activeErrorDialog(res.error.code, res.error.message, res.status);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setActiveStep(1);
  };

  // ! Função para sair da segunda etapa
  const goToPassword = async () => {
    setIsLoading(true);
    // * Obtém os valores dos campos de texto
    const tokenValue = document.getElementById("txt-token").value;

    // * Verifica se o e-mail está vazio
    if (email === "") {
      activeErrorDialog("EMAIL", "The email field is empty", 400);
      setIsLoading(false);
      return;
    }

    // * Verifica se os outros campos está vazio
    if (tokenValue === "") {
      activeErrorDialog("TOKEN", "The token field is empty", 400);
      setIsLoading(false);
      return;
    }

    // * Chama a função de validar token e modifica o estado de acordo com o resultado
    setToken(tokenValue);
    const res = await validatingTokenForPassword(email, tokenValue);

    if (res.error) {
      activeErrorDialog(res.error.code, res.error.message, res.status);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setActiveStep(2);
  };

  // ! Função para finalizar processo
  const finish = async () => {
    setIsLoading(true);
    // * Obtém os valores dos campos de texto
    const pwd = document.getElementById("txt-pwd").value;
    const pwd2 = document.getElementById("txt-pwd-2").value;

    // * Verifica se o campo está vazio
    if (email === "") {
      activeErrorDialog("EMAIL", "The email field is empty", 400);
      setIsLoading(false);
      return;
    }

    if (token === "") {
      activeErrorDialog("TOKEN", "The token field is empty", 400);
      setIsLoading(false);
      return;
    }

    if (pwd === "") {
      activeErrorDialog("PASSWORD", "The password field is empty", 400);
      setIsLoading(false);
      return;
    }

    if (pwd2 === "") {
      activeErrorDialog(
        "PASSWORD VALIDATION",
        "The password validation field is empty",
        400
      );
      setIsLoading(false);

      return;
    }

    if (pwd !== pwd2) {
      activeErrorDialog(
        "PASSWORD VALIDATION",
        "The passwords are not coherent.\nPlease try again.",
        400
      );
      setIsLoading(false);
      return;
    }

    // * Chama a função de validar token e modifica o estado de acordo com o resultado
    const res = await updatePassword(email, pwd, token);

    if (res.error) {
      activeErrorDialog(res.error.code, res.error.message, res.status);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setActiveStep(3);
  };

  // !! Função para voltar a homepage
  // const goToHome = async () => {};

  // ! Elementos
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Container className="ContainerTextField">
              <Typography variant="body" component="h5" gutterBottom>
                E-mail:
              </Typography>

              <TextField
                id="txt-email"
                placeholder="Insert your e-mail"
                type="email"
                required
                variant="outlined"
              />
            </Container>
            <Container className="ContainerStep" style={{ marginTop: "1em" }}>
              <Button variant="contained" color="primary" onClick={goToToken}>
                {isLoading ? (
                  <CircularProgress key="c0" size="1.5em" color="white" />
                ) : (
                  "Next"
                )}
              </Button>
            </Container>
          </>
        );
      case 1:
        return (
          <>
            <Container className="ContainerTextField">
              <Typography variant="body" component="h5" gutterBottom>
                Token received:
              </Typography>

              <TextField
                id="txt-token"
                placeholder="Insert the token you received by e-mail"
                required
                variant="outlined"
              />
            </Container>
            <Container className="ContainerStep" style={{ marginTop: "1em" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={goToPassword}
              >
                {isLoading ? (
                  <CircularProgress key="c1" size="1.5em" color="white" />
                ) : (
                  "Next"
                )}
              </Button>
            </Container>
          </>
        );
      case 2:
        return (
          <>
            <Container className="ContainerTextField">
              <Typography variant="body" component="h5" gutterBottom>
                New password:
              </Typography>

              <TextField
                id="txt-pwd"
                placeholder="Insert the password"
                type="password"
                required
                variant="outlined"
              />
            </Container>
            <Container className="ContainerTextField">
              <Typography variant="body" component="h5" gutterBottom>
                New password confirmation:
              </Typography>

              <TextField
                id="txt-pwd-2"
                placeholder="Insert the password again"
                type="password"
                required
                variant="outlined"
              />
            </Container>
            <Container className="ContainerStep" style={{ marginTop: "1em" }}>
              <Button variant="contained" color="primary" onClick={finish}>
                {isLoading ? (
                  <CircularProgress key="c2" size="1.5em" color="white" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </Container>
          </>
        );
      case 3:
        return (
          <Link
            href="/"
            underline="hover"
            className="ForgotYourPassword"
            style={{ fontWeight: "bold" }}
          >
            Go back to homepage
          </Link>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(71deg, #0084FE 0%, #42EDF8 100%)",
        }}
      >
        <div
          className="LoginCardPwd"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            Reset your password
          </Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={`STP_${index}`}>
                <StepLabel key={`STP_L_${index}`}>{label}</StepLabel>
                <StepContent className="ContainerStep" key={`STP_C_${index}`}>
                  {getStepContent(index)}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </div>
      </div>
      <PopUpError
        open={hasError}
        close={closeErrorDialog}
        title={errorCode}
        message={errorMessage}
      />
    </ThemeProvider>
  );
}
