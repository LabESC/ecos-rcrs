// * Importando as bibliotecas
const express = require("express");
const cors = require("cors");
const app = express();

// * Definindo porta do serv idor e ativando cors
app.use(cors());
app.set("port", process.env.PORT || 3001);

// * Definindo como json o servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require("./controller/GitHub.js"));
app.use(require("./controller/Email.js"));
app.use(require("./controller/DB.js"));

module.exports = app;
