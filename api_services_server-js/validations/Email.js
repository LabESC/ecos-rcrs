async function checkVariables(requestHeaders, requestBody) {
  // * Verificando existencia de variáveis
  if (!requestBody.to) return false;
  if (!requestBody.subject) return false;
  if (!requestBody.text) return false;
  if (!requestHeaders["service-login"]) return false;
  if (!requestHeaders["service-pwd"]) return false;

  // * Verificando se variáveis são do tipo correto
  if (typeof requestBody.to != "string") return false;
  if (typeof requestBody.subject != "string") return false;
  if (typeof requestBody.text != "string") return false;
  if (typeof requestHeaders["service-login"] != "string") return false;
  if (typeof requestHeaders["service-pwd"] != "string") return false;

  // * Verificando tamanho das variáveis
  if (requestBody.to.length == 0) return false;
  if (requestBody.subject.length == 0) return false;
  if (requestBody.text.length == 0) return false;
  if (requestHeaders["service-login"].length == 0) return false;
  return requestHeaders["service-pwd"].length != 0;
}

module.exports = checkVariables;
