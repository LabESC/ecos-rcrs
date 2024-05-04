const { v4: uuidv4 } = require("uuid");
// ! Importando módulos do sequelize
const { Op, literal } = require("sequelize");

// ! Importando modelos
const EnvironmentModel = require("../database/db").Environment;
const UserModel = require("../database/db").User;
const VotingUserModel = require("../database/db").VotingUser;
const VotingUserEnvironment = require("../database/db").VotingUserEnvironment;
const sequelize = require("../database/db").sequelize;

const basicFields = [
  "id",
  "user_id",
  "name",
  "details",
  "mining_type",
  "filter_type",
  "keywords",
  "organization_name",
  "status",
  "repos",
];

class Environment {
  /**
   * Retrieves all environments.
   * @returns {Array<EnvironmentModel>} An array of environments.
   */
  static async getAll() {
    return await EnvironmentModel.findAll({ attributes: basicFields });
  }

  /**
   * Creates a new environment.
   * @param {Object} environmentAdd - The environment data to be added.
   * @returns {EnvironmentModel} - The newly created environment.
   */
  static async create(environmentAdd) {
    const newEnvironment = await EnvironmentModel.create(environmentAdd);

    return newEnvironment;
  }

  /**
   * Retrieves an environment by its ID.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {EnvironmentModel} - An environment object.
   */
  static async getById(id) {
    return await EnvironmentModel.findOne({
      attributes: basicFields,
      where: { id: id },
      raw: true,
    });
  }

  /**
   * Retrieves environments by user ID.
   * @param {uuidv4} userId - The ID of the user.
   * @returns {Array<EnvironmentModel>} - An array of environments.
   */
  static async getByUserId(userId) {
    return await EnvironmentModel.findAll({
      attributes: basicFields,
      where: { user_id: userId },
      raw: true,
    });
  }

  /**
   * Update an environment status.
   * @param {uuidv4} id - The environment id.
   * @param {string} status - The new environment status.
   * @returns {number} - The number of updated environments.
   */
  static async updateStatus(id, status) {
    return await EnvironmentModel.update(
      { status: status },
      { where: { id: id } }
    );
  }

  /**
   * Updates the mining data and status of an environment.
   * @param {uuidv4} id - The ID of the environment to update.
   * @param {object} miningData - The new mining data.
   * @param {string} status - The new status.
   * @returns {number} - The number of updated rows.
   */
  static async updateMining(id, miningData, status) {
    return await EnvironmentModel.update(
      { mining_data: miningData, status: status },
      { where: { id: id } }
    );
  }

  /**
   * Updates the topics of an environment.
   * @param {uuidv4} id - The ID of the environment.
   * @param {object} topicData - The updated topic data.
   * @param {string} status - The updated status.
   * @returns {number} - The number of affected rows.
   */
  static async updateTopics(id, topicData, status) {
    return await EnvironmentModel.update(
      { topic_data: topicData, status: status },
      { where: { id: id } }
    );
  }

  /**
   * Updates the definition of an environment.
   * @param {uuidv4} id - The ID of the environment.
   * @param {object} definitionData - The updated definition data.
   * @param {string|null} status - The updated status (optional).
   * @returns {number} - The number of affected rows.
   */
  static async updateDefinition(id, definitionData, status = null) {
    if (status === null) {
      return await EnvironmentModel.update(
        { definition_data: definitionData },
        { where: { id: id } }
      );
    } else {
      return await EnvironmentModel.update(
        { definition_data: definitionData, status: status },
        { where: { id: id } }
      );
    }
  }

  /**
   * Updates the priority and status of an environment.
   * @param {uuidv4} id - The ID of the environment.
   * @param {object} priorityData - The updated priority data.
   * @param {string|null} status - The updated status (optional).
   * @returns {number} - The number of affected rows.
   */
  static async updatePriority(id, priorityData, status = null) {
    if (status === null) {
      return await EnvironmentModel.update(
        { priority_data: priorityData },
        { where: { id: id } }
      );
    } else {
      return await EnvironmentModel.update(
        { priority_data: priorityData, status: status },
        { where: { id: id } }
      );
    }
  }

  /**
   * Updates the final RCR and status of an environment.
   * @param {uuidv4} id - The ID of the environment.
   * @param {string} finalRcr - The final RCR value to update.
   * @param {string|null} [status=null] - The status value to update (optional).
   * @returns {number} - The number of affected rows.
   */
  static async updateFinalRcr(id, finalRcr, status = null) {
    if (status === null) {
      return await EnvironmentModel.update(
        { final_rcr: finalRcr },
        { where: { id: id } }
      );
    } else {
      return await EnvironmentModel.update(
        { final_rcr: finalRcr, status: status },
        { where: { id: id } }
      );
    }
  }

  /**
   * Retrieves the mining data for a specific environment.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} - The mining data object.
   */
  static async getMiningData(id) {
    const data = await EnvironmentModel.findOne({
      attributes: ["mining_data"],
      where: { id: id },
    });

    if (data) {
      return data.mining_data;
    } else {
      return false;
    }
  }

  /**
   * Retrieves the topic data for a given ID.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} - The topic data object.
   */
  static async getTopicData(id) {
    const data = await EnvironmentModel.findOne({
      attributes: ["topic_data"],
      where: { id: id },
    });

    if (data) {
      return data.topic_data;
    } else {
      return false;
    }
  }

  /**
   * Retrieves the definition data of an environment by its ID.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} The definition data of the environment.
   */
  static async getDefinitionData(id) {
    const data = await EnvironmentModel.findOne({
      attributes: ["definition_data"],
      where: { id: id },
    });

    if (data) {
      return data.definition_data;
    } else {
      return false;
    }
  }

  /**
   * Retrieves the definition data of an environment by its ID filtering only the ones for voting.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} The definition data of the environment.
   */
  static async getDefinitionDataForVoting(id) {
    const data = await EnvironmentModel.findOne({
      attributes: ["definition_data"],
      where: { id: id },
    });

    if (data) {
      return data.definition_data;
    } else {
      return false;
    }
  }

  /**
   * Retrieves the priority data of an environment.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} The priority data of the environment.
   */
  static async getPriorityData(id) {
    const data = await EnvironmentModel.findOne({
      attributes: ["priority_data"],
      where: { id: id },
    });

    if (data) {
      return data.priority_data;
    } else {
      return false;
    }
  }

  /**
   * Retrieves the final data of an environment.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} The final rcr data of the environment.
   */
  static async getFinalRcr(id) {
    const data = await EnvironmentModel.findOne({
      attributes: ["final_rcr"],
      where: { id: id },
    });

    if (data) {
      return data.final_rcr;
    } else {
      return false;
    }
  }

  /**
   * Retrieves the voting users associated with a specific environment.
   * @param {uuidv4} environmentId - The ID of the environment.
   * @returns {Array<Object>} - A promise that resolves to an array of voting users.
   */
  static async getVotingUsers(environmentId) {
    return await VotingUserEnvironment.findAll({
      attributes: [],
      where: { environment_id: environmentId },
      include: [
        {
          model: VotingUserModel,
          attributes: ["email"],
        },
      ],
    });
  }

  /**
   * Retrieves the email of the user who created the environment by its ID.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} An object containing the email of the user who created the environment and the name of the environment.
   */
  static async getCreatedUserEmailByEnvironmentId(id) {
    return await EnvironmentModel.findOne({
      attributes: ["name"],
      where: { id: id },
      include: [
        {
          model: UserModel,
          attributes: ["email"],
        },
      ],
    });
  }

  /**
   * Retrieves the repositories for a given ID.
   * @param {uuidv4} id - The ID of the environment.
   * @returns {Object} - An object containing the repositories.
   */
  static async getRepos(id) {
    return await EnvironmentModel.findOne({
      attributes: ["repos"],
      where: { id: id },
    });
  }

  static async getDefinitionVoteExpiredEnvironments() {
    console.log(new Date());
    return await EnvironmentModel.findAll({
      attributes: [
        "id",
        //  "name", "definition_data"
      ],
      where: {
        status: "waiting_rcr_voting",
        "definition_data.closing_date": { [Op.lt]: new Date() },
      },
      raw: true,
      /*include: [
        {
          model: UserModel,
          attributes: ["email"],
        },
      ],*/
    });
  }

  static async getDefinitionVoteForEnding(id) {
    return await EnvironmentModel.findOne({
      attributes: ["id", "name", "definition_data"],
      where: {
        id: id,
      },
      include: [
        {
          model: UserModel,
          attributes: ["email"],
        },
      ],
    });
  }

  static async endDefinitionVoteForEnvironment(id) {
    return await EnvironmentModel.update(
      {
        definition_data: literal('definition_data || \'{"status": "done"}\''),
      },
      // Condition
      { where: { id: id } }
    );
  }

  static async getPriorityVoteExpiredEnvironments() {
    return await EnvironmentModel.findAll({
      attributes: [
        "id",
        //, "name", "priority_data"
      ],
      where: {
        status: "waiting_rcr_voting",
        "priority_data.closing_date": { [Op.lt]: new Date() },
      },
      raw: true,
      /*include: [
        {
          model: UserModel,
          attributes: ["email"],
        },
      ],*/
    });
  }

  static async getPriorityVoteForEnding(id) {
    return await EnvironmentModel.findOne({
      attributes: ["id", "name", "priority_data"],
      where: {
        id: id,
      },
      include: [
        {
          model: UserModel,
          attributes: ["email"],
        },
      ],
    });
  }

  static async endPriorityVoteForEnvironment(id) {
    return await EnvironmentModel.update(
      {
        priority_data: literal('priority_data || \'{"status": "done"}\''),
      },
      // Condition
      { where: { id: id } }
    );
  }

  static async getIssuesFromMiningData(environmentId) {
    return await EnvironmentModel.findOne({
      attributes: ["mining_data.issue"],
      where: { id: environmentId },
    });
  }

  static async updateRCRsAtPriorityData(environmentId, priorityData) {
    return await EnvironmentModel.update(
      { priority_data: priorityData },
      { where: { id: environmentId } }
    );
  }

  static async getExpiredEnvironments() {
    const currentTimeMinus24Hours = new Date() - 24 * 60 * 60 * 1000;
    return await EnvironmentModel.findAll({
      attributes: ["id", "status"],
      where: {
        status: { [Op.in]: ["mining", "making_topics"] },
        updatedAt: { [Op.lt]: currentTimeMinus24Hours },
      },
      raw: true,
    });
  }

  static async getIssuesLengthFromMiningData(environmentId) {
    const query = await sequelize.query(
      'SELECT "mining_data"->>\'issuesFilteredLength\' AS "issuesFilteredLength", "mining_data"->>\'issuesObtainedLength\' AS "issuesObtainedLength" FROM "ic"."environments" AS "Environment" WHERE "Environment"."id" = \'' +
        environmentId +
        "';"
    );

    try {
      return query[0][0];
    } catch (e) {
      return {};
    }
    /*return await EnvironmentModel.findOne({
      attributes: [
        ["mining_data->issuesFilteredLength", "issuesFilteredLength"],
        ["mining_data->issuesObtainedLength", "issuesObtainedLength"],
      ],
      where: { id: environmentId },
    });*/
  }
}

module.exports = Environment;
