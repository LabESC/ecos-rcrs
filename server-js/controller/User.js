const UserService = require("../service/User");
const AuthValidator = require("../validations/Auth");
const ErrorSchema = require("../utils/Error");
const UserSchemas = require("../schemas/User");

const msg_404 = {
  "en-US": "User not found!",
  "pt-BR": "Usuário não encontrado!",
};
const msg_500 = {
  "en-US": "Internal server error!",
  "pt-BR": "Erro interno do servidor!",
};
const msg_exists = {
  "en-US": "User already exists!",
  "pt-BR": "Usuário já existe!",
};

module.exports = {
  /**
   * Retrieves all users.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Array<Object>|{code, error}} - The response containing the list of users or an error message.
   */
  async getAll(req, res) {
    // * Getting headers
    const header = req.headers;

    // * Checking if the service is authorized
    const auth = AuthValidator.validateService(header);
    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Getting all users
    const users = await UserService.getAll();

    // * Checking return
    let error, value;
    switch (users) {
      case -1: // . Internal server error
        return res.status(500).json(ErrorSchema(500, msg_500));
      case null: // . No user found
        return res.status(404).json(ErrorSchema(404, msg_404));
      default: // . Returning users
        return res.status(200).json(users);
    }
  },

  /**
   * Retrieves a user by their ID.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The user object or an error response.
   */
  async getById(req, res) {
    // * Getting headers
    const header = req.headers;

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(header);
    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Checking if id was provided
    if (!req.params.id) {
      return res.status(400).json(ErrorSchema(400, "Id not provided!"));
    }

    // * Checking if id is the same of the authenticated user
    if (req.params.id !== header["user-id"]) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Getting user by id
    const user = await UserService.getById(req.params.id);

    // * Checking return
    switch (user) {
      case -1: // . Internal server error
        return res.status(500).json(ErrorSchema(500, msg_500));
      case null: // . No user found
        return res.status(404).json(ErrorSchema(404, msg_404));
      default: // . Returning user
        return res.status(200).json(user);
    }
  },

  /**
   * Creates a new user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The user object or an error response.
   */
  async create(req, res) {
    // * Validating body schema
    const { error, value } = UserSchemas.UserRequest.validate(req.body);

    if (error) {
      return res
        .status(422)
        .json(ErrorSchema("user", error.details[0].message));
    }

    // * Creating user
    const user = await UserService.create(req.body);

    // * Checking return
    switch (user) {
      case -1: // . Internal server error
        return res.status(500).json(ErrorSchema(500, msg_500));
      case -2: // . Invalid e-mail
        return res.status(400).json(ErrorSchema(400, "Invalid e-mail!"));
      case -3: // . User already exists
        return res.status(400).json(ErrorSchema(400, msg_exists));
      default: // . Returning user
        return res.status(201).json(user);
    }
  },

  /**
   * Activate a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The response object with the activated user or an error message.
   */
  async activate(req, res) {
    const { id } = req.params;
    const user = await UserService.activate(id);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case null:
        return res.status(400).json(ErrorSchema("user", "User already active"));
      case false:
        return res.status(404).json(ErrorSchema("user", "User not found"));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Authenticates a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The response object with the id and token of the user or an error message.
   */
  async authenticate(req, res) {
    // * Validating body schema
    const { error, value } = UserSchemas.AuthRequest.validate(req.body);

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Authenticating user
    const { email, password } = req.body;

    const user = await UserService.authenticate(email, password);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case 1:
        return res.status(401).json(ErrorSchema("user", "User is inactive!"));
      case 2:
        return res.status(401).json(ErrorSchema("user", "User is pending!"));
      case null:
        return res.status(401).json(ErrorSchema("password", "Wrong password!"));
      case false:
        return res.status(404).json(ErrorSchema("user", "User not found!"));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Inactivates a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {true|{code, error}} The response object with an error message or true if the user was inactivated.
   */
  async inactivate(req, res) {
    // * Checking if id was provided
    const { id } = req.params;

    if (!id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Checking authentication
    const header = req.headers;
    const auth = await AuthValidator.validateUser(header);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Inactivating user
    const user = await UserService.inactivate(id);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case false:
        return res.status(404).json(ErrorSchema("user", "User not found"));
      case null:
        return res
          .status(400)
          .json(
            ErrorSchema("user", "User already inactive or pending activation!")
          );
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Updates a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The updated user or an error response.
   */
  async update(req, res) {
    // * Checking if id was provided
    const { id } = req.params;

    if (!id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Validating body schema
    const { error, value } = UserSchemas.UserUpdate.validate(req.body);

    if (error) {
      return res.status(400).json(ErrorSchema(400, error.details[0].message));
    }

    // * Updating user
    const user = await UserService.update(req.body, id);

    // * Checking return
    switch (user) {
      case -1: // . Internal server error
        return res.status(500).json(ErrorSchema(500, msg_500));
      case -2: // . Invalid e-mail
        return res.status(422).json(ErrorSchema("user", "Invalid e-mail!"));
      case -3: // . User already exists
        return res.status(400).json(ErrorSchema("user", msg_exists));
      case null: // . No user found
        return res.status(404).json(ErrorSchema(404, msg_404));
      default: // . Returning user
        return res.status(200).json(user);
    }
  },

  /**
   * Handles the forgot password functionality.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} - The response object containing the result of the operation or an error object.
   */
  async forgotPassword(req, res) {
    // * Check if e-mail was provided
    const { email } = req.params;

    if (!email) {
      return res.status(422).json(ErrorSchema(422, "Email not provided!"));
    }

    // * Generating token
    const user = await UserService.getTokenForPassword(email);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case null:
        return res.status(404).json(ErrorSchema("user", "User not found"));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Validates the password token for a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The response object with the appropriate status and data.
   */
  async validatePasswordToken(req, res) {
    // * Check if e-mail and token were provided
    const { email, token } = req.params;

    if (!email || !token) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Email or token not provided!"));
    }

    // * Validating token
    const user = await UserService.validateTokenByEmail(email, token);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case false:
        return res.status(401).json(ErrorSchema("token", "Token invalid"));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Updates the password of a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The response object with the appropriate status and data.
   */
  async updatePassword(req, res) {
    // * Check if e-mail was provided
    const { email } = req.params;

    if (!email) {
      return res.status(422).json(ErrorSchema(422, "Email not provided!"));
    }

    // * Validating body schema
    const { error, value } = UserSchemas.PasswordRequest.validate(req.body);

    if (error) {
      return res.status(400).json(ErrorSchema(400, error.details[0].message));
    }

    // * Updating password
    const { password, token } = req.body;
    const user = await UserService.updatePassword(email, password, token);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case false:
        return res.status(401).json(ErrorSchema("token", "Token invalid"));
      case null:
        return res.status(404).json(ErrorSchema("user", "User not found"));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Retrieves the GitHub user and installation ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} - The response object with the appropriate status and data.
   */

  async getGitHubInstallations(req, res) {
    // * Check if id was provided
    const { id } = req.params;

    if (!id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting GitHub user and installation ID
    const user = await UserService.getGitHubInstallations(id);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Retrieves Installation ID by UserId and GitHubUserOrOrganization.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} - The response object with the appropriate status and data.
   */

  async getInstallationIdByUserIdAndGitHubUserOrOrganization(req, res) {
    // * Checking authentication
    const header = req.headers;
    const auth = await AuthValidator.validateService(header);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Check if id was provided
    const { id, githubUserOrOrg } = req.params;

    if (!id || !githubUserOrOrg) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Id or GitHub User/Organization not provided!"));
    }

    // * Getting GitHub user and installation ID
    const user =
      await UserService.getInstallationIdByUserIdAndGitHubUserOrOrganization(
        id,
        githubUserOrOrg
      );

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Updates the GitHub installation by GitHub user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The response object with the appropriate status and data.
   */
  async setGitHubInstallationByGitHubUser(req, res) {
    // * Control access variable
    let grantAccess = false;

    // * Checking if the user is authorized
    if ((await AuthValidator.validateUser(req.headers)) === true) {
      grantAccess = true;
    }

    // * Checking if the service is authorized
    if ((await AuthValidator.validateService(req.headers)) === true) {
      grantAccess = true;
    }

    // * if none of them granted access, refuse
    if (grantAccess === false) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating body schema
    const { error, value } = UserSchemas.GitHubRequestCreate.validate(req.body);

    if (error) {
      return res.status(400).json(ErrorSchema(400, error.details[0].message));
    }

    // * Updating GitHub installation by GitHub user
    const { github_user, github_user_or_organization, installation_id } =
      req.body;

    const user = await UserService.setGitHubInstallationByGitHubUser(
      github_user,
      github_user_or_organization,
      installation_id
    );

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case false:
        return res.status(404).json(ErrorSchema("user", "User not found"));
      default:
        return res.status(200).json(user);
    }
  },

  /**
   * Cleans GitHub Installation by GitHub User.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object|{code, error}} The response object with the appropriate status and data.
   */
  async cleanGitHubInstallationByGitHubUser(req, res) {
    // * Validating service auth
    const header = req.headers;
    const auth = await AuthValidator.validateService(header);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating body schema
    const { error, value } = UserSchemas.GitHubRequestDelete.validate(req.body);

    if (error) {
      return res.status(400).json(ErrorSchema(400, error.details[0].message));
    }

    // * Getting variables
    const { github_user_or_organization, installation_id } = req.body;

    // * Cleaning GitHub installation by GitHub user
    const user = await UserService.cleanGitHubInstallationByGitHubUser(
      github_user_or_organization,
      installation_id
    );

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case false:
        return res.status(404).json(ErrorSchema("user", "User not found"));
      default:
        return res.status(200).json(user);
    }
  },
};
