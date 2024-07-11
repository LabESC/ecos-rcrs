import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { useState } from "react";

export function RequestUFCPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, createNewUFC } = props;

  // ! Constantes
  const types = [
    "App store/Marketplace",
    "Forum",
    "Issue Tracker",
    "Mailing list",
    "Questionnaire",
    "Social media platform",
    "Software repository",
    "User feedback tool",
  ];

  return (
    <Dialog
      fullScreen={fullScreen}
      style={{
        backgroundColor: "transparent",
      }}
      open={open}
      onClose={close}
      aria-labelledby="responsive-dialog-rcr"
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
        Register new User Feedback Channel
      </DialogTitle>

      <DialogContent dividers style={{ background: "#e5e5e5" }}>
        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">Type*</Typography>
          <Autocomplete
            id="txt-ufc-type"
            options={types /*.filter((type) => selectedType !== type)*/}
            getOptionLabel={(option) => option}
            sx={{
              width: "100%", //marginLeft: "20px", width: "50%"
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Choose a type" /*label="Choose a type"*/
              />
            )}
          />
        </Box>

        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">Name*</Typography>
          <TextField
            id="txt-ufc-name"
            variant="outlined"
            fullWidth
            placeholder="Insert the name of the user feedback channel"
          />
        </Box>
        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">Description</Typography>
          <TextField
            id="txt-ufc-details"
            variant="outlined"
            fullWidth
            placeholder="Insert a description for the user feedback channel"
            multiline
            maxRows={4}
          />
        </Box>

        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">URL</Typography>
          <TextField
            id="txt-ufc-url"
            variant="outlined"
            fullWidth
            placeholder="Insert the url for the user feedback channel"
            multiline
            maxRows={2}
          />
        </Box>
      </DialogContent>

      <DialogActions
        style={{
          background: "#d6d6d6",
        }}
      >
        <Button
          sx={{ marginTop: "0 !important" }}
          className="LoginBtnSignUp"
          onClick={createNewUFC}
        >
          REGISTER
        </Button>
      </DialogActions>
    </Dialog>
  );
}
