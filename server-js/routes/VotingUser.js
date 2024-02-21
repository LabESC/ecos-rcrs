const express = require("express");
const router = express.Router();

const VotingUserController = require("../controller/VotingUser");

router.get("/:email", VotingUserController.getByEmail);
router.post("/:email", VotingUserController.create);
router.post(
  "/:email/generateAccessCode",
  VotingUserController.generateAccessCode
);
router.get(
  "/:email/validateAccessCode/:accessCode",
  VotingUserController.validateAccessCode
);
router.post(
  "/:id/votedefinition/:environmentId",
  VotingUserController.registerDefinitionVotes
);
router.post(
  "/:id/votepriority/:environmentId",
  VotingUserController.registerDefinitionVotes
);

module.exports = router;
