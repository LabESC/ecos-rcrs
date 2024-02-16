const bcrypt = require("bcryptjs");

module.exports = {
  /**
   * Validates a password by comparing it with a hashed password stored in the database.
   * @param {string} password - The password to be validated.
   * @param {string} passwordDB - The hashed password stored in the database.
   * @returns {boolean} - Returns true if the password is valid, false otherwise.
   */
  async validatePassword(password, passwordDB) {
    try {
      return await bcrypt.compare(password, passwordDB);
    } catch (e) {
      console.log(e);
      return null;
    }
    //return bcrypt.compareSync(password, passwordDB);
  },
};
