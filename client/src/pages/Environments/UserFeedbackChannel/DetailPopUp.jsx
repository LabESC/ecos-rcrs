import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Autocomplete,
  Box,
  Button,
  TextField,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

export function DetailUFCPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, ufc, updateUFC } = props;

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
        User Feedback Channel
      </DialogTitle>

      <DialogContent dividers style={{ background: "#e5e5e5" }}>
        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">
            Type* {ufc.name === "GitHub" ? "(Not able to update)" : ""}
          </Typography>
          <Autocomplete
            id="txt-ufc-type-upd"
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
            readOnly={ufc.name === "GitHub"}
            defaultValue={ufc.type}
          />
        </Box>
        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">
            Name* {ufc.name === "GitHub" ? "(Not able to update)" : ""}
          </Typography>
          <TextField
            id="txt-ufc-name-upd"
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: ufc.name === "GitHub",
            }}
            defaultValue={ufc.name}
          />
        </Box>
        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">Description</Typography>
          <TextField
            id="txt-ufc-details-upd"
            variant="outlined"
            fullWidth
            multiline
            maxRows={4}
            defaultValue={ufc.details}
          />
        </Box>

        <Box className="ButtonArea">
          <Typography className="TextFieldLabel">URL</Typography>
          <TextField
            id="txt-ufc-url-upd"
            variant="outlined"
            fullWidth
            multiline
            maxRows={2}
            defaultValue={ufc.url}
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
          onClick={updateUFC}
        >
          UPDATE
        </Button>
      </DialogActions>
    </Dialog>
  );
}
