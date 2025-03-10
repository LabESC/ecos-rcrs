const express = require("express");
const router = express.Router();

const EnvironmentController = require("../controller/Environment");

router.get("/", EnvironmentController.getAll);
router.get("/:id", EnvironmentController.getById);
router.get("/user/:userId", EnvironmentController.getByUserId);
router.post("/", EnvironmentController.create);
router.put("/:id/status/:status", EnvironmentController.updateStatus);
router.post("/:id/miningdata", EnvironmentController.updateMiningData);
router.post("/:id/topicdata", EnvironmentController.updateTopicData);
router.post("/:id/definitiondata", EnvironmentController.updateDefinitionData);
router.put(
  "/:id/definitiondata/rcr",
  EnvironmentController.updateRCRAtDefinitionData
);
router.delete(
  "/:id/definitiondata/rcr",
  EnvironmentController.deleteRCRAtDefinitionData
);
router.put(
  "/:id/definitiondata/rcr/priorities",
  EnvironmentController.updateRCRPrioritiesAtDefinitionData
);
router.patch(
  "/:id/definitiondata",
  EnvironmentController.updateDefinitionDataWithStatus
);
router.get(
  "/:id/definitiondata/:issueId",
  EnvironmentController.getDefinitionRCRByEnvironmentIdAndIssueId
);
router.post("/:id/prioritydata", EnvironmentController.updatePriorityData);
router.patch(
  "/:id/prioritydata",
  EnvironmentController.updatePriorityDataWithStatus
);
router.get(
  "/:id/prioritydata/:issueId",
  EnvironmentController.getPriorityRCRByEnvironmentIdAndIssueId
);
router.post("/:id/finaldata", EnvironmentController.updateFinalData);
router.get("/:id/miningdata", EnvironmentController.getMiningData);
router.get("/:id/topicdata", EnvironmentController.getTopicData);
router.get("/:id/topicinfo", EnvironmentController.getTopicsInfo);
router.get(
  "/:id/topicdata/:topicNum/:page",
  EnvironmentController.getTopicDataByTopicAndPage
);
router.get("/:id/hasrcrdefinitiondata", EnvironmentController.hasDefinitionRCR);
router.get("/:id/definitiondata", EnvironmentController.getDefinitionData);
router.get(
  "/:id/definitiondatanew",
  EnvironmentController.getDefinitionDataNew
);
router.get("/:id/prioritydata", EnvironmentController.getPriorityData);
router.get("/:id/finaldata", EnvironmentController.getFinalData);
router.get(
  "/:id/votingusers",
  EnvironmentController.getVotingUsersByEnvironmentId
);
router.get(
  "/:id/votingdefinitiondata",
  EnvironmentController.getDefinitionDataForVoting
);
router.get(
  "/:id/votingprioritydata",
  EnvironmentController.getPriorityDataForVoting
);
router.post("/:id/clone", EnvironmentController.clone);
router.get(
  "/:id/miningdata/:issueId",
  EnvironmentController.getIssueFromMiningData
);
router.put("/:id/endvoting/priority", EnvironmentController.endPriorityVoting);
router.put(
  "/:id/endvoting/definition",
  EnvironmentController.endDefinitionVoting
);
router.post(
  "/:id/endrcr/definition",
  EnvironmentController.endDefinitionRCRAndGoToPriorityRCR
);
router.post(
  "/:id/end",
  EnvironmentController.updateFinalDataAndCloseEnvironment
);
router.put(
  "/:id/countvotes/:status",
  EnvironmentController.countVotesForEnvironment
);

router.get(
  "/:id/finaldata/report",
  EnvironmentController.getFinalDataForReport
);

module.exports = router;
