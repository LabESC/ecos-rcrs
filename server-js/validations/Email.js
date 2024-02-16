const { verifyEmail } = require("@devmehq/email-validator-js");
var verifier = require("@digitalroute/email-verify");

class Email {
  static async validate(email) {
    return await verifyEmail({
      emailAddress: email,
      verifyMx: true,
      timeout: 5000,
    }).then((result) => result.validFormat);
  }

  static async validateWithoutVerify(email) {
    return await verifyEmail({
      emailAddress: email,
      verifyMx: false,
      verifySmtp: false,
      timeout: 5000,
    }).then((result) => result.validFormat);
  }
}

module.exports = Email;
