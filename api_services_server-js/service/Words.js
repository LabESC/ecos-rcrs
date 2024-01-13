const cheerio = require("cheerio");

// * Palavras poluentes ao texto
const wordsToRemove = ["\n", "\r", "\r\n", "\r\n\r\n", "[x]", "[X]", "[ ]"];

// Regex de link
const regexLink = /http:\/\/\S+|https:\/\/\S+/;

// Regex de código (entre ``` e ```)
const regexCode = /```[\s\S]*?```/;

/**
 * Retorna um array somente com o body das issues.
 *
 * @param {array} array - Um array de objetos do tipo issue (vindo do GitHub).
 * @return {array} Um array com o body das issues.
 **/
async function filtraArrayRequestGit(array) {
  // * Inicializando variáveis
  let arrayFiltrado = [];
  let issueId = false;
  let issueBody = null;
  let issueTags = null;

  // * Para cada issue, limpar o texto
  for (const issue of array) {
    if (issue.body != null) {
      // . Obtendo id da issue
      issueId = issue.id;

      // . Obtendo tags da issue
      issueTags =
        issue.labels.length > 0
          ? issue.labels.map((label) => label.name)
          : null;

      // . Retornar uma string com os nomes das tags separados por vírgula
      issueTags = issueTags != null ? issueTags.join(",") : null;

      // . Obtendo corpo da issue e convertendo-o para caixa baixa
      issueBody = issue.body.toLowerCase();

      // . Para cada palavra no array de palavras a remover, remova-a da string
      for (const word of wordsToRemove) {
        issueBody = issueBody.replace(word, " ");
      }

      // . Parseando o corpo da issue para um html usando o parse do cheerio
      issueBody = cheerio.load(issueBody);

      // . Removendo tags HTML do texto da issue e retornando-o como string
      issueBody = issueBody.text();

      // . Removendo links na string
      issueBody = issueBody.replace(regexLink, "");

      // . Removendo código na string
      issueBody = issueBody.replace(regexCode, "");

      // . Removendo espaços demasiados em branco
      issueBody = issueBody.replace(/\s+/g, " ");

      // . Se o corpo da issue acabar ficando nulo, retorne
      if (issueBody === null) return;

      // . Se o id da issue não for falso e o tamanho do corpo da issue for maior que 0, adicione no array
      if (issueId !== false && issueBody.length > 0) {
        arrayFiltrado.push({
          id: issueId,
          body: issueBody,
          tags: issueTags,
        });
      }
    }
  }

  // * Retorne o array filtrado
  return arrayFiltrado;
}

/***
 * Função que retorna se existe o atributo "next" em um dicionário "link"
 * @param {object} links - Um dicionário com os links presentes no atributo "links" da resposta da API do GitHub.
 * @return {boolean} Retorna se existe o atributo next no dicionário recebido.
 ***/
function hasNextLinkDict(links) {
  return "next" in links;
}

function hasNextLinkString(link) {
  if (link === null || link === undefined) return false;
  const links = link.split(",");
  for (const other_link of links) {
    const obj = other_link.split(";");
    if (obj[1].split("=")[1].includes('"next"')) return true;
  }

  return false;
}

/**
  Função que retorna um array a partir da manipulação de um dicionario com a estrutura:

    {
    "repo_name": [
      {
        "id": 1,
        "body": "content",
        "tags": "null"
      }, ...
    ], ...
  }

  Para um array da estrutura:

  [
    {
      "repo": "repo_name",
      "id": 1,
      "body": "content",
      "tags": "null"
    }, ...
  ]
 * @param {object} issues - Um dicionário definido com a estrutura acima.
 * @return {Array} Retorna o array descrito.
 **/
function formatIssuesToArray(issues) {
  const outputArray = [];

  for (const [repo, items] of Object.entries(issues)) {
    for (const item of items) {
      const outputItem = {
        repo: repo,
        id: item.id,
        body: item.body,
        tags: item.tags,
      };
      outputArray.push(outputItem);
    }
  }

  return outputArray;
}

module.exports = {
  filtraArrayRequestGit,
  hasNextLinkDict,
  hasNextLinkString,
  formatIssuesToArray,
};
