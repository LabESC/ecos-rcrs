const { v4: uuidv4 } = require("uuid");

// ! Importando modelos
const EnvironmentModel = require("../database/db").Environment;
const VotingUserModel = require("../database/db").VotingUser;
const VotingUserEnvironment = require("../database/db").VotingUserEnvironment;

class VotingUser {
  /**
   * Retrieves all voting users.
   * @returns {Array<VotingUserModel>} An array of voting users.
   */
  static async getAll() {
    return await VotingUserModel.findAll();
  }

  /**
   * Creates a new voting user.
   * @param {string} email - The email of the voting user.
   * @returns {VotingUserModel} - The newly created voting user.
   */
  static async create(email) {
    const newVotingUser = await VotingUserModel.create({ email: email });

    return newVotingUser;
  }

  /**
   * Retrieves a voting user by its e-mail.
   * @param {string} email - The e-mail of the voting user.
   * @returns {VotingUserModel} - A voting user object.
   */
  static async getByEmail(email) {
    return await VotingUserModel.findOne({
      where: { email: email },
    });
  }

  /**
   * Validates the access code for a given email.
   * @param {string} email - The email of the voting user.
   * @param {string} accessCode - The access code received to validate.
   * @returns {boolean|null} - Returns true if the access code is valid, false if it is not valid, or null if the voting user does not exist.
   */
  static async validateAccessCodeByEmail(email, accessCode) {
    const votingUser = await VotingUserModel.findOne({
      where: { email: email },
    });

    if (votingUser === null) return votingUser;

    return votingUser.access_code === accessCode;
  }

  /**
   * Validates the access code of a voting user by their ID.
   * @param {uuidv4} id - The ID of the voting user.
   * @param {string} accessCode - The access code to validate.
   * @returns {boolean|null} - A promise that resolves to a boolean indicating whether the access code is valid or null if the voting user does not exist.
   */
  static async validateAccessCodeById(id, accessCode) {
    const votingUser = await VotingUserModel.findOne({
      where: { id: id },
    });

    if (votingUser === null) return votingUser;

    return votingUser.access_code === accessCode;
  }

  /**
   * Generates an access code for a voting user.
   * @param {string} email - The email of the voting user.
   * @param {string} accessCode - The access code to be generated.
   * @returns {number} - The number of rows affected.
   */
  static async updateAccessCode(email, accessCode) {
    return await VotingUserModel.update(
      { access_code: accessCode },
      { where: { email: email } }
    );
  }

  /**
   * Registers the definition votes for a voting user in a specific environment.
   * @param {uuidv4} id - The ID of the voting user.
   * @param {uuidv4} environmentId - The ID of the environment.
   * @param {Object} votes - The object containing details of votes for the definition.
   * @returns {VotingUserEnvironment} The created VotingUserEnvironment object.
   */
  static async registerDefinitionVotes(id, environmentId, votes) {
    let votingUserEnvironment = await VotingUserEnvironment.findOne({
      where: { voting_user_id: id, environment_id: environmentId },
    });

    // * If the relation does not exist, create a new one.
    if (votingUserEnvironment === null) {
      votingUserEnvironment = await VotingUserEnvironment.create({
        voting_user_id: id,
        environment_id: environmentId,
      });
    }

    // * Update the definition votes.
    votingUserEnvironment.votes_rcr_definition = votes;
    await votingUserEnvironment.save();
    /*votingUserEnvironment.update({
      votes_rcr_definition: votes,
    });*/

    // * Removing token from the votingUser
    const votingUser = await VotingUserModel.findOne({
      where: { id: id },
    });

    votingUser.access_code = null;
    await votingUser.save();
    return votingUserEnvironment;
  }

  /**
   * Registers the priority votes for a voting user in a specific environment.
   * @param {uuidv4} id - The ID of the voting user.
   * @param {uuidv4} environmentId - The ID of the environment.
   * @param {Object} votes - The priority votes to be registered.
   * @returns {VotingUserEnvironment|null} - The number of rows affected or null if the relation of voting user and environment does not exist.
   */
  static async registerPriorityVotes(id, environmentId, votes) {
    let votingUserEnvironment = await VotingUserEnvironment.findOne({
      where: { voting_user_id: id, environment_id: environmentId },
    });

    // * If the relation does not exist, create a new one.
    if (votingUserEnvironment === null) {
      votingUserEnvironment = await VotingUserEnvironment.create({
        voting_user_id: id,
        environment_id: environmentId,
      });
    }

    // * Update the priority votes.
    votingUserEnvironment = await votingUserEnvironment.update({
      votes_rcr_priority: votes,
    });

    // * Removing token from the votingUser
    const votingUser = await VotingUserModel.findOne({
      where: { id: id },
    });
    votingUser.access_code = null;
    await votingUser.save();

    return votingUserEnvironment;
  }
}

module.exports = VotingUser;
