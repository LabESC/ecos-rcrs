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
  UserController.updateGitHubInstallationByGitHubUser
);
router.delete(
  "/github/installation/:github_user",
  UserController.cleanGitHubInstallationByGitHubUser
);
//router.get("/github/user/auth-callback", UserController.githubAuthCallback);

module.exports = router;
