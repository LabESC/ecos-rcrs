const UserService = require("../service/User");
const config = require("../config");

class Auth {
  static async validateUser(header) {
    // * Validar se o header possui os campos necessários
    const id = header["user-id"];
    const token = header["user-token"];

    if (id === undefined || token === undefined) {
      return false;
    }

    // * Validar token do usuário existente
    const validateToken = await UserService.validateToken(id, token);

    return validateToken;
  }

  static validateService(header) {
    // * Validar se o header possui os campos necessários
    const login = header["service-login"];
    const password = header["service-pwd"];

    if (login === undefined || password === undefined) {
      return null;
    }

    // * Conferindo as credenciais necessarias para o serviço
    return (
      login === config.servicesLogin && password === config.servicesPassword
    );
  }
}

module.exports = Auth;
