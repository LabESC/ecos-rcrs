import { TextField, Button, Link, Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { loginUser } from "../../api/User.jsx";
import theme from "../../components/MuiTheme.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { registerLoggedUser } from "../../api/Auth.jsx";

const Login = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Variáveis de estado e padrões
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ! Executado ao iniciar o componente
  useEffect(() => {
    document.title = "ECOS-IC: Login";
  }, []);

  const authUser = async () => {
    // * Obtém os valores dos campos de texto
    const email = document.getElementById("txtemail").value;
    const password = document.getElementById("txtpass").value;

    // * Chama a função de login e modifica o estado de acordo com o resultado
    setIsLoading(true);
    const res = await loginUser(email, password);
    setIsLoading(false);

    if (res.error) {
      console.log(res.error);
      activeErrorDialog(res.error.code, res.error.message, res.status);
    } else {
      console.log(res);
      await registerLoggedUser(res.id, res.token);
      return redirect("/my-environments"); // !! TESTE, trocar
    }
  };

  const goToSignUp = async () => {
    return redirect("/register");
  };

  const activeErrorDialog = (code, msg, status) => {
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setErrorCode(code);
    setErrorMessage(`${status}:\n${msg}`);
    setHasLoginError(true);
  };

  const closeErrorDialog = () => {
    setHasLoginError(false);
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
          <Box className="LogoWithBackButton">
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
          </Box>
          <Box className="LoginCardContent">
            <Typography
              variant="h5"
              style={{ fontWeight: "600", marginBottom: "0.3em" }}
              className="SignInText"
            >
              SIGN-IN
            </Typography>
            <Typography className="LoginCardMessage">
              Enter your login credentials to access!
            </Typography>

            <Box className="DivLoginTextAndButtons">
              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">E-mail</Typography>
                <TextField
                  id="txtemail"
                  variant="outlined"
                  fullWidth
                  placeholder="Insert your e-mail"
                />
              </Box>

              <Box className="ButtonArea">
                <Typography className="TextFieldLabel">Password</Typography>
                <TextField
                  id="txtpass"
                  fullWidth
                  variant="outlined"
                  type="password"
                  placeholder="Insert your password"
                />
              </Box>
            </Box>
            <Button className="LoginBtnSignIn" onClick={() => authUser()}>
              {isLoading ? "Authenticating..." : "SIGN IN"}
            </Button>
            <Link
              href="/forgot-password"
              underline="hover"
              className="ForgotYourPassword"
            >
              Forgot your password?
            </Link>
            <Button className="LoginBtnSignUp" onClick={() => goToSignUp()}>
              SIGN UP
            </Button>
          </Box>
        </Box>
      </Box>

      <PopUpError
        open={hasLoginError}
        close={closeErrorDialog}
        title={errorCode}
        message={errorMessage}
      />
    </ThemeProvider>
  );
};

export default Login;
