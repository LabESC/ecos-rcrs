const VotingUserService = require("../service/VotingUser");
const AuthValidator = require("../validations/Auth");
const ErrorSchema = require("../utils/Error");
const VotingUserSchemas = require("../schemas/VotingUser");

const entity_name = "votinguser";
const msg_404 = {
  "en-US": "Voting user not found!",
  "pt-BR": "Usuário votante não encontrado!",
};
const msg_500 = {
  "en-US": "Internal server error!",
  "pt-BR": "Erro interno do servidor!",
};
const msg_email_not_sent = {
  "en-US": "E-mail not sent!",
  "pt-BR": "E-mail não enviado!",
};
const msg_email_not_valid = {
  "en-US": "Invalid e-mail!",
  "pt-BR": "E-mail inválido!",
};
const msg_access_code_wrong = {
  "en-US": "Wrong access code!",
  "pt-BR": "Código de acesso incorreto!",
};

module.exports = {
  async getByEmail(req, res) {
    // * Checking if e-mail was provided
    if (!req.params.email) {
      return res.status(422).json(ErrorSchema(422, "E-mail not provided!"));
    }

    const user = await VotingUserService.getByEmail(req.params.email);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case null:
        return res.status(404).json(ErrorSchema(404, msg_404));
      default:
        return res.status(200).json(user);
    }
  },

  async create(req, res) {
    // * Checking if e-mail was provided
    if (!req.params.email) {
      return res.status(422).json(ErrorSchema(422, "E-mail not provided!"));
    }

    const user = await VotingUserService.create(req.params.email);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case -2:
        return res.status(400).json(ErrorSchema(400, msg_email_not_valid));
      default:
        return res.status(201).json(user);
    }
  },

  async generateAccessCode(req, res) {
    // * Checking if e-mail was provided
    if (!req.params.email) {
      return res.status(422).json(ErrorSchema(422, "E-mail not provided!"));
    }

    const user = await VotingUserService.generateAccessCode(req.params.email);

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case -2:
        return res.status(400).json(ErrorSchema(400, msg_email_not_valid));
      case -3:
        return res.status(500).json(ErrorSchema(500, msg_email_not_sent));
      case true:
        return res.status(200).send(true);
    }
  },

  async validateAccessCode(req, res) {
    // * Checking if e-mail and access code were provided
    if (!req.params.email || !req.params.accessCode) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Id and/or access code not provided!"));
    }

    const user = await VotingUserService.validateAccessCodeByEmail(
      req.params.email,
      req.params.accessCode
    );

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case -2:
        return res.status(404).json(ErrorSchema(404, msg_404));
      case -3:
        return res.status(400).json(ErrorSchema(400, msg_access_code_wrong));
      default:
        return res.status(200).json(true);
    }
  },

  async registerDefinitionVotes(req, res) {
    // * Checking if e-mail and environmentId were provided
    if (!req.params.id || !req.params.environmentId) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Id and/or environment id not provided!"));
    }

    // * Checking if the body is valid
    const { error } = VotingUserSchemas.VotingUserVote.validate(req.body);

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    const user = await VotingUserService.registerDefinitionVotes(
      req.params.id,
      req.params.environmentId,
      req.body.votes,
      req.body.accessCode
    );

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case -2:
        return res.status(404).json(ErrorSchema(404, msg_404));
      case -3:
        return res.status(400).json(ErrorSchema(400, msg_access_code_wrong));
      default:
        return res.status(200).json(true);
    }
  },

  async registerPriorityVotes(req, res) {
    // * Checking if e-mail and environmentId were provided
    if (!req.params.id || !req.params.environmentId) {
      return res
        .status(422)
        .json(ErrorSchema(422, "Id and/or environment id not provided!"));
    }

    // * Checking if the body is valid
    const { error } = VotingUserSchemas.VotingUserVote.validate(req.body);

    if (error) {
      return res.status(422).json(ErrorSchema(422, error.details[0].message));
    }

    const user = await VotingUserService.registerPriorityVotes(
      req.params.id,
      req.params.environmentId,
      req.body.votes,
      req.body.accessCode
    );

    switch (user) {
      case -1:
        return res.status(500).json(ErrorSchema(500, msg_500));
      case -2:
        return res.status(404).json(ErrorSchema(404, msg_404));
      case -3:
        return res.status(400).json(ErrorSchema(400, msg_access_code_wrong));
      default:
        return res.status(200).json(true);
    }
  },
};
