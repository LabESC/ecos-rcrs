const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const UserRepository = require("../repository/User");
const APIRequests = require("./APIRequests");
const config = require("../config");
const AccessCodeUtil = require("../utils/AccessCode");
const EmailValidation = require("../validations/Email");

class User {
  /**
   * Retrieves all users.
   * @returns {Array<User>|null|-1} An array of users if at least one exists, null if does not have users, or -1 if an error occurred.
   */
  static async getAll() {
    try {
      const users = await UserRepository.getAll();
      return users.length !== 0 ? users : null;
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  /**
   * Retrieves a user by their ID.
   * @param {uuidv4} id - The ID of the user.
   * @returns {Object|-1} A promise that resolves to the user object if found, or -1 if an error occurred.
   */
  static async getById(id) {
    try {
      return await UserRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  /**
   * Creates a new user.
   *
   * @param {Object} user - The user object containing the user's information.
   * @returns {Object|-1|-2|-3} Returns the newly created user object if successful, or an error code if unsuccessful: -1 for server error, -2 for invalid e-mail, -3 for user already exists.
   */
  static async create(user) {
    // * Check if user already exists
    let userExists = null;

    try {
      userExists = await UserRepository.existsByEmail(user.email);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (userExists) {
      return -3;
    }

    // * Checking if e-mail is valid (format and domain)
    const email = user.email;
    const emailValidation = await EmailValidation.validate(email);

    if (!emailValidation) {
      return -2;
    }

    // * Hashing password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(user.password, salt);

    // * Registering user
    let newUser = null;

    try {
      newUser = await UserRepository.create(user, password);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!newUser) {
      return -1;
    }

    // * Sending e-mail to confirm account
    let emailText = `${user.name}, your account was created with success!\n`;
    emailText += `<br/>Name: ${user.name}\n`;
    emailText += `<br/>E-mail: ${user.email}\n`;
    emailText += `<br/>To activate your account, visit: ${config.clientUrlBase}/activate?id=${newUser.id}\n`;

    try {
      await APIRequests.sendEmail(
        user.email,
        "SECO - RCR: Account created",
        emailText
      );
    } catch (e) {
      console.log(e);
    }

    return newUser;
  }

  /**
   * Updates a user's information.
   *
   * @param {object} user - The updated user object.
   * @param {uuidv4} id - The ID of the user to be updated.
   * @returns {null|boolean|-1|-2|-3} Returns null if the user doesn't exist, if successful, returns true, otherwise, return the update status code: -1 for server error, -2 for invalid e-mail, -3 for user already exists.
   */
  static async update(user, id) {
    // * Check if user exists
    let userExistsId = null;

    try {
      userExistsId = await UserRepository.getIdByEmail(user.email);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (userExistsId && userExistsId !== id) {
      return -3;
    }

    // * Checking if new e-mail is valid (format and domain)
    if (user.email !== undefined && user.email !== null) {
      const email = user.email;
      const emailValidation = EmailValidation.validate(email);

      if (!emailValidation) {
        return -2;
      }
    }

    // * Hashing password if a new one was provided
    let newPassword = null;
    if (user.password !== undefined && user.password !== null) {
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(user.password, salt);
    }

    // * Updating user
    try {
      const update = await UserRepository.updateById(
        id,
        user.name || null,
        user.email || null,
        newPassword
      );

      if (update === null) return update;
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Sending e-mail to confirm update
    let emailText = `${user.name}, your personal data was updated with success!\n`;
    emailText += `<br/>Name: ${user.name}\n`;
    emailText += `<br/>E-mail: ${user.email}\n`;

    try {
      await APIRequests.sendEmail(
        user.email,
        "SECO - RCR: Personal data updated",
        emailText
      );
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  /**
   * Authenticates a user with the given email and password.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {{ id: string, token: string } | null|-1} An object containing the user's id and token if authentication is successful, null if authentication fails, or -1 if occurred a server error.
   */
  static async authenticate(email, password) {
    try {
      const user = await UserRepository.authenticate(email, password);

      if (!user) {
        return null;
      }

      if (user == 1 || user == 2) {
        return user;
      }

      return { id: user.id, token: user.token };
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  /**
   * Inactivates a user by their ID.
   * @param {uuidv4} id - The ID of the user to be inactivated.
   * @returns {boolean|-1} - True if the user was successfully inactivated, or false if the user was not found, or -1 if occurred a server error.
   */
  static async inactivate(id) {
    try {
      return await UserRepository.inactivate(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  /**
   * Activate an user by its id.
   * @param {uuidv4} id - The user id to be activated.
   * @returns {boolean|null|-1} - True if the user was successfully activated, null if the user is already active, false if the user does not exist or -1 if occurred a server error.
   */
  static async activate(id) {
    try {
      return await UserRepository.activate(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  /**
   * Validates a token for a given user ID.
   * @param {uuidv4} id - The user ID.
   * @param {uuidv4} token - The token to be validated.
   * @returns {boolean|null|-1} - True if the token is valid, false if the token is invalid, null if the user does not exist, or -1 if occurred a server error.
   */
  static async validateToken(id, token) {
    try {
      return await UserRepository.validateToken(id, token);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  /**
   * Generates a token for password reset and sends it to the user's email.
   * @param {string} email - The email of the user.
   * @returns {boolean|null|-1} Returns true if the token is successfully generated and sent, returns null if the user is not found, returns -1 if there is an error during the process.
   */
  static async getTokenForPassword(email) {
    const accessCode = AccessCodeUtil.generate();

    let user = null;
    try {
      user = await UserRepository.setTokenForPassword(email, accessCode);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!user) {
      return user;
    }

    let emailText = `${user.name}, here's the token for your password reset:\n`;
    emailText += `<br/><h4> <strong> ${user.token}\n`;

    try {
      await APIRequests.sendEmail(
        user.email,
        "SECO - RCR: Password reset token",
        emailText
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  /**
   * Validates a token by email.
   * @param {string} email - The email to validate.
   * @param {string} token - The token to validate.
   * @returns {boolean|uuidv4|-1} - Returns the user ID if the token is valid, returns false if the token is invalid or if the user does not exists, returns -1 if there is an error during the process.
   */
  static async validateTokenByEmail(email, token) {
    try {
      return await UserRepository.validateTokenByEmail(email, token);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async updatePassword(email, password, token) {
    // * Check if token is valid
    let userId = null;
    try {
      userId = await UserRepository.validateTokenByEmail(email, token);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!userId) {
      return false;
    }

    // * Hashing password
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    // * Updating password
    let user = null;
    try {
      user = await UserRepository.updatePassword(email, newPassword);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Sending e-mail to confirm password update
    let emailText = `${user.name}, your password was updated with success!\n`;

    try {
      await APIRequests.sendEmail(
        user.email,
        "SECO - RCR: Password updated",
        emailText
      );
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = User;
