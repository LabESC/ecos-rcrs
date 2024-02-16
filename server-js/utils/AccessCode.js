module.exports = class AccessCode {
  static generate() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let accessCode = "";
    for (let i = 0; i < 6; i++) {
      accessCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return accessCode;
  }
};
