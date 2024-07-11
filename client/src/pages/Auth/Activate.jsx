import { Button, Box, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { activate } from "../../api/User.jsx";
import theme from "../../components/MuiTheme.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";

const Activate = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Variáveis de estado e padrões
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isActivated, setIsActivated] = useState(false);

  // ! Executado ao iniciar o componente
  useEffect(() => {
    document.title = "SECO - RCR: Validating user";

    // * Chama a função de login e modifica o estado de acordo com o resultado
    const activateUser = async () => {
      // Obtendo o id do usuário
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");

      // Ativando o usuário
      setIsLoading(true);
      const res = await activate(id);
      setIsLoading(false);

      if (res.error) {
        if (res.error.message === "User already active") {
          console.log("FoI");
          setIsActivated(true);
          return;
        }

        activeErrorDialog(res.error.code, res.error.message, res.status);
      } else {
        console.log("FoI");
        setIsActivated(true);
      }
    };
    console.log(isActivated);
    activateUser();
  }, []);

  const goToLoginUp = async () => {
    return redirect("/");
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
        <Box className="LoginCard" sx={{ height: "400px !important" }}>
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
              <Box className="EcosIc">SECO - RCR</Box>
            </Box>
          </Box>
          <Box className="LoginCardContent">
            <CircularProgress
              sx={{ color: "#0084fe" }}
              style={{ display: isLoading ? "block" : "none" }}
            />

            <Button
              variant="contained"
              onClick={() => goToLoginUp()}
              sx={{
                display: isActivated ? "flex !important" : "none !important",
              }}
              size="large"
            >
              GO TO LOGIN
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

export default Activate;
