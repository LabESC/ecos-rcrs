//Definindo padrões de tema para MUI
import { createTheme } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: ["Montserrat", "sans-serif"].join(","),
  },
  palette: {
    success2: {
      main: "#71ead2",
      darker: "#01e7b9",
    },
    error2: {
      main: "#e779c1",
      darker: "#e922a3",
    },
    info2: {
      main: "#8458f3",
      darker: "#492ae0",
    },
    white: {
      main: "#ffffff",
      darker: "#e0e0e0",
    },
  },
});

export default theme;
