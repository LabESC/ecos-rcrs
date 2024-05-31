// Importando pacotes
const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");

// Instantiate winkNLP.
const nlp = winkNLP(model);
const its = nlp.its;

function lemmatize(text) {
  // Tokenize input text.
  try {
    const tokens = nlp.readDoc(text).tokens();
    // Lemmatize tokens.
    const lemmas = tokens.out(its.lemma);
    // Return lemmas as string.
    return lemmas.join(" ");
  } catch (e) {
    console.log(e);
    return text;
  }
}

module.exports = { lemmatize };
