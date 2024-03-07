const EnvironmentRepository = require("../repository/Environment");
const UserRepository = require("../repository/User");
const APIRequests = require("./APIRequests");
const EnvironmentUtils = require("../utils/Environment");
const VotingUserRepository = require("../repository/VotingUser");

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

  static async create(environment) {
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

    // * Sending e-mail to the user
    const subject = `SECO - RCR: ${environment.name} created`;
    let emailText = `<br/>${user.name}, your environment was created and the mining starts soon!\n`;
    emailText += `<br/><strong>Environment name</strong>: ${environment.name}\n`;
    emailText += `<br/><strong>Mining type</strong>: ${environment.mining_type}\n`;
    emailText += `<br/><strong>Repositories</strong>: ${environment.repos.join(
      ", "
    )}\n`;
    if (environment.mining_type === "organization") {
      emailText += `<br/><strong>Organization name</strong>: ${environment.organization_name}\n`;
    }
    emailText += `<br/><strong>Details</strong>: ${environment.details}\n`;

    try {
      await APIRequests.sendEmail(user.email, subject, emailText);
    } catch (e) {
      console.log(e);
      await EnvironmentRepository.updateStatus(
        newEnvironment.id,
        "mining_error"
      );
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

    // * Sending e-mail to the user
    const environmentUser =
      await EnvironmentRepository.getCreatedUserEmailByEnvironmentId(id);

    const subject = `SECO - RCR: ${environmentUser.name} mining done`;
    let emailText = `<br/>The mining data for your environment ${environmentUser.name} is done!\n`;
    emailText += `<br/>You need to log on the system to request the topics generation.\n`;

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

    const subject = `SECO - RCR: ${environmentUser.name} topics generation done`;
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
    if (!definitionData) {
      definitionData = { rcrs: [], status: "elaborating", closing_date: null };
    }

    // * Updating definition data
    // . Check if there is an id at the rcrs array
    let newId = 1;
    for (const rcr of definitionData.rcrs) {
      newId = rcr.id + 1;
    }

    newDefinitionData["id"] = newId;
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
    finalData.rcrs = rcrsUpdated;

    // * Updating the environment
    try {
      await EnvironmentRepository.updateFinalRcr(id, finalData);

      //await EnvironmentRepository.updatePriority(id, priorityData);
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

    // * Obtaining mining data if exists
    try {
      miningData = await EnvironmentRepository.getMiningData(id);
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
    try {
      miningData = await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Obtaining definition data if exists
    try {
      priorityData = await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!miningData) return miningData;
    if (!priorityData) return priorityData;

    // * Filtering the rcrs who are going to vote
    priorityData.rcrs = priorityData.rcrs.filter((rcr) => {
      return rcr.exclude_to_priority === false;
    });

    // * Joining data with EnvironmentUtils
    priorityData = EnvironmentUtils.joinMiningAndDefinition(
      miningData,
      priorityData
    );
    // * Inputting data into environment object
    environment.priority_data = priorityData;

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

  static async endDefinitionPoll(id) {
    // * Obtaining environment data
    let environment = null;
    try {
      environment = await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Obtaining environment data
    let definitionData = null;

    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getDefinitionVotesOfEnvironment(id);
    } catch (e) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${id}`
      );
    }

    if (votes === null) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${id}`
      );
    }

    // . Joining all object from the arrays inside votes array into a single array
    votes = votes.flat();

    // . Joining the definition data with the votes
    const priorityData = EnvironmentUtils.joinDefinitionDataWithVotes(
      definitionData,
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
      console.log(
        `CRON: Error updating the status of the environment with ID ${id}`
      );
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
        `CRON: Error ending the definitionData status for the environment with ID ${id}`
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
  }

  static async endPriorityPoll(id) {
    // * Obtaining environment data
    let environment = null;

    try {
      environment = await EnvironmentRepository.getPriorityVoteForEnding(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getPriorityVotesOfEnvironment(id);
    } catch (e) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${id}`
      );
    }

    if (votes === null) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${id}`
      );
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
      console.log(
        `CRON: Error updating the status of the environment with ID ${id}`
      );
    }

    // . Ending the status of the definitionData for the environment
    let priorityDataUpdated = null;
    try {
      priorityDataUpdated =
        await EnvironmentRepository.endPriorityVoteForEnvironment(id);
    } catch (e) {
      console.log(e);
    }

    if (priorityDataUpdated === -1) {
      console.log(
        `CRON: Error ending the definitionData status for the environment with ID ${id}`
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
}

module.exports = Environment;
