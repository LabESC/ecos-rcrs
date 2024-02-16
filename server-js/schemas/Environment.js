const Joi = require("joi");

const EnvironmentBase = Joi.object({
  user_id: Joi.string()
    .guid({
      version: "uuidv4",
    })
    .required(),
  name: Joi.string().required(),
  details: Joi.string().required(),
  mining_type: Joi.string().required(),
  repos: Joi.array().items(Joi.string()).required(),
  organization_name: Joi.string().allow(null).required(),
  mining_data: Joi.object().allow(null).required(),
  topic_data: Joi.object().allow(null).required(),
  definition_data: Joi.object().allow(null).required(),
  priority_data: Joi.object().allow(null).required(),
  final_rcr: Joi.object().allow(null).required(),
});

const EnvironmentRequest = EnvironmentBase;

const EnvironmentResponse = Joi.object({
  id: Joi.string()
    .guid({
      version: "uuidv4",
    })
    .required(),

  user_id: Joi.string()
    .guid({
      version: "uuidv4",
    })
    .required(),
  name: Joi.string().required(),
  details: Joi.string().required(),
  mining_type: Joi.string().required(),
  repos: Joi.array().items(Joi.string()).required(),
  organization_name: Joi.string().allow(null).required(),
  status: Joi.string().required(),
});

const ManyEnvironmentResponse = Joi.array().items(EnvironmentResponse);

const EnvironmentResponseFiltered = Joi.object({
  id: Joi.string()
    .guid({
      version: "uuidv4",
    })
    .required(),
  name: Joi.string().required(),
  details: Joi.string().required(),
  status: Joi.string().required(),
});

const DataError = Joi.object({
  error: Joi.object().required(),
});

const MiningData = Joi.object({
  issues: Joi.array().items(Joi.object()).required(),
  errors: Joi.object().required(),
});

const EnvironmentUpdateMiningDataRequest = Joi.object({
  mining_data: Joi.object().required(),
  status: Joi.string().required(),
});

const TopicSuccessData = Joi.object({
  comparisons: Joi.array().items(Joi.object()).required(),
});

const EnvironmentUpdateTopicDataRequest = Joi.object({
  topic_data: Joi.alternatives().try(
    Joi.array().items(Joi.object()),
    DataError
  ),
  status: Joi.string().required(),
});

const EnvironmentUpdateDefinitionDataRequest = Joi.object({
  name: Joi.string().required(),
  details: Joi.string().required(),
  relatedToIssues: Joi.array().items(Joi.number()).required(),
  topicNum: Joi.number().required(),
  mainIssue: Joi.number().required(),
});

const EnvironmentUpdatePriorityDataRequest = Joi.object({
  exclude: Joi.array().items(Joi.number().allow(null)).required(),
  order: Joi.array()
    .items(
      Joi.object({
        voting_users_vote: Joi.object(),
        user_order: Joi.array().items(Joi.object()),
      }).allow(null)
    )
    .required(),
});

const EnvironmentUpdateDefinitionOrPriorityDateWithStatusRequest = Joi.object({
  closing_date: Joi.date().required(),
  status: Joi.string().required(),
});

const EnvironmentUpdateFinalDataRequest = Joi.object({
  final_rcr: Joi.object().required().allow(null),
  status: Joi.string().required(),
});

const EnvironmentVotingUsers = Joi.object({
  voting_users: Joi.array().items(Joi.string()).required(),
});

module.exports = {
  EnvironmentBase,
  EnvironmentRequest,
  EnvironmentResponse,
  ManyEnvironmentResponse,
  EnvironmentResponseFiltered,
  DataError,
  MiningData,
  EnvironmentUpdateMiningDataRequest,
  TopicSuccessData,
  EnvironmentUpdateTopicDataRequest,
  EnvironmentUpdatePriorityDataRequest,
  EnvironmentUpdateDefinitionDataRequest,
  EnvironmentUpdateDefinitionOrPriorityDateWithStatusRequest,
  EnvironmentUpdateFinalDataRequest,
  EnvironmentVotingUsers,
};
