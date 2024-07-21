const VotingUserRepository = require("../repository/VotingUser");
const EmailValidation = require("../validations/Email");
const AccessCodeUtil = require("../utils/AccessCode");
const APIRequests = require("./APIRequests");

class VotingUser {
  static async getByEmail(email) {
    try {
      return await VotingUserRepository.getByEmail(email);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async create(email) {
    // * Check if the email is already in the database
    const user = await VotingUserRepository.getByEmail(email);

    // * If the user is already in the database, return the user
    // !! CHECAR ESSE FLUXO... TALVEZ CHAMAR A FUNCAO DE GERAR TOKEN E RETORNAR O RESULTADO DELA
    if (user) {
      return { id: user.id, email: user.email };
    }

    // * Checking if e-mail is valid (format and domain)
    const emailValidation = await EmailValidation.validate(email);

    if (!emailValidation) {
      return -2;
    }

    // * Registering user
    try {
      return await VotingUserRepository.create(email);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async generateAccessCode(email) {
    // * Check if the email is already in the database
    let user = null;
    try {
      user = await VotingUserRepository.getByEmail(email);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If the user is not in the database, return an error
    if (!user) {
      return -3;
    }

    // * Generate access code
    const accessCode = AccessCodeUtil.generate();
    let result = null;
    try {
      result = await VotingUserRepository.updateAccessCode(email, accessCode);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If the register was not updated, return an error
    if (result === 0) {
      return -4;
    }

    // * Send e-mail with access code to user
    let emailText = `The access code for your vote confirm is:<br/>\n <strong> ${accessCode} </strong>`;

    try {
      await APIRequests.sendEmail(
        user.email,
        "SECO - RCR: Access Code",
        emailText
      );
    } catch (e) {
      console.log(e);
      return -2;
    }

    return true;
  }

  static async validateAccessCodeByEmail(email, accessCode) {
    // * Check if the access code is valid
    let result = false;
    try {
      result = await VotingUserRepository.validateAccessCodeByEmail(
        email,
        accessCode
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Check return
    if (result === null) {
      return -2;
    }
    if (result === false) {
      return -3;
    }

    return true;
  }

  static async registerDefinitionVotes(
    votingUserId,
    environmentId,
    votes,
    accessCode
  ) {
    // * Check if the user is already in the database
    let user = null;
    try {
      user = await VotingUserRepository.validateAccessCodeById(
        votingUserId,
        accessCode
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If the user is not in the database or the code is invalid, return an error
    if (user === null) {
      return -2;
    }
    if (user === false) {
      return -3;
    }

    // * Registering definition vote
    try {
      return await VotingUserRepository.registerDefinitionVotes(
        votingUserId,
        environmentId,
        votes
      );
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async registerPriorityVotes(
    votingUserId,
    environmentId,
    votes,
    accessCode
  ) {
    // * Check if the user is already in the database
    let user = null;
    try {
      user = await VotingUserRepository.validateAccessCodeById(
        votingUserId,
        accessCode
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If the user is not in the database or the code is invalid, return an error
    if (user === null) {
      return -2;
    }
    if (user === false) {
      return -3;
    }

    // * Registering solution vote
    try {
      return await VotingUserRepository.registerPriorityVotes(
        votingUserId,
        environmentId,
        votes
      );
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async registerAllVotes(
    votingUserId,
    environmentId,
    accessCode,
    definitionVote,
    priorityVote
  ) {
    // * Check if the user is already in the database
    let user = null;
    try {
      user = await VotingUserRepository.validateAccessCodeById(
        votingUserId,
        accessCode
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If the user is not in the database or the code is invalid, return an error
    if (user === null) {
      return -2;
    }
    if (user === false) {
      return -3;
    }

    // * Registering solution vote
    try {
      return await VotingUserRepository.registerAllVotes(
        votingUserId,
        environmentId,
        definitionVote,
        priorityVote
      );
    } catch (e) {
      console.log(e);
      return -1;
    }
  }
}

module.exports = VotingUser;
