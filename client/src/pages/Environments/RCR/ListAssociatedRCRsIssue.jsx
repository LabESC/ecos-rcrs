import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Popover,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { StarFillIcon } from "@primer/octicons-react";
import { useState } from "react";

export function ListAssociatedRCRsPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, rcrs, mainIssueId } = props;

  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopOver = Boolean(anchorEl);

  return (
    <Dialog
      fullScreen={fullScreen}
      style={{
        backgroundColor: "transparent",
      }}
      open={open}
      onClose={close}
      aria-labelledby="responsive-dialog-list-rcr"
      //style={{ background: "#D6D6D6" }}
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
        All RCRs associated to this issue
      </DialogTitle>

      <DialogContent dividers style={{ background: "#e5e5e5" }}>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "inherit",
          }}
        >
          {rcrs.map((rcr) => {
            return (
              <Accordion key={`ACC-${rcr.id}`} style={{ minWidth: "95%" }}>
                <AccordionSummary
                  //expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id={`ACC-SUMM-${rcr.id}`}
                  style={{ alignItems: "center !important" }}
                >
                  {rcr.mainIssue === mainIssueId ? (
                    <Box
                      className="StarDivIcon"
                      style={{
                        marginRight: "0.5em",
                        color: "#edd500",
                      }}
                      aria-owns={openPopOver ? "mouse-over-popover" : undefined}
                      aria-haspopup="true"
                      onMouseEnter={handlePopoverOpen}
                      onMouseLeave={handlePopoverClose}
                    >
                      <StarFillIcon />
                      <Popover
                        id="mouse-over-popover"
                        sx={{
                          pointerEvents: "none",
                        }}
                        open={openPopOver}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                        onClose={handlePopoverClose}
                        disableRestoreFocus
                      >
                        <Typography
                          variant="body2"
                          style={{ padding: "0.2em 0.5em" }}
                        >
                          Associated as main issue
                        </Typography>
                      </Popover>
                    </Box>
                  ) : (
                    ""
                  )}
                  <strong>{`#${rcr.id} - ${rcr.name}`}</strong>
                </AccordionSummary>
                <AccordionDetails id={`ACC-DET-${rcr.id}`}>
                  {rcr.details}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
