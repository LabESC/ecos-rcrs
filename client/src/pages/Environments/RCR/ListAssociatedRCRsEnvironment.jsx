import {
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
} from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PeopleIcon } from "@primer/octicons-react";
import { useState } from "react";
import Papa from "papaparse";
import { ArrowUpIcon, FeedIssueDraftIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import {
  updateRCRPrioritiesAtDefinitionData,
  getIssueDetailsWithRelatedScoreFromTopicDataLocalStorage,
  updateRCRAtDefinitionData,
  deleteRCRAtDefinitionData,
  getIssueDataWithRelatedScoreFromTopicDataAtLocalStorage,
  getIssueDataFromTopicDataAtLocalStorage,
  getIssueDetailsFromTopicByTopicNumDataLocalStorage,
} from "../../../api/Environments";
import { IssueModalDetail } from "./IssueModalDetail.jsx";
import { DeleteRCRConfirm } from "./DeleteRCR.jsx";
import { UpdateRCRAfterTopicPopUp } from "./UpdateRCRAfterTopicPopUp.jsx";
import { SuccessButton } from "../../../components/Buttons.jsx";

export function ListAssociatedRCRsEnvPopUp(props) {
  // ! Imports para o popUp
  const theme = useTheme();

  // ! Imports do props (recebidos do componente pai)
  const {
    open,
    close,
    environmentId,
    environmentName,
    rcrs,
    setDefinitionRCRs,
    loggedUser,
    setIsLoading,
    openVotingModal,
  } = props;

  // . Definindo o regex para caracteres inválidos para nome de arquivo
  const invalidFileNameCharsRegex = /[\\/:\*\?"<>\|]/g;

  // ! Funções para exportacao da rcrs para csv
  const generateCSVPapaparse = () => {
    setIsLoading(true);
    const data = [];

    // !! AVALIAR AS VARIAVEIS DO OBJETO JSON
    rcrs.forEach((rcr) => {
      data.push({
        priority: rcr.priority,
        id: rcr.id,
        name: rcr.name,
        details: rcr.details,
        mainIssue: rcr.mainIssue.url,
        relatedToIssues: rcr.relatedToIssues
          .map((issue) => issue.url)
          .toString(),
      });
    });

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    // . Criando um elemento com o link para download do arquivo
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      environmentName.replace(invalidFileNameCharsRegex, "_")
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setIsLoading(false);
  };

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

  const openIssueDetailModal = (topicNum, issueId, mainIssueId = null) => {
    // . Obtendo os dados do tópico
    let issue;
    if (mainIssueId) {
      issue = getIssueDataWithRelatedScoreFromTopicDataAtLocalStorage(
        topicNum,
        issueId,
        mainIssueId
      );
    } else {
      issue = getIssueDataFromTopicDataAtLocalStorage(topicNum, issueId);
    }

    // . Verificando se ocorreu algum erro
    if (!issue) {
      activeErrorDialog(
        "Getting issue data",
        "There was an error getting the issue data",
        500
      );
      return;
    }

    // . Armazenando os dados da issue
    setIssueModal(issue);
    setIssueModalOpen(true);
  };

  const openMainIssueOnModal = async (issue, topic) => {
    const issueData = await getIssueDetailsFromTopicByTopicNumDataLocalStorage(
      issue,
      topic
    );
    if (!issueData) return;
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

  const [editRCROpen, setEditRCROpen] = useState(false);
  const [editRCR, setEditRCR] = useState({
    id: null,
    name: null,
    details: null,
    relatedToIssues: [],
    mainIssue: null,
  });
  const [editRCRRelatedIssues, setEditRCRRelatedIssues] = useState([]);
  const [editRCRTitle, setEditRCRTitle] = useState(""); // . Armazena o nome da RCR posta para edicao
  const [editRCRDetails, setEditRCRDetails] = useState(""); // . Armazena os detalhes da RCR posta para edicao

  const openEditRCR = (rcr) => {
    setEditRCR(rcr);
    setEditRCRTitle(rcr.name);
    setEditRCRDetails(rcr.details);
    setEditRCRRelatedIssues([...rcr.relatedToIssues]);
    setEditRCROpen(true);
  };

  const closeEditRCR = () => {
    setEditRCROpen(false);
  };

  // ! Funções para alerts relacionados ao RCR
  const [hasAlert, setHasAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    title: "",
    message: "",
    severity: "",
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [rcrToUpdateOrChange, setRcrToUpdateOrChange] = useState({});

  const closeSearchErrorDialog = () => {
    setHasAlert(false);
  };

  const openDeleteRCR = (rcr) => {
    setRcrToUpdateOrChange(rcr);
    setOpenDeleteDialog(true);
  };

  const closeDeleteRCR = () => {
    setOpenDeleteDialog(false);
  };

  // ! Funções para mudança de posição na RCR
  const [positions, setPositions] = useState({});

  const checkRCRPosition = (rcrId) => {
    // . Buscando no array de rcrs
    for (const rcr of rcrs) {
      if (rcr.id === rcrId) {
        return rcr.priority;
      }
    }
  };

  const changeRCRPosition = (rcrId, directionOfNewPosition) => {
    const newRCRs = rcrs;
    for (let i = 0; i < newRCRs.length; i++) {
      if (newRCRs[i].id === rcrId) {
        if (directionOfNewPosition === "up") {
          if (i === 0) {
            // . Se for a primeira rcr, não faz nada
            return;
          }

          const temp = newRCRs[i].priority;
          newRCRs[i].priority = newRCRs[i - 1].priority;
          newRCRs[i - 1].priority = temp;
          break;
        } else {
          if (i === newRCRs.length - 1) {
            // . Se for a última rcr, não faz nada
            return;
          }

          const temp = newRCRs[i].priority;
          newRCRs[i].priority = newRCRs[i + 1].priority;
          newRCRs[i + 1].priority = temp;
          break;
        }
      }
    }

    // . Reordenando o array de rcrs de acordo com a nova posição
    newRCRs.sort((a, b) => a.priority - b.priority);

    // . Obtendo cada id e a posicao e salvando
    const votesUpdated = [];
    for (const rcr of rcrs) {
      votesUpdated.push({ id: rcr.id, priority: rcr.priority });
    }
    setPositions([...votesUpdated]);
  };

  // . Funcao para salvar estado atual
  const saveActualPriorityState = async () => {
    setIsLoading(true);
    const request = await updateRCRPrioritiesAtDefinitionData(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      positions
    );

    if (request === true) {
      setAlertData({
        title: "Success",
        message: "Actual rcr position states saved successfully!",
        severity: "success",
      });
      setIsLoading(false);
      setHasAlert(true);
    } else {
      setAlertData({
        title: "Error",
        message:
          "An error occurred while saving RCR position states! Try again later!",
        severity: "error",
      });
      setIsLoading(false);
      setHasAlert(true);
    }
  };

  // ! Funções para mudança na RCR
  const updatedRCR = async () => {
    const rcrUpdt = editRCR;

    setIsLoading(true);
    if (!rcrUpdt.id) {
      setIsLoading(false);
      setEditRCROpen(false);
      setAlertData({
        title: "ID",
        message: "RCR id not identified",
        severity: "error",
      });
      setHasAlert(true);
      return;
    }

    rcrUpdt.name = editRCRTitle;
    rcrUpdt.details = editRCRDetails;
    rcrUpdt.relatedToIssues = editRCRRelatedIssues;

    const res = await updateRCRAtDefinitionData(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      rcrUpdt
    );
    setIsLoading(false);

    if (res.error) {
      setAlertData({
        title: res.error.code + " | ERROR",
        message: res.status + " | " + res.error.message,
        severity: "error",
      });
      setHasAlert(true);
      setEditRCROpen(false);
      return;
    } else {
      setAlertData({
        title: "RCR",
        message: "RCR updated.",
        severity: "success",
      });
    }

    if (!res.error) {
      // Change rcr at local
      const newRCRs = rcrs.map((rcrMap) => {
        if (rcrMap.id === rcrUpdt.id) {
          return rcrUpdt;
        }
        return rcrMap;
      });

      setDefinitionRCRs([...newRCRs]);
    }

    setEditRCROpen(false);
    setIsLoading(false);
    setHasAlert(true);
  };

  const deleteRCR = async () => {
    const rcrDelete = rcrToUpdateOrChange;
    setIsLoading(true);
    if (!rcrDelete.id) {
      setIsLoading(true);
      setAlertData({
        title: "ID",
        message: "RCR id not identified",
        severity: "error",
      });
      setHasAlert(true);
      closeDeleteRCR();
      return;
    }

    const res = await deleteRCRAtDefinitionData(
      loggedUser.userId,
      loggedUser.userToken,
      environmentId,
      rcrDelete
    );

    setIsLoading(false);
    closeDeleteRCR();
    if (res.error) {
      setAlertData({
        title: res.error.code + " | ERROR",
        message: res.status + " | " + res.error.message,
        severity: "error",
      });
    } else {
      setAlertData({
        title: "RCR",
        message: "RCR removed.",
        severity: "success",
      });

      const newRCRs = rcrs.filter((rcr) => rcr.id !== rcrDelete.id);
      setDefinitionRCRs(newRCRs);
    }
    setHasAlert(true);
  };

  return (
    <>
      <Dialog
        fullScreen={true}
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
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-around",
            }}
          >
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <ArrowCircleLeftIcon
                className="BackButton"
                onClick={close}
                style={{ marginRight: "0.5em" }}
              />
              All RCRs identified at this environment
            </Box>
            <SuccessButton
              icon={<FeedIssueDraftIcon size={18} />}
              message={"Save RCRs Position"}
              width={"220px"}
              height={"30px"}
              uppercase={false}
              marginLeft="0"
              marginRight="4em"
              backgroundColor={"#f0dfc7"}
              action={() => {
                saveActualPriorityState();
              }}
              visibility={rcrs.length !== 0 ? "visible" : "hidden"}
            />
          </Box>
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
                <Box
                  key={`BOX-RCR_ACCORD${rcr.id}`}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "0.2em",
                  }}
                >
                  <IconButton
                    className={
                      checkRCRPosition(rcr.id) == 1
                        ? "arrowDisabled"
                        : "arrowUpSelect"
                    }
                    onClick={() => {
                      changeRCRPosition(rcr.id, "up");
                    }}
                    style={{
                      //color: "rgba(0, 0, 0, 0.87)",
                      minWidth: "2%",
                      maxWidth: "2%",
                    }}
                  >
                    <ArrowUpIcon size={15} />
                  </IconButton>
                  <IconButton
                    className={
                      checkRCRPosition(rcr.id) == rcrs.length
                        ? "arrowDisabled"
                        : "arrowUpSelect"
                    }
                    onClick={() => {
                      changeRCRPosition(rcr.id, "down");
                    }}
                    style={{
                      //color: "rgba(0, 0, 0, 0.87)",
                      transform: "rotate(180deg)",
                    }}
                  >
                    <ArrowUpIcon
                      size={15}
                      style={{
                        minWidth: "2%",
                        maxWidth: "2%",
                      }}
                    />
                  </IconButton>

                  <Accordion
                    key={`ACC-${rcr.id}`}
                    style={{ minWidth: "90%", maxWidth: "90%", width: "90%" }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
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
                            openMainIssueOnModal(rcr.mainIssue, rcr.topicNum);
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
                  <IconButton
                    onClick={() => {
                      openEditRCR(rcr);
                    }}
                    style={{
                      marginRight: "0.5em",
                    }}
                    disabled={rcr.exclude_to_priority === true ? true : false}
                  >
                    <EditIcon size={15}></EditIcon>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      openDeleteRCR(rcr);
                    }}
                    style={{
                      marginRight: "0.5em",
                    }}
                    disabled={rcr.exclude_to_priority === true ? true : false}
                  >
                    <DeleteIcon size={15}></DeleteIcon>
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <SuccessButton
            icon={<PeopleIcon size={18} />}
            message={"Start RCR Definition Voting"}
            width={"220px"}
            height={"30px"}
            uppercase={false}
            marginLeft="0"
            marginRight="4em"
            backgroundColor={"#9fff64"}
            action={() => {
              openVotingModal();
              //openDefinitionRCRVoteModal();
            }}
            visibility={rcrs.length !== 0 ? "visible" : "hidden"}
          />

          <Button
            onClick={generateCSVPapaparse}
            variant="contained"
            color="primary"
          >
            Export to CSV
          </Button>
        </DialogActions>
      </Dialog>
      <IssueModalDetail
        open={issueModalOpen}
        close={closeIssueModal}
        closeMessage={"Back"}
        issue={issueModal}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={hasAlert}
        autoHideDuration={2500}
        onClose={closeSearchErrorDialog}
      >
        <Alert
          onClose={closeSearchErrorDialog}
          severity={alertData.severity}
          sx={{ width: "100%" }}
        >
          <AlertTitle>{alertData.title}</AlertTitle>
          {alertData.message}
        </Alert>
      </Snackbar>
      <DeleteRCRConfirm
        open={openDeleteDialog}
        close={closeDeleteRCR}
        btnSubmit={deleteRCR}
      />

      <UpdateRCRAfterTopicPopUp
        open={editRCROpen}
        close={closeEditRCR}
        rcr={editRCR}
        openMainIssue={openMainIssueOnModal}
        openRelatedIssue={openRelatedIssueOnModal}
        action={updatedRCR}
        issuesRcr={editRCRRelatedIssues}
        setIssuesRcr={setEditRCRRelatedIssues}
        title={editRCRTitle}
        setTitle={setEditRCRTitle}
        details={editRCRDetails}
        setDetails={setEditRCRDetails}
      />
    </>
  );
}
