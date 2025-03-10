const Joi = require("joi");

const EnvironmentStatus = Joi.string().valid(
  "mining",
  "mining_error",
  "mining_done",
  "making_topics",
  "topics_error",
  "topics_done",
  "waiting_rcr_voting",
  "rcr_voting_done",
  "waiting_rcr_priority",
  "rcr_priority_done",
  "done",
  "cancelled"
);

const EnvironmentBase = Joi.object({
  environment: Joi.object({
    user_id: Joi.string()
      .guid({
        version: "uuidv4",
      })
      .required(),
    name: Joi.string().required(),
    details: Joi.string().required(),
    mining_type: Joi.string().required(),
    filter_type: Joi.string().required(),
    repos: Joi.array().items(Joi.string()).required(),
    organization_name: Joi.string().allow("").required(),
    mining_data: Joi.object().allow(null).required(),
    topic_data: Joi.object().allow(null).required(),
    definition_data: Joi.object().allow(null).required(),
    priority_data: Joi.object().allow(null).required(),
    final_rcr: Joi.object().allow(null).required(),
    keywords: Joi.array().items(Joi.string()).allow(null),
    rcr_keywords: Joi.array().items(Joi.string()).allow(null),
    mining_filter_date_since: Joi.date().iso().allow(null),
    mining_filter_date_until: Joi.date().iso().allow(null),
    mining_issues_status: Joi.string().required(),
  }),
  userFeedbackChannels: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        details: Joi.string().allow(""),
        url: Joi.string().allow(""),
      })
    )
    .allow(null),
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
  error: Joi.string().required(),
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

const EnvironmentUpdateRCRAtDefinitionDataRequest = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  details: Joi.string().required(),
  relatedToIssues: Joi.array().items(Joi.number()).required(),
  topicNum: Joi.number().required(),
  mainIssue: Joi.number().required(),
});

const EnvironmentUpdateRCRPrioritiesAtDefinitionDataRequest = Joi.array().items(
  Joi.object({
    id: Joi.number().required(),
    priority: Joi.number().required(),
  })
);

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
  rcrs_selected: Joi.array().items(Joi.number()).required(),
});

const EnvironmentUpdatePriorityDateWithStatusRequest = Joi.object({
  closing_date: Joi.date().required(),
  priority_data_rcrs: Joi.array().items(Joi.object()).required(),
});

const EnvironmentUpdateFinalDataRequest = Joi.object({
  final_rcr: Joi.array().items(Joi.object()).required(),
});

const EnvironmentUpdateFinalDataWithStatusRequest = Joi.object({
  final_rcr: Joi.array().items(Joi.object()).required(),
  status: Joi.string().required(),
});

const EnvironmentVotingUsers = Joi.object({
  voting_users: Joi.array().items(Joi.string()).required(),
});

const EnvironmentDefinitionRCREndToPriority = Joi.object({
  rcrs_selected: Joi.array().items(Joi.number()).required(),
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
  EnvironmentUpdateRCRAtDefinitionDataRequest,
  EnvironmentUpdateRCRPrioritiesAtDefinitionDataRequest,
  EnvironmentUpdateDefinitionOrPriorityDateWithStatusRequest,
  EnvironmentUpdateFinalDataRequest,
  EnvironmentVotingUsers,
  EnvironmentUpdatePriorityDateWithStatusRequest,
  EnvironmentStatus,
  EnvironmentUpdateFinalDataWithStatusRequest,
  EnvironmentDefinitionRCREndToPriority,
};
