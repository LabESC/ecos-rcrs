const EnvironmentService = require("../service/Environment");
const AuthValidator = require("../validations/Auth");
const APIRequests = require("../service/APIRequests");
const ErrorSchema = require("../utils/Error");
const Logger = require("../utils/Logger");
const EnvironmentSchemas = require("../schemas/Environment");

const entity_name = "environment";
const msg_404 = {
  "en-US": `${entity_name} not found!`,
  "pt-BR": "Ambiente não encontrado!",
};
const msg_500 = {
  "en-US": "Internal server error!",
  "pt-BR": "Erro interno do servidor!",
};
const msg_email_not_sent = {
  "en-US": "E-mail not sent!",
  "pt-BR": "E-mail não enviado!",
};
const msg_wrong_mining_type = {
  "en-US":
    "Invalid entry: if mining_type is organization, the name of the organization needs to be informed!",
  "pt-BR":
    "Entrada inválida: Se o tipo da mineração é organização, o nome desta deve ser informado!",
};
const msg_user_not_found = {
  "en-US": "User not found!",
  "pt-BR": "Usuário não encontrado!",
};
const msg_user_not_active = {
  "en-US": "User not active!",
  "pt-BR": "Usuário não está ativo!",
};

module.exports = {
  async getAll(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Getting headers
    const header = req.headers;

    // * Checking if the service is authorized
    const auth = AuthValidator.validateService(header);
    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }
    // * Getting all environments
    const environments = await EnvironmentService.getAll();

    switch (environments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(environments);
    }
  },

  async getById(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Getting headers
    const header = req.headers;

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(header);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Checking if id was provided
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting the environment
    const environment = await EnvironmentService.getById(req.params.id);

    switch (environment) {
      case -1:
        return res.status(500).send(ErrorSchema(msg_500));
      case null:
        return res.status(404).send(ErrorSchema(msg_404));
      default:
        return res.status(200).send(environment);
    }
  },

  async getByUserId(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Checking if id was provided
    if (!req.params.userId) {
      return res
        .status(422)
        .json(ErrorSchema("userId", "User id not provided!"));
    }

    // * Getting the environments
    const environments = await EnvironmentService.getByUserId(
      req.params.userId
    );

    switch (environments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(environments);
    }
  },

  async create(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating body
    const { error } = EnvironmentSchemas.EnvironmentRequest.validate(req.body);

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Creating the environment
    const newEnvironment = await EnvironmentService.create(req.body);

    switch (newEnvironment) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case -2:
        return res.status(404).send(ErrorSchema("user", msg_user_not_found));

      case -3:
        return res.status(404).send(ErrorSchema("user", msg_user_not_active));

      case -4:
        return res
          .status(422)
          .send(ErrorSchema(entity_name, msg_wrong_mining_type));
    }

    // * Sending mining request for the new environment
    const miningRequest = await APIRequests.requestMining(
      newEnvironment.id,
      newEnvironment.repos
    );

    if (!miningRequest) {
      await EnvironmentService.updateStatus(newEnvironment.id, "mining_error");
      newEnvironment.status = "mining_error";
    }

    return res.status(200).send(newEnvironment);
  },

  async updateStatus(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

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

    // * Checking if id and status were provided
    if (!req.params.id || !req.params.status) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Id and/or status not provided!"));
    }

    // * Updating the environment status
    const updatedEnvironments = await EnvironmentService.updateStatus(
      req.params.id,
      req.params.status
    );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      // !! Validar se é nulo ou 0
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
    }

    if (
      Array.isArray(updatedEnvironments) &&
      updatedEnvironments.length > 0 &&
      updatedEnvironments[0] > 0
    ) {
      return res.status(200).send();
    } else {
      return res.status(500).send(ErrorSchema("server", msg_500));
    }
  },

  async updateMiningData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the service is authorized
    const auth = AuthValidator.validateService(req.headers);
    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Checking if id was provided
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Validating body
    const { error } =
      EnvironmentSchemas.EnvironmentUpdateMiningDataRequest.validate(req.body);

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Updating mining data
    const updatedEnvironments = await EnvironmentService.updateMiningData(
      req.params.id,
      req.body
    );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      case true:
        return res.status(200).send(true);
      default:
        return res.status(500).send(ErrorSchema("server", msg_500));
    }
  },

  async updateTopicData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the service is authorized
    const auth = AuthValidator.validateService(req.headers);
    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Checking if id was provided
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Validating body
    const { error } =
      EnvironmentSchemas.EnvironmentUpdateTopicDataRequest.validate(req.body);

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Updating topic data
    const updatedEnvironments = await EnvironmentService.updateTopicData(
      req.params.id,
      req.body
    );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      case true:
        return res.status(200).send(true);
      default:
        return res.status(500).send(ErrorSchema("server", msg_500));
    }
  },

  async updateDefinitionData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating body
    const { error } =
      EnvironmentSchemas.EnvironmentUpdateDefinitionDataRequest.validate(
        req.body
      );

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Updating definition data
    const updatedEnvironments = await EnvironmentService.updateDefinitionData(
      req.params.id,
      req.body
    );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      case true:
        return res.status(200).send(true);
      default:
        return res.status(500).send(ErrorSchema("server", msg_500));
    }
  },

  async updateDefinitionDataWithStatus(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating body
    const { error } =
      EnvironmentSchemas.EnvironmentUpdateDefinitionOrPriorityDateWithStatusRequest.validate(
        req.body
      );

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Updating definition data
    const updatedEnvironments =
      await EnvironmentService.updateDefinitionDataWithStatus(
        req.params.id,
        req.body.closing_date,
        req.body.rcrs_selected
      );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      case true:
        return res.status(200).send(true);
    }
  },

  async getDefinitionRCRByEnvironmentIdAndIssueId(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating id
    if (!req.params.id || !req.params.issueId) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Id and/or issueId not provided!"));
    }

    // * Getting RCR
    const rcr =
      await EnvironmentService.getDefinitionRCRByEnvironmentIdAndIssueId(
        req.params.id,
        req.params.issueId
      );

    switch (rcr) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(rcr);
    }
  },

  async updatePriorityData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating body
    const { error } =
      EnvironmentSchemas.EnvironmentUpdatePriorityDataRequest.validate(
        req.body
      );

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Updating priority data
    const updatedEnvironments = await EnvironmentService.updatePriorityData(
      req.params.id,
      req.body
    );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
    }

    if (
      Array.isArray(updatedEnvironments) &&
      updatedEnvironments.length > 0 &&
      updatedEnvironments[0] > 0
    ) {
      return res.status(200).send();
    } else {
      return res.status(500).send(ErrorSchema("server", msg_500));
    }
  },

  async updatePriorityDataWithStatus(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating body
    const { error } =
      EnvironmentSchemas.EnvironmentUpdateDefinitionOrPriorityDateWithStatusRequest.validate(
        req.body
      );

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Updating priority data
    const updatedEnvironments =
      await EnvironmentService.updatePriorityDataWithStatus(
        req.params.id,
        req.body.closing_date,
        req.body.status
      );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
    }

    if (
      Array.isArray(updatedEnvironments) &&
      updatedEnvironments.length > 0 &&
      updatedEnvironments[0] > 0
    ) {
      return res.status(200).send();
    } else {
      return res.status(500).send(ErrorSchema("server", msg_500));
    }
  },

  async getPriorityRCRByEnvironmentIdAndIssueId(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating id
    if (!req.params.id || !req.params.issueId) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Id and/or issueId not provided!"));
    }

    /* // * TODO 
    // * Getting RCR 
    const rcr =
      await EnvironmentService.getDefinitionRCRByEnvironmentIdAndIssueId(
        req.params.id,
        req.params.issueId
      );

    switch (rcr) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(rcr);
    }*/
  },

  async updateFinalData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = AuthValidator.validateService(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    /* // * TODO 
    // * Validating body
    const { error } =
      EnvironmentSchemas.EnvironmentUpdateFinalDataRequest.validate(req.body);

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    // * Updating final data
    const updatedEnvironments = await EnvironmentService.updateFinalData(
      req.params.id,
      req.body
    );

    switch (updatedEnvironments) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send();
    }*/
  },

  async getMiningData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

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

    // * Validating id
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting mining data
    const miningData = await EnvironmentService.getMiningData(req.params.id);

    switch (miningData) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(miningData);
    }
  },

  async getTopicData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

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

    // * Validating id
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting topic data
    const topicData = await EnvironmentService.getTopicData(req.params.id);

    switch (topicData) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(topicData);
    }
  },

  async getDefinitionData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

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

    // * Validating id
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting definition data
    const definitionData = await EnvironmentService.getDefinitionData(
      req.params.id
    );

    switch (definitionData) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(definitionData);
    }
  },

  async getPriorityData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

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

    // * Validating id
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting priority data
    const priorityData = await EnvironmentService.getPriorityData(
      req.params.id
    );

    switch (priorityData) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(priorityData);
    }
  },

  async getFinalData(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

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

    // * Validating id
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting final data
    const finalData = await EnvironmentService.getFinalData(req.params.id);

    switch (finalData) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(finalData);
    }
  },

  async getVotingUsersByEnvironmentId(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Checking if the user is authorized
    const auth = await AuthValidator.validateUser(req.headers);

    if (!auth) {
      return res.status(401).json(ErrorSchema("Auth", "Unauthorized!"));
    }

    // * Validating id
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting voting users
    const votingUsers = await EnvironmentService.getVotingUsersByEnvironmentId(
      req.params.id
    );

    switch (votingUsers) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(votingUsers);
    }
  },

  async getDefinitionDataForVoting(req, res) {
    // . LOGGER
    Logger(req.method, req.url);

    // * Validating id
    if (!req.params.id) {
      return res.status(422).json(ErrorSchema(422, "Id not provided!"));
    }

    // * Getting definition data for voting
    const definitionData = await EnvironmentService.getDefinitionDataForVoting(
      req.params.id
    );

    switch (definitionData) {
      case -1:
        return res.status(500).send(ErrorSchema("server", msg_500));
      case -2:
        return res
          .status(400)
          .send(
            ErrorSchema(
              "status",
              "Environment is not opened to definition voting!"
            )
          );
      case null:
        return res.status(404).send(ErrorSchema(entity_name, msg_404));
      default:
        return res.status(200).send(definitionData);
    }
  },
};
