async function checkVariables(requestHeaders, requestBody) {
  // * Verificando existencia de variáveis
  if (!requestBody.repos) return false;
  if (!requestBody.environment_id) return false;
  if (!requestBody.filter_type) return false;
  if (!requestHeaders["service-login"]) return false;
  if (!requestHeaders["service-pwd"]) return false;

  // * Verificando se variáveis são do tipo correto
  if (!Array.isArray(requestBody.repos)) return false;
  if (typeof requestBody.environment_id != "string") return false;
  if (typeof requestBody.filter_type != "string") return false;
  if (requestBody.keywords !== null) {
    if (!Array.isArray(requestBody.keywords)) return false;
  }
  if (typeof requestHeaders["service-login"] != "string") return false;
  if (typeof requestHeaders["service-pwd"] != "string") return false;

  // * Verificando tamanho das variáveis
  if (requestBody.repos.length == 0) return false;
  if (requestBody.environment_id.length == 0) return false;
  if (requestBody.filter_type.length == 0) return false;
  if (requestHeaders["service-login"].length == 0) return false;
  return requestHeaders["service-pwd"].length != 0;
}

module.exports = checkVariables;
