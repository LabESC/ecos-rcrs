const EnvironmentRepository = require("../repository/Environment");
const EnvironmentService = require("../service/Environment");
const VotingUserRepository = require("../repository/VotingUser");
const EnvironmentUtils = require("../utils/Environment");
const APIRequests = require("./APIRequests");

async function updateEnvironmentsDefinitionVotingStatus() {
  // . Getting all the environments that has the status "waiting_rcr_voting" and the closing_date is less than the current date
  let environments = null;
  try {
    environments =
      await EnvironmentRepository.getDefinitionVoteExpiredEnvironments();
  } catch (e) {
    console.log(e);
    return -1;
  }

  if (environments.length === 0) {
    console.log("CRON: No environments to update definition vote status");
    return false;
  }

  // . Updating the status of the environments
  for (let environment of environments) {
    await EnvironmentService.endDefinitionVoting(environment.id);
    /*environment = await EnvironmentRepository.getDefinitionVoteForEnding(
      environment.id
    );

    const definitionData = environment.definition_data;

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getDefinitionVotesOfEnvironment(
        environment.id
      );
    } catch (e) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${environment.id}`
      );
      continue;
    }

    if (votes === null) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${environment.id}`
      );
      continue;
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
        environment.id,
        priorityData,
        "rcr_voting_done"
      );
    } catch (e) {
      console.log(e);
      continue;
    }

    if (updated === -1) {
      console.log(
        `CRON: Error updating the status of the environment with ID ${environment.id}`
      );
      continue;
    }

    // . Ending the status of the definitionData for the environment
    let definitionDataUpdated = null;
    try {
      definitionDataUpdated =
        await EnvironmentRepository.endDefinitionVoteForEnvironment(
          environment.id
        );
    } catch (e) {
      console.log(e);
    }

    if (definitionDataUpdated === -1) {
      console.log(
        `CRON: Error ending the definitionData status for the environment with ID ${environment.id}`
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
      continue;
    }*/
  }

  return true;
}

async function updateEnvironmentsPriorityVotingStatus() {
  // . Getting all the environments that has the status "waiting_rcr_priority" and the closing_date is less than the current date
  let environments = null;
  try {
    environments =
      await EnvironmentRepository.getPriorityVoteExpiredEnvironments();
  } catch (e) {
    console.log(e);
    return -1;
  }

  if (environments.length === 0) {
    console.log("CRON: No environments to update priority vote status");
    return false;
  }

  // . Updating the status of the environments
  for (let environment of environments) {
    await EnvironmentService.endPriorityVoting(environment.id);

    /* environment = await EnvironmentRepository.getPriorityVoteForEnding(
      environment.id
    );

    const priorityData = environment.priority_data;

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getPriorityVotesOfEnvironment(
        environment.id
      );
    } catch (e) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${environment.id}`
      );
      continue;
    }

    if (votes === null) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${environment.id}`
      );
      continue;
    }

    // . Joining all object from the arrays inside votes array into a single array
    votes = votes.flat();

    // . Joining the priority data with the votes
    const finalData = EnvironmentUtils.joinPriorityDataWithVotes(
      priorityData,
      votes
    );

    // . Updating the status of the environment and defining final RCRs
    let updated = null;
    try {
      updated = await EnvironmentRepository.updateFinalRcr(
        environment.id,
        finalData,
        "rcr_priority_done"
      );
    } catch (e) {
      console.log(e);
      continue;
    }

    if (updated === -1) {
      console.log(
        `CRON: Error updating the status of the environment with ID ${environment.id}`
      );
      continue;
    }

    // . Ending the status of the definitionData for the environment
    let priorityDataUpdated = null;
    try {
      priorityDataUpdated =
        await EnvironmentRepository.endPriorityVoteForEnvironment(
          environment.id
        );
    } catch (e) {
      console.log(e);
    }

    if (priorityDataUpdated === -1) {
      console.log(
        `CRON: Error ending the definitionData status for the environment with ID ${environment.id}`
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
      continue;
    }*/
  }

  return true;
}

async function updateExpiringEnvironments() {
  let environments = null;
  try {
    environments = await EnvironmentRepository.getExpiredEnvironments();
  } catch (e) {
    console.log(e);
    return -1;
  }

  if (environments.length === 0) {
    console.log("CRON: No environments expired");
    return false;
  }

  for (let environment of environments) {
    if (environment.status === "mining") {
      await EnvironmentService.updateStatus(environment.id, "mining_error");
    }
    if (environment.status === "making_topics") {
      await EnvironmentService.updateStatus(environment.id, "topics_error");
    }
  }
}

module.exports = {
  updateEnvironmentsDefinitionVotingStatus,
  updateEnvironmentsPriorityVotingStatus,
  updateExpiringEnvironments,
};
