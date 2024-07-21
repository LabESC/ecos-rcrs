const Joi = require("joi");

const VotingUserBase = Joi.object({
  email: Joi.string().email().required(),
});

const VotingUserRequest = VotingUserBase;

const VotingUserResponse = Joi.object({
  id: Joi.string()
    .guid({
      version: "uuidv4",
    })
    .required(),
  email: Joi.string().email().required(),
});

const ManyVotingUserResponse = Joi.array().items(VotingUserResponse);

const VotingUserVote = Joi.object({
  votes: Joi.array().items(Joi.object()).required(),
  accessCode: Joi.string().required(),
});

const VotingUserAllVote = Joi.object({
  definition_vote: Joi.array().items(Joi.object()).required(),
  priority_vote: Joi.array().items(Joi.object()).required(),
  accessCode: Joi.string().required(),
});

module.exports = {
  VotingUserBase,
  VotingUserRequest,
  VotingUserResponse,
  ManyVotingUserResponse,
  VotingUserVote,
  VotingUserAllVote,
};
