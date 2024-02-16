const { v4: uuidv4 } = require("uuid");
const UserModel = require("../sqlModels").User;
const UserValidation = require("../validations/User");

const basicFields = ["id", "name", "email", "status"];

class UserRepository {
  /**
   * Retrieves all users from the database.
   * @returns {Array<UserModel>} A promise that resolves to an array of UserModel instances representing the users.
   */
  static async getAll() {
    return await UserModel.findAll({
      attributes: basicFields,
    });
  }

  /**
   * Creates a new user in the database.
   * @param {Object} user - The user object containing name and email.
   * @param {string} password_hash - The hashed password for the user.
   * @returns {UserModel} - The newly created user object.
   */
  static async create(user, password_hash) {
    const newUser = await UserModel.create({
      name: user.name,
      email: user.email,
      password: password_hash,
      status: "pending",
      token: null,
    });
    return newUser;
  }

  /**
   * Retrieves a user by their ID.
   * @param {number} id - The ID of the user.
   * @returns {UserModel} A promise that resolves to the user object.
   */
  static async getById(id) {
    return await UserModel.findOne({
      attributes: basicFields,
      where: { id: id },
    });
  }

  /**
   * Verifica se um usuário existe pelo email.
   * @param {string} email - O email do usuário a ser verificado.
   * @returns {boolean} - Uma Promise que resolve para true se o usuário existe ou false caso contrário.
   */
  static async existsByEmail(email) {
    const user = await UserModel.findOne({ where: { email: email } });
    return user !== null;
  }

  /**
   * Retrieves the ID of a user based on their email.
   * @param {string} email - The email of the user.
   * @returns {uuidv4} - The ID of the user if found, otherwise false.
   */
  static async getIdByEmail(email) {
    const user = await UserModel.findOne({
      attributes: ["id"],
      where: { email: email },
    });
    return user !== null ? user.id : false;
  }

  /**
   * Updates a user by their ID.
   * @param {uuidv4} id - The ID of the user to update.
   * @param {string|null} name - The new name for the user. Pass null to keep the current name.
   * @param {string|null} email - The new email for the user. Pass null to keep the current email.
   * @param {string|null} password - The new password for the user. Pass null to keep the current password.
   * @returns {null|UserModel} - A promise that resolves to the updated user object, or null if the user does not exist.
   */
  static async updateById(id, name = null, email = null, password = null) {
    const userDB = await UserModel.findByPk(id);

    if (userDB === null) return userDB;

    if (name !== null) userDB.name = name;
    if (email !== null) userDB.email = email;
    if (password !== null) userDB.password = password;

    await userDB.save();

    return userDB;
  }

  /**
   * Activates a user by changing their status to "active".
   * @param {uuidv4} id - The ID of the user to activate.
   * @returns {boolean|null} - A promise that resolves to true if the user was successfully activated,
   * null if the user is already active, or false if the user does not exist.
   */
  static async activate(id) {
    const user = await UserModel.findByPk(id);
    if (user === null) {
      return false;
    }

    if (user.status === "active") {
      return null;
    }

    user.status = "active";

    await user.save();
    return true;
  }

  /**
   * Inactivates a user by setting their status to "inactive" and updating the last_updated field.
   * @param {uuidv4} id - The ID of the user to be inactivated.
   * @returns {boolean} - A promise that resolves to true if the user was successfully inactivated, or false if the user does not exist.
   */
  static async inactivate(id) {
    const user = await UserModel.findByPk(id);
    if (user === null) {
      return false;
    }

    if (user.status === "active") user.status = "inactive";
    else return null;

    await user.save();

    return true;
  }

  /**
   * Authenticates a user by checking their email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {<UserModel>|null|boolean} - The authenticated user object, null if the password is invalid, or false if the user does not exist.
   */
  static async authenticate(email, password) {
    const user = await UserModel.findOne({ where: { email: email } });

    if (user === null) {
      return false;
    }

    const valid = await UserValidation.validatePassword(
      password,
      user.password.toString()
    );

    if (!valid) {
      return null;
    }

    user.token = uuidv4();
    await user.save();

    return user;
  }

  /**
   * Validates the token for a given user ID.
   * @param {uuidv4} id - The ID of the user.
   * @param {uuidv4} token - The token to be validated.
   * @returns {boolean|null|<UserModel>} - Returns a Promise that resolves to a boolean indicating whether the token is valid or not. If the user is not found, it returns null.
   */
  static async validateToken(id, token) {
    const user = await UserModel.findByPk(id);

    if (user === null) {
      return user;
    }

    return user.token === token;
  }

  /**
   * Sets the token for a user's password.
   * @param {string} email - The email of the user.
   * @param {string} token - The token to set for the user's password.
   * @returns {null|UserModel} - The updated user object or null if the user does not exist.
   */
  static async setTokenForPassword(email, token) {
    const user = await UserModel.findOne({ where: { email: email } });

    if (user === null) {
      return user;
    }

    user.token = token;

    await user.save();
    return user;
  }

  /**
   * Validates a token for a given email in the database.
   * @param {string} email - The email to validate the token for.
   * @param {uuidv4} token - The token to validate.
   * @returns {boolean|uuidv4} - Returns false if the user or token is invalid, otherwise returns the user id.
   */
  static async validateTokenByEmail(email, token) {
    const user = await UserModel.findOne({ where: { email: email } });

    if (user === null) {
      return false;
    }

    if (user.token !== token) {
      return false;
    }

    return user.id;
  }

  /**
   * Updates the password of a user in the database.
   * @param {string} email - The email of the user.
   * @param {string} password - The new password.
   * @returns {false|Object} - Returns false if user does not exists or an object containing user name and email.
   */
  static async updatePassword(email, password) {
    const user = await UserModel.findOne({ where: { email: email } });

    if (user === null) {
      return false;
    }

    user.password = password;
    //user.token = null;
    await user.save();

    return { name: user.name, email: user.email };
  }
}

module.exports = UserRepository;
