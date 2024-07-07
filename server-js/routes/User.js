const express = require("express");
const router = express.Router();

const UserController = require("../controller/User");

router.get("/", UserController.getAll);
router.post("/", UserController.create);
router.get("/:id", UserController.getById);
router.delete("/:id", UserController.inactivate);
router.put("/:id", UserController.update);
router.post("/:id/activate", UserController.activate);
router.post("/login", UserController.authenticate);
router.post("/:email/forgot-password/token", UserController.forgotPassword);
router.get(
  "/:email/validate-password-token/:token",
  UserController.validatePasswordToken
);
router.put("/:email/update-password", UserController.updatePassword);

// ! GitHub - 29/06/24
router.post(
  "/github/installation",
  UserController.setGitHubInstallationByGitHubUser
);
router.delete(
  "/github/installation",
  UserController.cleanGitHubInstallationByGitHubUser
);
router.get("/:id/github/installations", UserController.getGitHubInstallations);
router.get(
  "/:id/github/:githubUserOrOrg",
  UserController.getInstallationIdByUserIdAndGitHubUserOrOrganization
);

module.exports = router;
