import {
  TextField,
  Backdrop,
  Container,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  Typography,
  Link,
  useMediaQuery,
} from "@mui/material";
import { useState, useEffect } from "react";
import { registerUser } from "../../api/User.jsx";
import theme from "../../components/MuiTheme.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError, PopUpSuccess } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Variáveis de estado e padrões
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successTitle, setSuccessTitle] = useState("");
  //const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Executado ao iniciar o componente
  useEffect(() => {
    document.title = "ECOS-IC: Sign Up";
  }, []);

  const signUpUser = async () => {
    // * Obtém os valores dos campos de texto
    const name = document.getElementById("txt-name").value;
    const email = document.getElementById("txt-email").value;
    const password = document.getElementById("txt-pass").value;
    const password2 = document.getElementById("txt-pass2").value;

    // * Chama a função de login e modifica o estado de acordo com o resultado
    setIsLoading(true);
    const res = await registerUser(name, email, password, password2);
    setIsLoading(false);

    if (res.error) {
      console.log(res.error);
      activeErrorDialog(res.error.code, res.error.message, res.status);
    } else {
      console.log(res);
      activeSuccessDialog(
        "Success",
        "Your account was created successfully!\nPlease check your e-mail to activate your account.",
        res.status
      );
    }
  };

  const closeErrorDialog = () => {
    setHasLoginError(false);
  };

  const activeErrorDialog = (code, msg, status) => {
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setErrorCode(code);
    setErrorMessage(`${status}:\n${msg}`);
    setHasLoginError(true);
  };

  const closeSuccessDialog = () => {
    redirect("/");
  };

  const activeSuccessDialog = (code, msg, status) => {
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setSuccessTitle(code);
    setSuccessMessage(`${status}:\n${msg}`);
    setWasSuccessful(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(71deg, #0084FE 0%, #42EDF8 100%)",
        }}
      >
        <Box className="LoginCard">
          <Box
            className="LogoWithBackButton"
            style={{ marginBottom: "0px !important" }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                style={{
                  borderLeft: "6px solid #0084fe",
                  height: "50px",
                  marginRight: "10px",
                  color: "#0084fe",
                }}
              />
              <Box className="EcosIc">ECOS - IC</Box>
            </Box>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="BackButton"
              onClick={() => {
                redirect("/");
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </Box>
          <Box className="LoginCardContent">
            <Typography
              variant="h5"
              style={{ fontWeight: "600", marginBottom: "0.3em" }}
              className="SignInText"
            >
              SIGN-UP
            </Typography>
            <Typography className="LoginCardMessage">
              Enter your login credentials to register at the system!
            </Typography>

            <Box className="DivLoginTextAndButtons">
              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">Name</Typography>
                <TextField
                  id="txt-name"
                  variant="outlined"
                  fullWidth
                  placeholder="Insert your name"
                />
              </Box>
              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">E-mail</Typography>
                <TextField
                  id="txt-email"
                  variant="outlined"
                  fullWidth
                  placeholder="Insert your e-mail"
                />
              </Box>

              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">Password</Typography>
                <TextField
                  id="txt-pass"
                  fullWidth
                  variant="outlined"
                  type="password"
                  placeholder="Insert your password"
                />
              </Box>
              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">
                  Password confirmation
                </Typography>
                <TextField
                  id="txt-pass2"
                  fullWidth
                  variant="outlined"
                  type="password"
                  placeholder="Insert your password again"
                />
              </Box>
            </Box>
            <Button
              className="LoginBtnSignUp"
              onClick={() => {
                signUpUser();
              }}
            >
              {isLoading ? "REGISTERING..." : "SIGN UP"}
            </Button>
            <Link
              href="/forgot-password"
              underline="hover"
              className="ForgotYourPassword"
            >
              Forgot your password?
            </Link>
          </Box>
        </Box>
      </Box>
      <PopUpError
        open={hasLoginError}
        close={closeErrorDialog}
        title={errorCode}
        message={errorMessage}
      />
      <PopUpSuccess
        open={wasSuccessful}
        close={closeSuccessDialog}
        title={successTitle}
        message={successMessage}
        closeMessage={"GO TO HOMEPAGE"}
      />
    </ThemeProvider>
  );
};

export default SignUp;
