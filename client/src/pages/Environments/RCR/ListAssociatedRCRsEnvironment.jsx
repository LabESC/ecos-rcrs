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
  Button,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { useState } from "react";

// ! Importações de componentes criados
import {
  getIssueDetailsFromTopicDataLocalStorage,
  getIssueDetailsWithRelatedScoreFromTopicDataLocalStorage,
} from "../../../api/Environments";
import { IssueModalDetail } from "./IssueModalDetail.jsx";

export function ListAssociatedRCRsEnvPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ! Imports do props (recebidos do componente pai)
  const { open, close, rcrs } = props;

  // ! Componentes para controlar o modal de issue
  const [issueModal, setIssueModal] = useState({
    id: null,
    issueId: "",
    repo: "",
    body: "",
    tags: "",
    score: "",
    relatedToScore: "",
  });

  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const openMainIssueOnModal = (issue) => {
    const issueData = getIssueDetailsFromTopicDataLocalStorage(issue);
    setIssueModal(issueData);
    setIssueModalOpen(true);
  };

  const openRelatedIssueOnModal = (issueId, mainIssueId, topicNum) => {
    const issueData = getIssueDetailsWithRelatedScoreFromTopicDataLocalStorage(
      parseInt(issueId),
      parseInt(mainIssueId),
      parseInt(topicNum)
    );
    setIssueModal(issueData);
    setIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
  };

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        style={{
          backgroundColor: "transparent",
        }}
        open={open}
        onClose={close}
        aria-labelledby="responsive-dialog-list-rcr-env"
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
          All RCRs identified at this environment
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
                  >
                    <strong>{`#${rcr.id} - ${rcr.name}`}</strong>
                  </AccordionSummary>
                  <AccordionDetails id={`ACC-DET-${rcr.id}`}>
                    <Typography>
                      <strong> Topic: </strong> {rcr.topicNum}
                    </Typography>
                    <Typography>
                      <strong> Description: </strong>
                      {rcr.details}
                    </Typography>
                    <Box style={{ alignItems: "center !important" }}>
                      <strong>Main Issue: </strong>
                      <Button
                        variant="outlined"
                        style={{ padding: "0em", marginLeft: "0.4em" }}
                        onClick={() => {
                          openMainIssueOnModal(rcr.mainIssue);
                        }}
                      >
                        {rcr.mainIssue}
                      </Button>
                    </Box>

                    <Box style={{ alignItems: "center !important" }}>
                      <strong>Related To issues:</strong>
                      {rcr.relatedToIssues.map((issue) => {
                        return (
                          <Button
                            key={`RelIssue-${issue}`}
                            variant="outlined"
                            style={{
                              padding: "0em",
                              marginLeft: "0.4em",
                              marginTop: "0.8em",
                            }}
                            onClick={() => {
                              openRelatedIssueOnModal(
                                issue,
                                rcr.mainIssue,
                                rcr.topicNum
                              );
                            }}
                          >
                            {issue}
                          </Button>
                        );
                      })}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
      <IssueModalDetail
        open={issueModalOpen}
        close={closeIssueModal}
        closeMessage={"Back"}
        issue={issueModal}
      />
    </>
  );
}
