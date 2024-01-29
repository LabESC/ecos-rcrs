async function checkVariables(requestHeaders, requestBody) {
  // * Verificando existencia de variáveis
  if (!requestBody.environment_id) return false;
  if (!requestHeaders["user-id"]) return false;
  if (!requestHeaders["user-token"]) return false;

  // * Verificando se variáveis são do tipo correto
  if (typeof requestBody.environment_id != "string") return false;
  if (typeof requestHeaders["user-id"] != "string") return false;
  if (typeof requestHeaders["user-token"] != "string") return false;

  // * Verificando tamanho das variáveis
  if (requestBody.environment_id.length == 0) return false;
  if (requestHeaders["user-id"].length == 0) return false;
  return requestHeaders["user-token"].length != 0;
}

module.exports = checkVariables;
