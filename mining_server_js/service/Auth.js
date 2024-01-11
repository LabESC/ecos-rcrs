const { USER_LOGIN, USER_PWD } = require("../Credentials");

/**
 * Verifica se as credenciais recebidas são válidas.
 *
 * @param {string} user Usuário a ser validado.
 * @param {string} pwd Senha a ser validada.
 *
 * @returns {boolean} Retorna true se as credenciais forem válidas, false caso contrário.
 *  **/
function validate_service_user(user, pwd) {
  return user == USER_LOGIN && pwd == USER_PWD;
}

module.exports = { validate_service_user };
