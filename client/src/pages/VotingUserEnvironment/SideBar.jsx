// Sidebar.js
import React, { useState, useEffect } from "react";

// ! Componentes MUI + Estilização
import { Drawer, Button, Container, Box } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import MenuIcon from "@mui/icons-material/Menu";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../components/MuiTheme.jsx";

const Sidebar = (props) => {
  const { pageContent } = props;
  const [open, setOpen] = useState(true);
  const openWidth = 265; // Fixed width when the sidebar is open
  const closeWidth = 145; // Fixed width when the sidebar is closed
  useEffect(() => {
    const checkOpenSidebarLocalStorage = () => {
      const openSidebar = localStorage.getItem("SECO_24_open-sidebar");
      if (openSidebar === null) {
        localStorage.setItem("SECO_24_open-sidebar", "1");
      } else if (openSidebar === "1") {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    checkOpenSidebarLocalStorage();
  }, []);

  const handleToggle = () => {
    localStorage.setItem("SECO_24_open-sidebar", open ? "0" : "1"); // . Salvando o estado novo do sidebar no localStorage
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "row",
          background: "white",
        }}
      >
        {/*  Sidebar */}
        <Drawer
          variant="permanent"
          open={open}
          className="SideBar"
          sx={{
            width: open ? openWidth : closeWidth,
          }}
        >
          <Box
            style={{ display: "flex", flexDirection: "row", marginTop: "1em" }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  borderLeft: !open ? "4px solid #0084fe" : "6px solid #0084fe",
                  height: !open ? "18px" : "25px",
                  marginRight: "10px",
                  color: "#0084fe",
                  transition: "height .2s",
                }}
              />
              <Box
                className="EcosIc"
                sx={{
                  fontSize: !open ? "0px !important" : "15px !important",
                  transition: "font-size .2s",
                }}
              >
                SECO - RCR
              </Box>
            </Box>
            <Button
              onClick={handleToggle}
              style={{ padding: "0.1em", minWidth: "auto", marginLeft: "1em" }}
            >
              {open ? (
                <NavigateBeforeIcon sx={{ fontSize: "medium" }} />
              ) : (
                <MenuIcon sx={{ fontSize: "medium" }} />
              )}
            </Button>
          </Box>
        </Drawer>

        {/*  Conteúdo da página */}
        <Container
          sx={{
            transition: "margin .2s",
            width: `calc(100% - ${open ? openWidth : closeWidth}px)`,
            marginTop: "1.5em",
          }}
          id="page-content"
        >
          {pageContent()}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Sidebar;
