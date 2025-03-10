const EnvironmentRepository = require("../repository/Environment");
const UserRepository = require("../repository/User");
const APIRequests = require("./APIRequests");
const EnvironmentUtils = require("../utils/Environment");
const VotingUserRepository = require("../repository/VotingUser");
require("dotenv").config(); // Para obter a variável do endereço do serviço Cliente
class Environment {
  static async getAll() {
    try {
      const users = await EnvironmentRepository.getAll();

      return users.length !== 0 ? users : null;
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getById(id) {
    try {
      return await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getByUserId(userId) {
    let environments = null;
    try {
      environments = await EnvironmentRepository.getByUserId(userId);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (environments === null) return null;

    for (const env of environments) {
      if (
        env.status !== "mining" &&
        env.status !== "mining_error" &&
        env.status !== "mining_done" &&
        env.status !== "making_topics" &&
        env.status !== "topics_error"
      ) {
        const issuesLengthData =
          await EnvironmentRepository.getIssuesLengthFromMiningData(env.id);
        env.issuesLength = issuesLengthData;
      }

      if (env.status === "waiting_rcr_voting") {
        const votingUsers =
          await VotingUserRepository.countDefinitionVotesOfEnvironment(env.id);
        env.voting_users_count = votingUsers;
      }

      if (env.status === "waiting_rcr_priority") {
        const votingUsers =
          await VotingUserRepository.countPriorityVotesOfEnvironment(env.id);
        env.voting_users_count = votingUsers;
      }
    }

    return environments;
  }

  static async create(environment, environment_user_feedback_channels) {
    // * Check if user exists and is active
    const user = await UserRepository.getById(environment.user_id);

    if (!user) {
      return -2;
    }
    if (user.status !== "active") {
      return -3;
    }

    // * Check if the type is organization and the name was provided
    if (
      environment.mining_type === "organization" &&
      !environment.organization_name
    ) {
      return -4;
    }

    // * Create the environment
    let newEnvironment = null;
    try {
      newEnvironment = await EnvironmentRepository.create(environment);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!newEnvironment) {
      return newEnvironment;
    }

    // * Creating the environment_user_feedback_channels
    if (environment_user_feedback_channels) {
      await EnvironmentRepository.createManyEnvironmentUserFeedbackChannel(
        environment_user_feedback_channels,
        newEnvironment.id
      );
    }

    // * Sending e-mail to the user
    const subject = `SECO - RCR: ${environment.name} created`;
    let emailText = `<br/>${user.name}, your environment was created and the mining starts soon!\n`;
    emailText += `<br/><strong>Environment name</strong>: ${environment.name}\n`;
    emailText += `<br/><strong>Mining type</strong>: ${environment.mining_type}\n`;
    emailText += `<br/><strong>Filter type</strong>: ${environment.filter_type}\n`;
    if (environment.mining_type === "organization") {
      emailText += `<br/><strong>Organization name</strong>: ${environment.organization_name}\n`;
    }
    emailText += `<br/><strong>Repositories</strong>: ${environment.repos.join(
      " | "
    )}\n`;
    emailText += `<br/><strong>Details</strong>: ${environment.details}\n`;

    try {
      await APIRequests.sendEmail(user.email, subject, emailText);
    } catch (e) {
      console.log(e);
      /* await EnvironmentRepository.updateStatus(
        newEnvironment.id,
        "mining_error"
      );*/
    }

    return newEnvironment;
  }

  static async updateStatus(id, status) {
    try {
      return await EnvironmentRepository.updateStatus(id, status);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async updateMiningData(id, miningData) {
    try {
      await EnvironmentRepository.updateMining(
        id,
        miningData.mining_data,
        miningData.status
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    let requestTopic = null;
    /*// . Requesting topic generation - erro pq ele tenta solicitar denovo pro microsservico que ta em execucao
    try {
      requestTopic = await APIRequests.requestTopics(id);
    } catch (e) {
      console.log(e);
      requestTopic = false;
    }
*/
    // * Sending e-mail to the user
    const environmentUser =
      await EnvironmentRepository.getCreatedUserEmailByEnvironmentId(id);

    const subject = `SECO - RCR: ${environmentUser.name} mining done`;
    let emailText = "";
    if (!requestTopic) {
      emailText = `<br/>The mining data for your environment ${environmentUser.name} is done!\n`;
      emailText += `<br/>You need to log on the system to request the topic generation.\n`;
    } else {
      emailText = `<br/>The mining data for your environment ${environmentUser.name} is done!\n`;
      emailText += `<br/>The topic generation is being processed, when finished, you'll be notified.\n`;
    }

    try {
      await APIRequests.sendEmail(
        environmentUser.User.email,
        subject,
        emailText
      );
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  static async updateTopicData(id, topicData) {
    try {
      await EnvironmentRepository.updateTopics(
        id,
        topicData.topic_data,
        topicData.status
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Sending e-mail to the user
    const environmentUser =
      await EnvironmentRepository.getCreatedUserEmailByEnvironmentId(id);

    const subject = `SECO - RCR: ${environmentUser.name} topic generation done`;
    let emailText = `<br/>The topics for your environment ${environmentUser.name} were generated!\n`;
    emailText += `<br/>You can log on the system to read them.\n`;

    try {
      await APIRequests.sendEmail(
        environmentUser.User.email,
        subject,
        emailText
      );
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  static async updateDefinitionData(id, newDefinitionData) {
    // * Obtaining definition data if exists

    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (definitionData === false) return false;

    // * If definition data does not exists, create it
    let priorityNum = 1;
    if (!definitionData) {
      definitionData = { rcrs: [], status: "elaborating", closing_date: null };
    }

    // * Updating definition data
    // . Check if there is an id at the rcrs array
    let newId = 1;
    let priorityAdd = 0;
    for (const rcr of definitionData.rcrs) {
      newId = rcr.id + 1;
      priorityAdd += 1;
    }

    priorityNum += priorityAdd;

    newDefinitionData["id"] = newId;
    newDefinitionData["priority"] = priorityNum;
    definitionData.rcrs.push(newDefinitionData);

    // * Updating the environment
    try {
      await EnvironmentRepository.updateDefinition(id, definitionData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updateRCRAtDefinitionData(id, definitionDataChanged) {
    // * Obtaining definition data if exists
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (definitionData === false) return false;
    // * Find the rcr to be updated, and change it
    for (let i = 0; i < definitionData.rcrs.length; i++) {
      if (definitionData.rcrs[i].id === definitionDataChanged.id) {
        definitionData.rcrs[i] = definitionDataChanged;
        break;
      }
    }

    // * Updating the environment
    try {
      await EnvironmentRepository.updateDefinition(id, definitionData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async deleteRCRAtDefinitionData(id, definitionDataChanged) {
    // * Obtaining definition data if exists
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (definitionData === false) return false;
    // * Delete the rcr from the definition data
    definitionData.rcrs = definitionData.rcrs.filter((rcr) => {
      return rcr.id !== definitionDataChanged.id;
    });

    // * Updating the environment
    try {
      await EnvironmentRepository.updateDefinition(id, definitionData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updateRCRPrioritiesAtDefinitionData(id, rcrsRepriorized) {
    // * Obtaining definition data if exists
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (definitionData === false) return false;
    // * Find all the rcr to be re-prioritized, and change it
    for (let rcr of definitionData.rcrs) {
      for (let rcrRepriorized of rcrsRepriorized) {
        if (rcr.id === rcrRepriorized.id) {
          rcr.priority = rcrRepriorized.priority;
        }
      }
    }

    // . Ordering the rcrs by priority
    definitionData.rcrs.sort((a, b) => a.priority - b.priority);

    // * Updating the environment
    try {
      await EnvironmentRepository.updateDefinition(id, definitionData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updateDefinitionDataWithStatus(id, closingDate, rcrsSelected) {
    // * Obtaining definition data if exists
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If does not exists, return it
    if (!definitionData) return definitionData;

    // * Otherwise, update its closingDate and its status
    definitionData.closing_date = closingDate;
    definitionData.status = "voting";

    // * Update each rcr who is included in rcrsSelected to have an attribute "going_to_vote" = "true"
    for (const rcr of definitionData.rcrs) {
      if (rcrsSelected.includes(rcr.id)) {
        rcr.going_to_vote = true;
      } else {
        rcr.going_to_vote = false;
      }
    }

    // * Updating the environment
    try {
      await EnvironmentRepository.updateDefinition(
        id,
        definitionData,
        "waiting_rcr_voting"
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updatePriorityData(id, rcrsUpdated) {
    // * Obtaining priority data if exists
    let priorityData = null;
    try {
      priorityData = await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (priorityData === false) return false;

    // * If priority data does not exists, create it
    if (!priorityData) {
      priorityData = { rcrs: [], status: "elaborating", closing_date: None };
    }
    /*
    // * Updating priority data
    // . Check if there is an id at the issues array
    let newId = 1;
    for (const issue of priorityData.issues) {
      newId = issue.id + 1;
    }

    newPriorityData["id"] = newId;
    priorityData.issues.push(newPriorityData);
*/

    // * Updating priority data
    priorityData.rcrs = rcrsUpdated;

    // * Updating the environment
    try {
      await EnvironmentRepository.updatePriority(id, priorityData);

      //await EnvironmentRepository.updatePriority(id, priorityData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updatePriorityDataWithStatus(id, closingDate, status, rcrs) {
    // * Obtaining priority data if exists
    let priorityData = null;
    try {
      priorityData = await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If does not exists, return it
    if (!priorityData) return priorityData;

    // * Otherwise, update its closingDate and status
    priorityData.status = status;
    priorityData.closing_date = closingDate;
    priorityData.rcrs = rcrs;

    // * Updating the environment
    try {
      await EnvironmentRepository.updatePriority(
        id,
        priorityData,
        "waiting_rcr_priority"
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Sending e-mail to the voting users of the environment
    const votingUsers = await EnvironmentRepository.getVotingUsers(id);
    const environmentName = await EnvironmentRepository.getEnvironmentName(id);

    for (const votingUserEnvironment of votingUsers) {
      const subject = `SECO - RCR: ${environmentName.name} (priority RCR voting started)`;
      let emailText = `The priority RCR voting for the environment ${environmentName.name} started!\n`;
      emailText += `As you voted on the definition of this environment, this is an invitation for you to collaborate in the priority voting of this environment.\n`;
      emailText += `To vote, please, access this link: <a>${process.env.CLIENT_URL_BASE}environment/${id}/priorityvote</a>\n`;

      try {
        await APIRequests.sendEmail(
          votingUserEnvironment.VotingUser.email,
          subject,
          emailText
        );
      } catch (e) {
        console.log(e);
      }
    }

    return true;
  }

  static async updateFinalData(id, rcrsUpdated) {
    // * Obtaining priority data if exists
    let finalData = null;
    try {
      finalData = await EnvironmentRepository.getFinalRcr(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (finalData === false) return false;

    // * If priority data does not exists, create it
    if (!finalData) {
      finalData = { rcrs: [], status: "elaborating", closing_date: None };
    }

    // * Updating priority data
    finalData.rcrs = rcrsUpdated;

    // * Updating the environment
    try {
      await EnvironmentRepository.updateFinalRcr(id, finalData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updateFinalDataAndCloseEnvironment(id, rcrs) {
    // * Obtaining priority data if exists
    let finalData = null;
    try {
      finalData = await EnvironmentRepository.getFinalRcr(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If does not exists, return it
    if (!finalData) return finalData;

    // * Otherwise, update its closingDate and status
    finalData.rcrs = rcrs;

    // * Updating the environment
    try {
      await EnvironmentRepository.updateFinalRcr(id, finalData, "done");
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async getMiningData(id) {
    try {
      return await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getTopicData(id) {
    try {
      return await EnvironmentRepository.getTopicData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getTopicsInfo(id) {
    try {
      return await EnvironmentRepository.getTopicsInfo(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getTopicDataByTopicAndPage(id, topicNum, page) {
    let topicData = null;

    try {
      topicData = await EnvironmentRepository.getTopicDataByTopicAndPage(
        id,
        topicNum,
        page
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!topicData) return topicData;

    // * Obtaining the issues from the mining data
    // . Filtering the relatedToIssuesId
    let relatedToIssuesID = topicData.map((issue) => {
      return issue.relatedTo.map((issue) => issue.id);
    });
    relatedToIssuesID = relatedToIssuesID.flat(); // * Converting the array of arrays into a single array
    relatedToIssuesID = [...new Set(relatedToIssuesID)]; // * Removing duplicates
    relatedToIssuesID = relatedToIssuesID.sort((a, b) => a - b); // * Ordering the relatedToIssuesId

    // . Querying the mining data
    if (relatedToIssuesID.length > 0) {
      let queriedData = null;
      try {
        queriedData = await EnvironmentRepository.getMiningDataByIssuesID(
          id,
          relatedToIssuesID
        );
      } catch (e) {
        console.log(e);
        return -1;
      }

      if (!queriedData.issues) return queriedData;

      // * Joining the relatedToIssuesData with the topic data
      for (const issue of topicData) {
        for (const related of issue.relatedTo) {
          const moreDataOfRelatedTo = queriedData.issues.find(
            (issue) => issue.id === related.id
          );

          related.relatedToScore = parseFloat(related.score).toFixed(5);
          delete related.score;

          Object.assign(related, moreDataOfRelatedTo);
        }
      }

      // * Querying the topicScore for the issues at the relatedTo
      queriedData = null;
      try {
        queriedData =
          await EnvironmentRepository.getTopicScoresByTopicAndIssuesID(
            id,
            topicNum,
            relatedToIssuesID
          );
      } catch (e) {
        console.log(e);
        return -1;
      }

      if (!queriedData) return queriedData;

      // * Joining the topicScore with the topic data
      for (const issue of topicData) {
        for (const related of issue.relatedTo) {
          const topicScore = queriedData.issuesAndScore.find(
            (topicIssue) => parseInt(topicIssue.id) === related.id
          );

          related.score = parseFloat(topicScore.topicScore).toFixed(5);
        }
      }
    }
    return topicData;
  }

  static async getDefinitionData(id) {
    try {
      return await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getPriorityData(id) {
    try {
      return await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getFinalData(id) {
    try {
      return await EnvironmentRepository.getFinalRcr(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getVotingUsersByEnvironmentId(id) {
    try {
      return await EnvironmentRepository.getVotingUsers(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getDefinitionRCRByEnvironmentIdAndIssueId(id, issueId) {
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!definitionData) return definitionData;

    let rcrsFounded = [];
    const issueToBeFound = parseInt(issueId);
    for (const rcr of definitionData.rcrs) {
      if (
        rcr.mainIssue === issueToBeFound ||
        rcr.relatedToIssues.includes(issueToBeFound)
      ) {
        delete rcr.relatedToIssues;
        rcrsFounded.push(rcr);
      }
    }

    return rcrsFounded;
  }

  static async getPriorityRCRByEnvironmentIdAndIssueId(id, issueId) {
    // * TODO
  }

  static async getDefinitionDataForVoting(id) {
    // * Check if the environment is in the right status
    let environment = null;
    try {
      environment = await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    if (environment.status !== "waiting_rcr_voting") return -2;

    let definitionData = null;
    let miningData = null;
    let topicData = null;

    // * Obtaining mining data if exists
    try {
      miningData = await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Obtaining topic data if exists
    try {
      topicData = await EnvironmentRepository.getTopicData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Obtaining definition data if exists
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!miningData) return miningData;
    if (!definitionData) return definitionData;
    if (!topicData) return topicData;

    // * Filtering the rcrs who are going to vote
    definitionData.rcrs = definitionData.rcrs.filter((rcr) => {
      return rcr.going_to_vote === true;
    });

    // * Joining data with EnvironmentUtils
    definitionData = EnvironmentUtils.joinMiningAndDefinition(
      miningData,
      definitionData
    );

    // * Inputting data into environment object
    environment.definition_data = definitionData;

    return environment;
  }

  static async getPriorityDataForVoting(id) {
    // * Check if the environment is in the right status
    let environment = null;
    try {
      environment = await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    if (environment.status !== "waiting_rcr_priority") return -2;

    let priorityData = null;
    let miningData = null;

    // * Obtaining mining data if exists
    /*try {
      miningData = await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }*/

    // * Obtaining definition data if exists
    try {
      priorityData = await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    //if (!miningData) return miningData;
    if (!priorityData) return priorityData;

    // * Filtering the rcrs who are going to vote
    priorityData.rcrs = priorityData.rcrs.filter((rcr) => {
      return rcr.exclude_to_priority === false;
    });

    /*// * Joining data with EnvironmentUtils
    priorityData = EnvironmentUtils.joinMiningAndDefinition(
      miningData,
      priorityData
    );*/

    // * Inputting data into environment object
    environment.priority_data = priorityData;

    return environment;
  }

  static async getFinalDataForReport(id) {
    // * Check if the environment is in the right status
    let environment = null;
    try {
      environment = await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    if (environment.status !== "done") return -2;

    let finalData = null;
    let miningData = null;

    // * Obtaining mining data if exists
    try {
      miningData = await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Obtaining definition data if exists
    try {
      finalData = await EnvironmentRepository.getFinalRcr(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!miningData) return miningData;
    if (!finalData) return finalData;

    // * Filtering the rcrs who are going to vote
    finalData.rcrs = finalData.rcrs.filter((rcr) => {
      return rcr.exclude_to_priority === false;
    });

    // * Joining data with EnvironmentUtils
    finalData = EnvironmentUtils.joinMiningAndFinal(miningData, finalData);
    // * Inputting data into environment object
    environment.final_data = finalData;

    return environment;
  }

  static async clone(id, newName) {
    // * Obtaining environment data
    let environment = null;
    try {
      environment = await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    // * Creating new environment
    let newEnvironment = {
      name: newName,
      user_id: environment.user_id,
      mining_type: environment.mining_type,
      organization_name: environment.organization_name,
      details: environment.details,
      repos: environment.repos,
      status: "topics_done",
      mining_data: null,
      topic_data: null,
      definition_data: null,
      priority_data: null,
      final_data: null,
      filter_type: environment.filter_type,
      keywords: environment.keywords,
    };

    // * Obtaining mining_data
    let dataSearch = null;
    try {
      dataSearch = await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (dataSearch) {
      newEnvironment.mining_data = dataSearch;
    }

    // * Obtaining topic_data
    dataSearch = null;
    try {
      dataSearch = await EnvironmentRepository.getTopicData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (dataSearch) {
      newEnvironment.topic_data = dataSearch;
    }

    // * Checking if has definition data
    dataSearch = null;
    try {
      dataSearch = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (dataSearch) {
      newEnvironment.definition_data = dataSearch;
    }

    // * Creating the new environment
    try {
      newEnvironment = await EnvironmentRepository.create(newEnvironment);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!newEnvironment) return newEnvironment;

    // * Sending e-mail to the user
    const user = await UserRepository.getById(environment.user_id);
    const subject = `SECO - RCR: ${newEnvironment.name} created`;
    let emailText = `<br/>${user.name}, your environment ${environment.name} was cloned!\n`;
    emailText += `<br/><strong>Environment name</strong>: ${newEnvironment.name}\n`;
    emailText += `<br/><strong>Mining type</strong>: ${newEnvironment.mining_type}\n`;
    emailText += `<br/><strong>Repositories</strong>: ${newEnvironment.repos.join(
      ", "
    )}\n`;
    if (newEnvironment.mining_type === "organization") {
      emailText += `<br/><strong>Organization name</strong>: ${newEnvironment.organization_name}\n`;
    }
    emailText += `<br/><strong>Details</strong>: ${newEnvironment.details}\n`;

    try {
      await APIRequests.sendEmail(user.email, subject, emailText);
    } catch (e) {
      console.log(e);
    }

    return newEnvironment;
  }

  static async getIssueFromMiningData(environmentId, issueId) {
    // * Obtaining mining data
    let issueData = null;
    try {
      issueData = await EnvironmentRepository.getIssuesFromMiningData(
        environmentId
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!issueData) return issueData;

    // * Obtaining issue
    let issue = null;
    for (const issueIterated of issueData) {
      if (issueIterated.id === issueId) {
        issue = issueIterated;
        break;
      }
    }

    return issue ? issue : -2;
  }

  static async endDefinitionVoting(id) {
    // * Obtaining environment data
    let environment = null;
    try {
      environment = await EnvironmentRepository.getDefinitionVoteForEnding(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    // . Updating environment status
    let updateStatus = null;
    try {
      updateStatus = await EnvironmentRepository.updateStatus(
        id,
        "processing_rcr_voting"
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (updateStatus === -1) {
      console.log(`Error updating the status of the environment with ID ${id}`);
      return -1;
    }

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getDefinitionVotesOfEnvironment(id);
    } catch (e) {
      console.log(`Error getting the votes for the environment with ID ${id}`);
    }

    if (votes === null) {
      console.log(`Error getting the votes for the environment with ID ${id}`);
    }

    // . Joining all object from the arrays inside votes array into a single array
    votes = votes.flat();

    // . Joining the definition data with the votes
    const priorityData = EnvironmentUtils.joinDefinitionDataWithVotes(
      environment.definition_data,
      votes
    );

    // . Updating the status of the environment and defining priority RCRs
    let updated = null;
    try {
      updated = await EnvironmentRepository.updatePriority(
        id,
        priorityData,
        "rcr_voting_done"
      );
    } catch (e) {
      console.log(e);
    }

    if (updated === -1) {
      console.log(`Error updating the status of the environment with ID ${id}`);
    }

    // . Ending the status of the definitionData for the environment
    let definitionDataUpdated = null;
    try {
      definitionDataUpdated =
        await EnvironmentRepository.endDefinitionVoteForEnvironment(id);
    } catch (e) {
      console.log(e);
    }

    if (definitionDataUpdated === -1) {
      console.log(
        `Error ending the definitionData status for the environment with ID ${id}`
      );
    }

    // . Sending the email to the user who created the environment
    const subject = `SECO - RCR: ${environment.name} definition rcr voting completed`;
    let emailText = `The RCR voting for your environment ${environment.name} was completed and processed!`;
    emailText += `<br/>You can log on the system to see the results.\n`;

    try {
      await APIRequests.sendEmail(environment.User.email, subject, emailText);
    } catch (e) {
      console.log(e);
    }
    return true;
  }

  static async endPriorityVoting(id) {
    // * Obtaining environment data
    let environment = null;

    try {
      environment = await EnvironmentRepository.getPriorityVoteForEnding(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    // . Updating environment status
    let updateStatus = null;
    try {
      updateStatus = await EnvironmentRepository.updateStatus(
        id,
        "processing_rcr_priority"
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (updateStatus === -1) {
      console.log(`Error updating the status of the environment with ID ${id}`);
      return -1;
    }

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getPriorityVotesOfEnvironment(id);
    } catch (e) {
      console.log(`Error getting the votes for the environment with ID ${id}`);
    }

    if (votes === null) {
      console.log(`Error getting the votes for the environment with ID ${id}`);
    }

    // . Joining all object from the arrays inside votes array into a single array
    votes = votes.flat();

    // . Joining the definition data with the votes
    const finalData = EnvironmentUtils.joinPriorityDataWithVotes(
      environment.priority_data,
      votes
    );

    // . Updating the status of the environment and defining priority RCRs
    let updated = null;
    try {
      updated = await EnvironmentRepository.updateFinalRcr(
        id,
        finalData,
        "rcr_priority_done"
      );
    } catch (e) {
      console.log(e);
    }

    if (updated === -1) {
      console.log(`Error updating the status of the environment with ID ${id}`);
    }

    // . Ending the status of the priorityData for the environment
    let priorityDataUpdated = null;
    try {
      priorityDataUpdated =
        await EnvironmentRepository.endPriorityVoteForEnvironment(id);
    } catch (e) {
      console.log(e);
    }

    if (priorityDataUpdated === -1) {
      console.log(
        `Error ending the definitionData status for the environment with ID ${id}`
      );
    }

    // . Sending the email to the user who created the environment
    const subject = `SECO - RCR: ${environment.name} definition rcr voting completed`;
    let emailText = `The RCR voting for your environment ${environment.name} was completed and processed!`;
    emailText += `<br/>You can log on the system to see the results.\n`;

    try {
      await APIRequests.sendEmail(environment.User.email, subject, emailText);
    } catch (e) {
      console.log(e);
    }
    return true;
  }

  static async endDefinitionRCRAndGoToPriorityRCR(id, finalPriorityData) {
    // * Obtaining environment data
    let environment = null;

    try {
      environment = await this.updatePriorityData(id, finalPriorityData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment || environment === -1) return environment;

    try {
      environment = await EnvironmentRepository.getPriorityVoteForEnding(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    // . Updating environment status
    let updateStatus = null;
    try {
      updateStatus = await EnvironmentRepository.updateStatus(
        id,
        "processing_rcr_priority"
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (updateStatus === -1) {
      console.log(`Error updating the status of the environment with ID ${id}`);
      return -1;
    }

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getPriorityVotesOfEnvironment(id);
    } catch (e) {
      console.log(`Error getting the votes for the environment with ID ${id}`);
    }

    if (votes === null) {
      console.log(`Error getting the votes for the environment with ID ${id}`);
    }

    // . Joining all object from the arrays inside votes array into a single array
    votes = votes.flat();

    // . Joining the definition data with the votes
    const finalData = EnvironmentUtils.joinPriorityDataWithVotes(
      environment.priority_data,
      votes
    );

    // . Updating the status of the environment and defining priority RCRs
    let updated = null;
    try {
      updated = await EnvironmentRepository.updateFinalRcr(
        id,
        finalData,
        "rcr_priority_done"
      );
    } catch (e) {
      console.log(e);
    }

    if (updated === -1) {
      console.log(`Error updating the status of the environment with ID ${id}`);
    }

    // . Ending the status of the priorityData for the environment
    let priorityDataUpdated = null;
    try {
      priorityDataUpdated =
        await EnvironmentRepository.endPriorityVoteForEnvironment(id);
    } catch (e) {
      console.log(e);
    }

    if (priorityDataUpdated === -1) {
      console.log(
        `Error ending the definitionData status for the environment with ID ${id}`
      );
    }

    // . Sending the email to the user who created the environment
    const subject = `SECO - RCR: ${environment.name} definition rcr voting completed`;
    let emailText = `The RCR voting for your environment ${environment.name} was completed and processed!`;
    emailText += `<br/>You can log on the system to see the results.\n`;

    try {
      await APIRequests.sendEmail(environment.User.email, subject, emailText);
    } catch (e) {
      console.log(e);
    }
    return true;
  }

  static async countVotesForEnvironment(id, status) {
    let votes = null;

    try {
      if (status === "definition") {
        votes = await VotingUserRepository.countDefinitionVotesOfEnvironment(
          id
        );
      }
      if (status === "priority") {
        votes = await VotingUserRepository.countPriorityVotesOfEnvironment(id);
      }
    } catch (e) {
      console.log(
        `CRON: Error getting the votes count for the environment with ID ${id}`
      );
      return -1;
    }

    if (votes === null) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${id}`
      );
    }

    return votes;
  }

  static async hasDefinitionRCR(id) {
    try {
      return await EnvironmentRepository.hasDefinitionRCR(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getDefinitionDataNew(id) {
    // * Check if the environment is in the right status
    let environment = null;
    try {
      environment = await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!environment) return environment;

    // * Obtaining mining data if exists
    let miningData = null;
    try {
      miningData = await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!miningData) return miningData;

    // * Obtaining definition data if exists
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!definitionData) return definitionData;

    // * Joining data with EnvironmentUtils
    definitionData = EnvironmentUtils.joinMiningAndDefinition(
      miningData,
      definitionData
    );

    return definitionData;
  }
}

module.exports = Environment;
