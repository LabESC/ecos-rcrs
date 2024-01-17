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
  useMediaQuery,
} from "@mui/material";
import { useState, useEffect } from "react";
import { loginUser } from "../../api/User.jsx";
import theme from "../../components/MuiTheme.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";

const Login = () => {
  // ! Variáveis de estado e padrões
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  //const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

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
    }
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
        <div className="LoginCard">
          <div className="Logo">
            <div className="EcosIc">ECOS - IC</div>
            <div className="LogoLine"></div>
          </div>
          <div className="ForgotYourPassword">Forgot your password?</div>
          <div
            className="LoginBtnSignIn"
            onClick={() => {
              authUser();
            }}
          >
            {isLoading ? "Authenticating..." : "SIGN IN"}
          </div>
          <div className="LoginBtnSignOut">SIGN UP</div>
          <div className="DivLoginTextAndButtons">
            <p className="TextFieldLabel">E-mail</p>
            <TextField
              id="txtemail"
              variant="outlined"
              fullWidth
              style={{ top: "30px", position: "absolute" }}
              placeholder="Insert your e-mail"
            />
            <p className="TextFieldLabel" style={{ top: "108px" }}>
              Password
            </p>
            <TextField
              id="txtpass"
              fullWidth
              variant="outlined"
              type="password"
              style={{ top: "134px", position: "absolute" }}
              placeholder="Insert your password"
            />
          </div>
          <div
            className="EnterYourLoginCredentialsToAccess"
            style={{
              width: 265,
              height: 19.78,
              left: 104,
              top: 151.35,
              position: "absolute",
              color: "#6C6C6C",
              fontSize: 14,
              fontFamily: "Montserrat",
              fontWeight: "400",
              wordWrap: "break-word",
            }}
          >
            Enter your login credentials to access!
          </div>
          <div
            className="SignIn"
            style={{
              width: 89,
              height: 31.42,
              left: 193,
              top: 114.11,
              position: "absolute",
              color: "black",
              fontSize: 22,
              fontFamily: "Montserrat",
              fontWeight: "600",
              textTransform: "uppercase",
              wordWrap: "break-word",
            }}
          >
            SIGN-IN
          </div>
        </div>
      </div>
      {/*<Dialog
        fullScreen={fullScreen}
        open={hasLoginError}
        onClose={closeErrorDialog}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle
          id="responsive-dialog-title"
          style={{ color: "red", fontWeight: "bold" }}
        >
          {errorCode}
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: "500" }}>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={closeErrorDialog}>
            FECHAR
          </Button>
        </DialogActions>
        </Dialog>*/}
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
